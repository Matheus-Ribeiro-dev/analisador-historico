# app/crud.py
import sqlalchemy as sa
from sqlalchemy.orm import Session
from sqlalchemy import func, text, select, and_
from datetime import date
from datetime import datetime
from typing import List, Dict, Any
from . import models, schemas
from decimal import Decimal

def get_product_by_code(db: Session, product_code: str):
    """
    Busca um produto no banco de dados pelo seu código.
    """
    # SQLAlchemy
    # 1. db.query(models.Product) - Inicia uma busca na tabela 'products' no db
    # 2. .filter(models.Product.product_code == product_code) - Filtra pelo ccdigo do produto
    # 3. .first() - Pega o primeiro resultado encontrado (ou None se não houver)

    # Gracas ao "relationship" que definimos em models.py,              ---lembrar--
    # ao buscar um produto, o SQLAlchemy já traz junto o seu historico
    return db.query(models.Product).filter(models.Product.product_code == product_code).first()

#
def get_user_by_username(db: Session, username: str):
    """Busca um usuário no banco pelo seu username."""
    return db.query(models.User).filter(models.User.username == username).first()




def run_dynamic_query(db: Session, query_request: schemas.QueryRequest, estoque_sempre_atual: bool = True) -> List[Dict[str, Any]]:
    """
    QUERY DINÂMICA DE VERDADE - VERSÃO CORRIGIDA
    """

    # Mapas de dimensões disponíveis
    dim_map = {
        "nome_produto": models.DimProduto.product_name,
        "codigo_produto": models.DimProduto.product_code,
        "nome_marca": models.DimProduto.marca,
        "nome_departamento": models.DimProduto.departamento,
        "nome_classificacao": models.DimProduto.classificacao,
        "nome_grupo": models.DimProduto.grupo,
        "nome_modelo": models.DimProduto.modelo,
        "nome_fornecedor": models.DimProduto.fornecedor,
        "nome_loja": models.DimLoja.store_name,
        "mes": func.to_char(models.FatoVendas.data_venda, 'YYYY-MM')
    }

    # Identifica quais métricas o usuário quer
    metricas_pedidas = [m.nome for m in query_request.metricas]
    quer_vendas = any(m in ['venda_liquida', 'quantidade_vendida'] for m in metricas_pedidas)
    quer_estoque = any(m in ['estoque_atual', 'estoque_pdv'] for m in metricas_pedidas)

    if not quer_vendas and not quer_estoque:
        raise HTTPException(status_code=400, detail="Pelo menos uma métrica válida é necessária.")

    # Dimensões selecionadas
    dimensoes_selecionadas = [dim_map[d].label(d) for d in query_request.dimensoes if d in dim_map]
    if not dimensoes_selecionadas:
        raise HTTPException(status_code=400, detail="Pelo menos uma dimensão válida é necessária.")

    # --- QUERY DE VENDAS (se solicitada) ---
    sales_cte = None
    if quer_vendas:
        metricas_selecionadas_sql = []

        if 'venda_liquida' in metricas_pedidas:
            metricas_selecionadas_sql.append(
                func.sum(models.FatoVendas.venda_liquida).label("venda_liquida")
            )
        if 'quantidade_vendida' in metricas_pedidas:
            metricas_selecionadas_sql.append(
                func.sum(models.FatoVendas.quantidade_vendida).label("quantidade_vendida")
            )

        sales_query = (
            db.query(
                *dimensoes_selecionadas,
                *metricas_selecionadas_sql  # <-- Usa a lista que contém SÓ o que foi pedido
            )
            .join(models.DimProduto, models.FatoVendas.produto_id == models.DimProduto.id)
            .join(models.DimLoja, models.FatoVendas.loja_id == models.DimLoja.id)
            .filter(models.FatoVendas.data_venda.between(query_request.data_inicial, query_request.data_final))
        )

        # Aplica filtros nas vendas (OK)
        if query_request.filtros:
            sales_query = _apply_filters(sales_query, query_request.filtros)
        sales_cte = sales_query.group_by(*dimensoes_selecionadas).cte('sales_data')


    # --- QUERY DE ESTOQUE (se solicitada) ---
    stock_cte = None
    if quer_estoque:
        # PASSO 1: Achar a DATA MÁXIMA GERAL (independente das dimensões)
        data_limite = datetime.now().date() if estoque_sempre_atual else query_request.data_final

        data_maxima_geral = db.query(
            func.max(models.FatoEstoque.data_snapshot)
        ).filter(
            models.FatoEstoque.data_snapshot <= data_limite
        ).scalar()

        metricas_estoque_sql = []
        if 'estoque_atual' in metricas_pedidas:
            # A métrica principal do estoque (SUM do closing_stock_quantity)
            metricas_estoque_sql.append(
                func.sum(models.FatoEstoque.closing_stock_quantity).label("estoque_atual")
            )

        if 'estoque_pdv' in metricas_pedidas:
            # Exemplo: Se estoque_final for o AVG do estoque no último dia (adapte a regra real)
            metricas_estoque_sql.append(
                func.sum(models.FatoEstoque.closing_stock_sale_price).label("estoque_pdv")
            )
            # [ADICIONE OUTRAS MÉTRICAS DE ESTOQUE AQUI]

        stock_query = (
            db.query(
                *dimensoes_selecionadas,
                *metricas_estoque_sql
            )
            .join(models.DimProduto, models.FatoEstoque.produto_id == models.DimProduto.id)
            .join(models.DimLoja, models.FatoEstoque.loja_id == models.DimLoja.id)
            .filter(models.FatoEstoque.data_snapshot == data_maxima_geral)  # ⬅️ SÓ ESSA DATA!
        )

        # Aplica filtros do usuário
        if query_request.filtros:
            stock_query = _apply_filters(stock_query, query_request.filtros)

        stock_cte = stock_query.group_by(*dimensoes_selecionadas).cte('stock_data')

    # --- QUERY FINAL ---
    return _build_final_query(db, sales_cte, stock_cte, query_request, metricas_pedidas)


def _apply_filters(query, filtros: Dict):
    """Aplica filtros dinamicamente na query"""
    for coluna, valor in filtros.items():
        if coluna == "nome_loja":
            query = query.filter(models.DimLoja.store_name == valor)
        elif coluna == "nome_marca":
            query = query.filter(models.DimProduto.marca == valor)
        elif coluna == "nome_produto":
            query = query.filter(models.DimProduto.product_name == valor)
        elif coluna == "nome_departamento":
            query = query.filter(models.DimProduto.departamento == valor)
        elif coluna == "nome_classificacao":
            query = query.filter(models.DimProduto.classificacao == valor)
        elif coluna == "nome_grupo":
            query = query.filter(models.DimProduto.grupo == valor)
        elif coluna == "codigo_produto":
            query = query.filter(models.DimProduto.product_code == valor)
        elif coluna == "nome_fornecedor":
            query = query.filter(models.DimProduto.fornecedor == valor)
    return query


def _build_final_query(db, sales_cte, stock_cte, query_request, metricas_pedidas):

    # CASO 1: Só vendas
    if sales_cte is not None and stock_cte is None:
        final_query = select(sales_cte)
        resultados = db.execute(final_query).fetchall()
        return [dict(row._mapping) for row in resultados]

    # CASO 2: Só estoque
    elif stock_cte is not None and sales_cte is None:
        final_query = select(stock_cte)
        resultados = db.execute(final_query).fetchall()
        return [dict(row._mapping) for row in resultados]

    # CASO 3: Une no Python (MAIS LEVE PARA RENDER)
    elif sales_cte is not None and stock_cte is not None:
        return _merge_in_python(db, sales_cte, stock_cte, query_request, metricas_pedidas)


def _merge_in_python(db, sales_cte, stock_cte, query_request, metricas_pedidas):
    """Une resultados no Python - OTIMIZADO"""

    # Executa queries SEPARADAS (leves para o banco)
    vendas_result = db.execute(select(sales_cte)).fetchall()
    estoque_result = db.execute(select(stock_cte)).fetchall()

    # Converte para dicionários com chave das dimensões
    vendas_map = {}
    for row in vendas_result:
        row_dict = dict(row._mapping)
        key = tuple(row_dict.get(d) for d in query_request.dimensoes)
        vendas_map[key] = row_dict

    estoque_map = {}
    for row in estoque_result:
        row_dict = dict(row._mapping)
        key = tuple(row_dict.get(d) for d in query_request.dimensoes)
        estoque_map[key] = row_dict

    # Une os resultados
    merged = []
    all_keys = set(vendas_map.keys()) | set(estoque_map.keys())

    for key in all_keys:
        merged_row = {}

        # Copia dimensões da chave
        for i, dim in enumerate(query_request.dimensoes):
            if i < len(key) and key[i] is not None:
                merged_row[dim] = key[i]

        # Métricas de vendas (com fallback para 0)
        venda_data = vendas_map.get(key, {})
        if 'venda_liquida' in metricas_pedidas:
            merged_row['venda_liquida'] = venda_data.get('venda_liquida', 0)
        if 'quantidade_vendida' in metricas_pedidas:
            merged_row['quantidade_vendida'] = venda_data.get('quantidade_vendida', 0)

        # Métricas de estoque (com fallback para 0)
        estoque_data = estoque_map.get(key, {})
        if 'estoque_atual' in metricas_pedidas:
            merged_row['estoque_atual'] = estoque_data.get('estoque_atual', 0)

        if 'estoque_pdv' in metricas_pedidas:
            merged_row['estoque_pdv'] = estoque_data.get('estoque_pdv', 0)

        merged.append(merged_row)

    final_results_cleaned = []
    for row in merged:
        cleaned_row = {}
        for key, value in row.items():
            if isinstance(value, Decimal):
                cleaned_row[key] = float(value)
            else:
                cleaned_row[key] = value
        final_results_cleaned.append(cleaned_row)

    return final_results_cleaned

#obs.: falta ajustar a logica de pedir dimensão mes, a natureza da venda é diaria e o estoque é uma foto do passad fixa, nao existe mes no estoque no modelo atual
# Esta configurado apenas para buscar o estoque atual, os estoques retroativos esta pendente desenvolver a logica de analise para essa coluna
# Necessario incluir metricas de entrada custo
# versão de protótipo, será necesario validar metricas e refatorar


# app/models.py
from sqlalchemy import Column, Integer, String, Date, ForeignKey, DateTime, Boolean, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .db import Base
class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    product_code = Column(String, unique=True, index=True, nullable=False)
    product_name = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relacionamento: Um produto pode ter muitos registros de histórico
    history = relationship("ProductHistory", back_populates="product")

# em models.py
class ProductHistory(Base):
    __tablename__ = "product_history"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)

    opening_stock = Column(Integer, default=0)
    inbound_quantity = Column(Integer, default=0)
    sold_quantity = Column(Integer, default=0)
    closing_stock = Column(Integer, default=0)

    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    product = relationship("Product", back_populates="history")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)

# --- NOVAS TABELAS DO DATA MART (ESQUEMA ESTRELA) ---

class DimProduto(Base):
    __tablename__ = "dim_produto"
    id = Column(Integer, primary_key=True, autoincrement=True)
    product_code = Column(String(50), unique=True, nullable=False)
    product_name = Column(String(255))
    marca = Column(String(100))
    departamento = Column(String(100))
    classificacao = Column(String(100))
    grupo = Column(String(100))
    modelo = Column(String(100))
    fornecedor = Column(String(100))

class DimLoja(Base):
    __tablename__ = "dim_loja"
    id = Column(Integer, primary_key=True, autoincrement=True)
    store_id = Column(Integer, unique=True, nullable=False)
    store_name = Column(String(255))

class FatoVendas(Base):
    __tablename__ = "fato_vendas"
    id = Column(Integer, primary_key=True, autoincrement=True)
    data_venda = Column(Date, nullable=False)
    produto_id = Column(Integer, ForeignKey('dim_produto.id'))
    loja_id = Column(Integer, ForeignKey('dim_loja.id'))
    quantidade_vendida = Column(Integer)
    venda_liquida = Column(Numeric(12, 2))
    venda_bruta = Column(Numeric(12, 2))
    custo_total = Column(Numeric(12, 2))
    quantidade_entrada = Column(Integer)
    custo_entrada = Column(Numeric(12, 2))

class FatoEstoque(Base):
    __tablename__ = "fato_estoque"
    id = Column(Integer, primary_key=True, autoincrement=True)
    data_snapshot = Column(Date, nullable=False)
    produto_id = Column(Integer, ForeignKey('dim_produto.id'))
    loja_id = Column(Integer, ForeignKey('dim_loja.id'))
    closing_stock_quantity = Column(Integer)
    closing_stock_cost = Column(Numeric(12, 2))
    closing_stock_sale_price = Column(Numeric(12, 2))

class KpiResumoDiario(Base):
    __tablename__ = "kpi_resumo_diario"
    data = Column(Date, primary_key=True)
    total_venda_liquida = Column(Numeric)
    lojas_ativas = Column(Integer)
# backend/app/schemas.py
from pydantic import BaseModel
from datetime import date, datetime
from typing import List, Dict, Any
from typing import Optional
from decimal import Decimal

# --- Schemas para o Histórico do Produto ---


class ProductHistoryBase(BaseModel):
    date: date
    sold_quantity: int

class ProductHistory(ProductHistoryBase):
    id: int
    opening_stock: int
    inbound_quantity: int
    closing_stock: int

    class Config:
        from_attributes = True


class ProductBase(BaseModel):
    product_code: str
    product_name: str

class Product(ProductBase):
    id: int
    created_at: datetime
    history: List[ProductHistory] = []

    class Config:
        from_attributes = True


class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# --- NOVOS SCHEMAS DO DATA MART (ESQUEMA ESTRELA) ---

class DimProduto(BaseModel):
    id: int
    product_code: str
    product_name: Optional[str] = None
    marca: Optional[str] = None
    departamento: Optional[str] = None
    classificacao: Optional[str] = None
    grupo: Optional[str] = None
    modelo: Optional[str] = None
    fornecedor: Optional[str] = None
    # Adicionar outros campos para retornar na API
    class Config:
        from_attributes = True

class DimLoja(BaseModel):
    id: int
    store_id: int
    store_name: Optional[str] = None
    class Config:
        from_attributes = True

class FatoVendas(BaseModel):
    data_venda: date
    produto_id: int
    loja_id: int
    quantidade_vendida: Optional[int] = None
    venda_liquida: Optional[Decimal] = None
    class Config:
        from_attributes = True

# --- NOVOS SCHEMAS PARA A ANÁLISE DINÂMICA ---
class MetricaRequest(BaseModel):
    nome: str  # ex: "venda_liquida"
    agregacao: str # ex: "SUM", "LAST", "AVG"

# O QueryRequest  usa  lista de MetricaRequest
class QueryRequest(BaseModel):
    data_inicial: date
    data_final: date
    dimensoes: List[str]
    metricas: List[MetricaRequest] # <-- MUDANÇA IMPORTANTE
    filtros: Optional[Dict[str, Any]] = None

 #lista flexível de dicionários
class QueryResponse(BaseModel):
    data: List[Dict[str, Any]]
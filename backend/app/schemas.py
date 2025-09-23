# backend/app/schemas.py
from pydantic import BaseModel
from datetime import date, datetime
from typing import List
from typing import Optional

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

# app/models.py
from sqlalchemy import Column, Integer, String, Date, ForeignKey, DateTime, Boolean
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
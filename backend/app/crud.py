# app/crud.py

from sqlalchemy.orm import Session
from . import models

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
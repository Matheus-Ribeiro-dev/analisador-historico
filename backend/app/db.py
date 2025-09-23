# app/db.py

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# URL de conexão com o banco de dados PostgreSQL
SQLALCHEMY_DATABASE_URL = settings.database_url

# Cria o "motor" de conexão com o banco
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Cria sessões
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Uma classe base que nossos modelos de tabela irão herdar
Base = declarative_base()
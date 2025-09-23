# backend/app/auth.py

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from .config import settings

# --- Configurações de Segurança ---
SECRET_KEY = settings.secret_key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 300

# Contexto para criptografia de senhas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Esquema OAuth2 para o FastAPI saber como o token seraa enviado
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# --- Funcoes de Segurança ---

def verify_password(plain_password, hashed_password):
    """Verifica se a senha em texto puro corresponde à senha criptografada."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """Gera o hash de uma senha."""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    """Cria um novo Token JWT (crachá de acesso)."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
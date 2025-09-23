# localizado em: backend/app/main.py
#uvicorn app.main:app --reload
#.\venv\Scripts\Activate.ps1
#deactivate
#uvicorn app.main:app --host 0.0.0.0 --reload



from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm  # Importamos o formulário de login
from datetime import timedelta
from .config import settings

# Importa tudo dos nossos outros arquivos .py
from . import crud, models, schemas, auth
from .db import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# --- Configuração do CORS (para permitir o front-end) ---
origins = settings.cors_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Dependência para obter a sessão do banco de dados ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --- Endpoint de Login ---
@app.post("/token", response_model=schemas.Token)
def login_for_access_token(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Recebe username e password e retorna um Token JWT.
    """
    user = crud.get_user_by_username(db, username=form_data.username)

    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


# ---  Função para obter o usuario logado ---
def get_current_user(db: Session = Depends(get_db), token: str = Depends(auth.oauth2_scheme)):
    """
    Verifica o token e retorna os dados do usuário.
    Esta função será nosso "segurança" de porta.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = auth.jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except auth.JWTError:
        raise credentials_exception

    user = crud.get_user_by_username(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user


# --- Endpoint de Produtos PROTEGIDO ---
@app.get("/api/products/{product_code}", response_model=schemas.Product)
def read_product(
        product_code: str,
        db: Session = Depends(get_db),
        current_user: schemas.User = Depends(get_current_user)
):
    """
    Endpoint para buscar um produto.
    """
    db_product = crud.get_product_by_code(db, product_code=product_code)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return db_product
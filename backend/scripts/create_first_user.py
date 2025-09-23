# backend/scripts/create_first_user.py

import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db import SessionLocal, engine
from app.models import User
from app.auth import get_password_hash


def create_user():
    db = SessionLocal()
    print("--- Criação do Primeiro Usuário ---")

    username = input("Digite o nome de usuário desejado: ")
    password = input("Digite a senha desejada: ")

    # Verifica se o usuário já existe
    db_user = db.query(User).filter(User.username == username).first()
    if db_user:
        print(f"Erro: O usuário '{username}' já existe.")
        return

    hashed_password = get_password_hash(password)
    new_user = User(username=username, hashed_password=hashed_password)

    db.add(new_user)
    db.commit()

    print(f"\n--- SUCESSO! ---")
    print(f"Usuário '{username}' criado com sucesso.")
    db.close()


if __name__ == "__main__":
    create_user()
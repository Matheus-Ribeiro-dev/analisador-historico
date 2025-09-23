# backend/scripts/import_data.py

import pandas as pd
import psycopg2
import os
import sys
import io
from tqdm import tqdm

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.config import settings


def read_data_from_excel():
    try:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        file_path = os.path.join(base_dir, 'data', 'dados_consolidados.xlsx')
        print(f"Lendo dados do arquivo consolidado: {file_path}")
        df = pd.read_excel(file_path, dtype={'product_code': str})
        return df
    except Exception as e:
        print(f"ERRO ao ler o arquivo 'dados_consolidados.xlsx': {e}")
        return None


def load_data_to_db(df):
    conn = None
    try:
        conn = psycopg2.connect(settings.database_url, client_encoding='UTF8')
        cur = conn.cursor()
        print("Conexão bem-sucedida.")

        print("Limpando dados antigos das tabelas...")
        cur.execute("TRUNCATE TABLE product_history RESTART IDENTITY CASCADE;")
        cur.execute("TRUNCATE TABLE products RESTART IDENTITY CASCADE;")
        conn.commit()
        print("Tabelas limpas.")

        # Garantimosprodutos únicos baseando apenas no 'product_code'.
        products_df = df[['product_code', 'product_name']].drop_duplicates(
            subset=['product_code'],
            keep='first'
        ).dropna()

        print(f"Iniciando carga em massa de {len(products_df)} produtos únicos...")
        products_buffer = io.StringIO()
        products_df.to_csv(products_buffer, index=False, header=False, sep='\t')
        products_buffer.seek(0)

        cur.copy_expert(
            sql="COPY products (product_code, product_name) FROM STDIN WITH (FORMAT CSV, DELIMITER E'\\t');",
            file=products_buffer
        )
        conn.commit()
        print("Produtos inseridos com sucesso.")

        # --- Carga em massa para a tabela de histórico ---
        print(f"Preparando {len(df)} registros de histórico para carga em massa...")
        cur.execute("SELECT id, product_code FROM products;")
        product_id_map = {code: id for id, code in cur.fetchall()}
        df['product_id'] = df['product_code'].map(product_id_map)

        df_history = df.dropna(subset=['product_id'])
        df_history['product_id'] = df_history['product_id'].astype(int)

        df_to_copy = df_history[
            ['product_id', 'date', 'opening_stock', 'inbound_quantity', 'sold_quantity', 'closing_stock']]

        print("Iniciando a operação COPY em lotes para a tabela 'product_history'...")
        chunk_size = 10000

        with tqdm(total=len(df_to_copy), desc="Enviando para o BD") as pbar:
            for i in range(0, len(df_to_copy), chunk_size):
                chunk = df_to_copy[i:i + chunk_size]
                buffer = io.StringIO()
                chunk.to_csv(buffer, index=False, header=False, sep='\t')
                buffer.seek(0)
                cur.copy_expert(
                    sql="""
                        COPY product_history (product_id, date, opening_stock, inbound_quantity, sold_quantity, closing_stock)
                        FROM STDIN WITH (FORMAT CSV, DELIMITER E'\\t');
                    """,
                    file=buffer
                )
                pbar.update(len(chunk))

        conn.commit()
        print("Carga em massa do histórico concluída.")
        print("\n--- SUCESSO! Todos os dados foram inseridos via Bulk Insert. ---")

    except Exception as e:
        print(f"\n--- ERRO INESPERADO ---: {e}")
        if conn: conn.rollback()
    finally:
        if conn:
            cur.close()
            conn.close()
            print("\nConexão com o banco de dados fechada.")


if __name__ == "__main__":
    dataframe = read_data_from_excel()
    if dataframe is not None:
        load_data_to_db(dataframe)
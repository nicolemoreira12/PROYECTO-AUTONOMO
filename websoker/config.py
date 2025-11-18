

from dotenv import load_dotenv
import os
import psycopg2
from psycopg2.extras import RealDictCursor

load_dotenv()

# PostgreSQL directo
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_NAME = os.getenv("DB_NAME")
DB_SSL = os.getenv("DB_SSL", "false").lower() == "true"

# Función para conectar a PostgreSQL
def get_db_connection():
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=int(DB_PORT),
            user=DB_USER,
            password=DB_PASS,
            database=DB_NAME,
            sslmode="require" if DB_SSL else "prefer"
        )
        print("✅ PostgreSQL conectado")
        return conn
    except Exception as e:
        print(f"❌ Error conectando a PostgreSQL: {e}")
        return None


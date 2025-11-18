#!/usr/bin/env python3
from config import get_db_connection
import psycopg2.extras

conn = get_db_connection()
cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

# Obtener estructura de tabla
print("\n=== ESTRUCTURA DE TABLA 'producto' ===")
cur.execute("""
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_name='producto'
    ORDER BY ordinal_position
""")
cols = cur.fetchall()
for col in cols:
    nullable = "NULL" if col['is_nullable'] == 'YES' else "NOT NULL"
    print(f"  {col['column_name']:20} {col['data_type']:15} {nullable}")

# Obtener algunos datos
print("\n=== PRIMEROS 3 REGISTROS ===")
cur.execute("SELECT * FROM producto LIMIT 3")
rows = cur.fetchall()
for row in rows:
    print(dict(row))

conn.close()

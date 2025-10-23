
from config import supabase

# Reexportar como 'db' para que otros módulos importen desde here
db = supabase

# Opcional: helpers rápidos

def select(table, *args, **kwargs):
    return db.table(table).select(*args, **kwargs).execute()


def insert(table, payload):
    return db.table(table).insert(payload).execute()

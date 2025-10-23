
from config import supabase

producto = {
    "idVendedor": 1,
    "nombreProducto": "Producto desde Python",
    "descripcion": "Inserción de prueba",
    "precio": 9.99,
    "stock": 10
}

print("Intentando insertar producto:", producto)
def normalize_keys_lower(d):
    if not isinstance(d, dict):
        return d
    return {str(k).lower(): v for k, v in d.items()}

producto_db = normalize_keys_lower(producto)
try:
    res = supabase.table("producto").insert(producto_db).execute()
    print("Respuesta insert -> data:", getattr(res, 'data', None), "status_code:", getattr(res, 'status_code', None), "error:", getattr(res, 'error', None))
    if getattr(res, 'data', None):
        print("Inserción OK. Filas devueltas:", res.data)
    else:
        print("Inserción fallida. Detalle:", getattr(res, 'error', None) or repr(res))
except Exception as e:
    print("Excepción al insertar:", e)
    try:
        import traceback; traceback.print_exc()
    except Exception:
        pass


from config import supabase

emprendedor = {
    "nombreTienda": "Tienda Demo",
    "descripcionTienda": "Emprendedor de prueba creado desde script",
    "rating": 0
}

print("Insertando emprendedor de prueba:", emprendedor)
try:
    res = supabase.table("emprendedor").insert(emprendedor).execute()
    print("Respuesta insert emprendedor -> data:", getattr(res, 'data', None), "error:", getattr(res, 'error', None))
    if getattr(res, 'data', None):
        print("Emprendedor creado:", res.data)
    else:
        print("No se creó emprendedor. Detalle:", getattr(res, 'error', None) or repr(res))
except Exception as e:
    print("Excepción al insertar emprendedor:", e)
    try:
        import traceback; traceback.print_exc()
    except Exception:
        pass

"""Script robusto para asegurar que exista al menos un emprendedor de prueba.

Funcionamiento:
- Lista emprendedores existentes y los muestra.
- Si no hay ninguno, intenta insertar un emprendedor probando variantes de nombres de campo
  (camelCase, snake_case, etc.) hasta que la inserción devuelva datos.
- Muestra el id del emprendedor creado o el listado de emprendedores encontrados.
"""
from config import supabase
import traceback


def list_emprendedores():
    try:
        resp = supabase.table("emprendedor").select("*").limit(20).execute()
        rows = getattr(resp, 'data', None) or []
        print(f"Emprendedores encontrados: {len(rows)}")
        for r in rows:
            print(r)
        return rows
    except Exception as e:
        print("Error al listar emprendedores:", e)
        traceback.print_exc()
        return []


def try_insert_variants():
    # Variantes de nombres de campo comunes
    variants = [
        {"nombreTienda": "Tienda Demo", "descripcionTienda": "Demo creada por script", "rating": 0},
        {"nombretienda": "Tienda Demo", "descripciontienda": "Demo creada por script", "rating": 0},
        {"nombre_tienda": "Tienda Demo", "descripcion_tienda": "Demo creada por script", "rating": 0},
        {"name": "Tienda Demo", "descripcion": "Demo creada por script", "rating": 0},
    ]

    for payload in variants:
        try:
            print("Intentando insertar con payload:", payload)
            res = supabase.table("emprendedor").insert(payload).execute()
            data = getattr(res, 'data', None)
            err = getattr(res, 'error', None)
            print("Respuesta -> data:", data, "error:", err)
            if data:
                print("Inserción exitosa. Emprendedor creado:", data)
                return data
        except Exception as e:
            print("Excepción intentando insertar con payload", payload, ":", e)
            traceback.print_exc()

    print("No se pudo insertar emprendedor con las variantes probadas.")
    return None


def main():
    rows = list_emprendedores()
    if rows:
        print("Ya existen emprendedores — no se inserta uno nuevo.")
        return

    print("No se encontraron emprendedores. Intentando crear uno de prueba...")
    created = try_insert_variants()
    if created:
        print("Emprendedor creado correctamente. Resultado:")
        print(created)
    else:
        print("Fallo al crear emprendedor de prueba. Revisa permisos y la estructura de la tabla en Supabase.")


if __name__ == '__main__':
    main()

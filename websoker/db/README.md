# DB folder

Uso recomendado:
- `migrations/`: scripts SQL para cambios en esquema.
- `seeds/`: scripts o SQL para poblar datos de prueba.
- `client.py`: wrapper opcional para centralizar la conexión a Supabase.

No incluyas claves en archivos dentro de este directorio; usa `.env`.

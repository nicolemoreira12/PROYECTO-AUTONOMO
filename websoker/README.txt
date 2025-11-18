SERVIDOR WEBSOCKET - GUÍA DE USO

================================================================================
DESCRIPCIÓN GENERAL
================================================================================

Este es un servidor WebSocket en Python que permite comunicación en tiempo real
entre el backend y los clientes (Postman, navegadores, aplicaciones móviles).

Es el sistema de notificaciones en vivo del marketplace.

URL del servidor: ws://localhost:8000
Puerto: 8000


================================================================================
REQUISITOS PREVIOS
================================================================================

1. Python 3.8 o superior instalado
2. Las siguientes librerías Python:
   - websockets
   - psycopg2-binary
   - python-dotenv

3. PostgreSQL corriendo (en AWS Supabase)
4. Archivo .env con credenciales configuradas


================================================================================
INSTALACIÓN
================================================================================

1. Navega a la carpeta websoker:
   cd websoker

2. Instala dependencias (si no están instaladas):
   pip install websockets psycopg2-binary python-dotenv

3. Verifica que el archivo .env existe con las credenciales correctas:
   - DB_HOST
   - DB_PORT
   - DB_USER
   - DB_PASS
   - DB_NAME
   - DB_SSL


================================================================================
EJECUTAR EL SERVIDOR
================================================================================

COMANDO:
   python app.py

SALIDA ESPERADA:
   PostgreSQL conectado
   last_seen_id inicializado a X desde PostgreSQL
   Servidor WebSocket corriendo en ws://localhost:8000
   Iniciando poller realtime (interval=5s)
   Iniciando heartbeat: interval=10s timeout=5s

El servidor se queda escuchando. Para detenerlo presiona Ctrl+C


================================================================================
USAR CON POSTMAN
================================================================================

PASO 1: Abre Postman

PASO 2: Crea una nueva solicitud WebSocket
   - Click en "New"
   - Selecciona "WebSocket Request"

PASO 3: Ingresa la URL
   ws://localhost:8000

PASO 4: Haz clic en "Connect"
   Verás el mensaje "Connected"

PASO 5: Envía comandos en la caja de texto
   Ejemplos a continuación...

PASO 6: Presiona Enter para enviar

PASO 7: Ve la respuesta en los logs


================================================================================
COMANDOS DISPONIBLES
================================================================================

1. PRUEBA DE CONEXIÓN (PING)
   Comando:
   {"action": "ping"}

   Respuesta esperada:
   {"type": "pong"}

   Uso: Verifica que el servidor está activo


2. OBTENER TODOS LOS PRODUCTOS
   Comando:
   {"action": "get_products"}

   Respuesta esperada:
   {
     "type": "products",
     "data": [
       {
         "idProducto": 1,
         "nombreProducto": "Laptop",
         "descripcion": "Laptop gaming",
         "precio": 1500.00,
         "stock": 5,
         "imagenURL": "https://...",
         "emprendedorIdEmprendedor": null,
         "categoriaIdCategoria": 1
       },
       ...
     ]
   }

   Uso: Ver todos los productos en la base de datos


3. AGREGAR NUEVO PRODUCTO
   Comando (Campos requeridos):
   {
     "action": "add_product",
     "product": {
       "nombre": "Mi Laptop",
       "precio": 2000,
       "descripcion": "Laptop potente",
       "stock": 3
     }
   }

   Campos opcionales:
   - imagenURL: "https://ejemplo.com/imagen.jpg"
   - categoriaIdCategoria: 1
   - emprendedorIdEmprendedor: 1

   Respuesta esperada:
   {
     "type": "add_product",
     "status": "success",
     "data": [
       {
         "idProducto": 15,
         "nombreProducto": "Mi Laptop",
         "descripcion": "Laptop potente",
         "precio": 2000,
         "stock": 3,
         "imagenURL": "",
         "emprendedorIdEmprendedor": null,
         "categoriaIdCategoria": null
       }
     ]
   }

   Uso: Insertar un nuevo producto en la base de datos


4. SUSCRIBIRSE A UN CANAL
   Comando:
   {"action": "subscribe", "channel": "productos"}

   Respuesta esperada:
   {"type": "subscribed", "channel": "productos"}

   Canales disponibles:
   - productos
   - ordenes
   - notificaciones
   - dashboard
   - (cualquier nombre personalizado)

   Uso: Recibir notificaciones de un canal específico


5. DESUSCRIBIRSE DE UN CANAL
   Comando:
   {"action": "unsubscribe", "channel": "productos"}

   Respuesta esperada:
   {"type": "unsubscribed", "channel": "productos"}

   Uso: Dejar de recibir notificaciones de un canal


6. ENVIAR NOTIFICACIÓN A UN CANAL
   Comando:
   {
     "action": "notify",
     "channel": "productos",
     "payload": {
       "mensaje": "Nuevo producto disponible",
       "tipo": "alerta"
     }
   }

   Respuesta esperada:
   {"type": "notify_ack", "channel": "productos"}

   Uso: Enviar un mensaje a todos los clientes suscritos a un canal


================================================================================
FLUJO COMPLETO DE PRUEBA
================================================================================

1. Asegúrate de que app.py está ejecutándose:
   python app.py

2. Abre Postman
   - Nueva solicitud WebSocket
   - URL: ws://localhost:8000
   - Click en "Connect"

3. Prueba ping:
   {"action": "ping"}
   Resultado: {"type": "pong"}

4. Obtén productos:
   {"action": "get_products"}
   Resultado: Lista de productos

5. Suscríbete:
   {"action": "subscribe", "channel": "productos"}
   Resultado: {"type": "subscribed", "channel": "productos"}

6. Agrega un producto:
   {"action": "add_product", "product": {"nombre": "Test", "precio": 50, "descripcion": "Test", "stock": 1}}
   Resultado: Producto agregado + notificación en el canal

7. Envía notificación:
   {"action": "notify", "channel": "productos", "payload": {"msg": "Hola"}}
   Resultado: Todos los suscritos reciben el mensaje


================================================================================
ARCHIVOS IMPORTANTES
================================================================================

app.py
   - Servidor WebSocket principal
   - Maneja todas las conexiones y comandos
   - Conecta con PostgreSQL

config.py
   - Configuración de conexión a base de datos
   - Lee credenciales del archivo .env

.env
   - Archivo con credenciales de acceso
   - NUNCA compartir públicamente
   - Contiene usuario/contraseña de PostgreSQL

check_schema.py
   - Script para ver la estructura de la tabla producto
   - Uso: python check_schema.py

add_via_ws_simple.py
   - Cliente WebSocket de prueba
   - Alternativa a Postman para testing
   - Uso: python add_via_ws_simple.py

EJEMPLOS_POSTMAN.md
   - Documento con ejemplos de comandos
   - Copiar y pegar directamente en Postman


================================================================================
TROUBLESHOOTING - PROBLEMAS COMUNES
================================================================================

PROBLEMA: "Connection refused"
SOLUCIÓN: Asegúrate de que app.py está ejecutándose
         python app.py

PROBLEMA: "Error al obtener productos" desde Postman
SOLUCIÓN: Verifica que el servidor tiene conexión a PostgreSQL
         Ver logs en la terminal donde corre app.py

PROBLEMA: "column 'nombre' does not exist"
SOLUCIÓN: El script mapea 'nombre' a 'nombreProducto' automáticamente
         Simplemente usa "nombre" en el payload

PROBLEMA: "null value in column 'imagenURL'"
SOLUCIÓN: imagenURL es requerida pero tiene valor por defecto vacío
         Ahora se agrega automáticamente si no lo envías

PROBLEMA: El servidor se detiene inesperadamente
SOLUCIÓN: Ver los logs de error en la terminal
         Reinicia con: python app.py


================================================================================
ESTRUCTURA DE TABLA PRODUCTO
================================================================================

Columna                      Tipo        Requerido
-----------                  ----        ---------
idProducto                   integer     Generado automáticamente
nombreProducto               string      Requerido (envía como "nombre")
descripcion                  string      Requerido
precio                       decimal     Requerido
stock                        integer     Requerido (default: 1)
imagenURL                    string      Requerido (default: "")
emprendedorIdEmprendedor     integer     Opcional
categoriaIdCategoria         integer     Opcional


================================================================================
INFORMACIÓN DE CONEXIÓN A BASE DE DATOS
================================================================================

Base de datos: PostgreSQL en AWS Supabase
Host: aws-1-us-east-1.pooler.supabase.com
Puerto: 6543
Usuario: postgres.rvyietphxsbrrehlaeji
Base de datos: postgres
SSL: Habilitado

Tabla: producto
Registros actuales: Varios (ver con get_products)


================================================================================
NOTAS IMPORTANTES
================================================================================

1. El servidor debe estar ejecutándose siempre que quieras usar el WebSocket

2. Postman es la forma más fácil de probar los comandos

3. El servidor automáticamente:
   - Convierte Decimal a float en JSON (para precios)
   - Mapea "nombre" a "nombreProducto"
   - Agrega valores por defecto para campos requeridos
   - Detecta nuevos productos cada 5 segundos (polling)
   - Mantiene vivas las conexiones con heartbeats cada 10 segundos

4. Los clientes reciben notificaciones en tiempo real:
   - Cuando se agrega un nuevo producto
   - Cuando se envía una notificación a su canal

5. El puerto 8000 debe estar disponible
   Si está ocupado, edita app.py y cambia: puerto = 8001


================================================================================
PRÓXIMOS PASOS
================================================================================

1. Ejecuta el servidor:
   python app.py

2. Abre Postman y crea una conexión WebSocket a ws://localhost:8000

3. Prueba los comandos de arriba

4. Integra con tu aplicación frontend cuando funcione correctamente

5. En producción, configura el puerto y host según sea necesario


================================================================================
SOPORTE Y DEBUGGING
================================================================================

Para debugging, mira los logs en la terminal donde corre app.py:

- "Cliente conectado: IP:PUERTO"
  Alguien se conectó

- "Mensaje recibido de IP:PUERTO: {JSON}"
  Se recibió un comando

- "Error get_products: mensaje_error"
  Algo salió mal en una consulta

- "current transaction is aborted"
  Hay un problema con la conexión a BD, pero se recupera automáticamente


================================================================================
FIN DE LA GUÍA
================================================================================

Para más detalles, consulta:
- EXPLICACION_ARCHIVOS.md: Explicación de cada archivo
- EJEMPLOS_POSTMAN.md: Ejemplos listos para copiar

================================================================================
    DOCUMENTACIÓN DEL PROYECTO - MARKETPLACE MANTENSE ECUADOR
================================================================================

Este repositorio contiene la documentación completa del proyecto de marketplace
con sistema de billetera cripto.

--------------------------------------------------------------------------------
DOCUMENTOS DISPONIBLES
--------------------------------------------------------------------------------

1. ESPECIFICACION_PRODUCTO.md (DOCUMENTO PRINCIPAL)
   - 1,324 líneas de especificación detallada
   - Formato: Markdown
   - Idioma: Español
   - Contenido:
     * Resumen ejecutivo
     * Arquitectura del sistema (3 microservicios)
     * Características del marketplace
     * Sistema de wallet y criptomonedas
     * Modelo de datos completo (11 entidades)
     * API REST (60+ endpoints)
     * GraphQL (10+ queries)
     * WebSocket (8+ canales)
     * Flujos de usuario
     * Casos de uso
     * Seguridad
     * Integraciones
     * Deployment
     * Roadmap futuro

2. RESUMEN_ESPECIFICACION.md
   - Resumen ejecutivo y navegación rápida
   - Estadísticas del documento
   - Guía de uso
   - Checklist de características

3. README_DOCUMENTACION.txt (ESTE ARCHIVO)
   - Guía rápida en texto plano
   - Información sobre documentos disponibles

--------------------------------------------------------------------------------
ESTRUCTURA DEL PROYECTO
--------------------------------------------------------------------------------

PROYECTO-AUTONOMO/
├── Markplace/              # REST API (TypeScript/Node.js) - Puerto 3000
│   ├── src/
│   │   ├── controllers/    # Controladores HTTP
│   │   ├── services/       # Lógica de negocio
│   │   ├── entities/       # Modelos de datos
│   │   └── routes/         # Definición de rutas
│   └── README.md
│
├── graphql-ruby/           # GraphQL Service (Ruby) - Puerto 4000
│   ├── graphql/
│   │   ├── types/          # Tipos GraphQL
│   │   └── resolvers/      # Resolvers
│   ├── models/             # Modelos ActiveRecord
│   └── README.md
│
├── websoker/               # WebSocket Service (Python) - Puerto 8000
│   ├── app.py              # Aplicación principal
│   ├── server_simple.py    # Servidor WebSocket
│   └── README_EJECUTAR.txt
│
├── ESPECIFICACION_PRODUCTO.md      # ⭐ DOCUMENTO PRINCIPAL
├── RESUMEN_ESPECIFICACION.md       # Resumen ejecutivo
└── README_DOCUMENTACION.txt        # Este archivo

--------------------------------------------------------------------------------
CARACTERÍSTICAS PRINCIPALES
--------------------------------------------------------------------------------

MARKETPLACE:
✓ Gestión de productos
✓ Gestión de emprendedores
✓ Gestión de usuarios
✓ Carrito de compras
✓ Sistema de órdenes
✓ Categorías de productos

SISTEMA DE WALLET CRIPTO:
✓ Tarjetas virtuales (wallets)
✓ Transacciones (DEPÓSITO, COMPRA, RETIRO)
✓ Historial completo
✓ Validación de saldo
✓ Seguridad integrada

COMUNICACIÓN:
✓ REST API completa
✓ GraphQL para reportes
✓ WebSocket para tiempo real

--------------------------------------------------------------------------------
ENTIDADES DE BASE DE DATOS
--------------------------------------------------------------------------------

1. Usuario          - Información de usuarios registrados
2. Emprendedor      - Perfil de vendedores
3. Producto         - Catálogo de productos
4. Categoría        - Clasificación de productos
5. CarritoCompra    - Carritos de usuarios
6. DetalleCarrito   - Items en carritos
7. Orden            - Órdenes de compra
8. DetalleOrden     - Items en órdenes
9. TarjetaVirtual   - Wallets de usuarios (SISTEMA CRIPTO)
10. Transaccion     - Historial de transacciones cripto
11. Pago            - Registro de pagos

--------------------------------------------------------------------------------
TECNOLOGÍAS
--------------------------------------------------------------------------------

BACKEND:
- Node.js + TypeScript + Express
- Ruby + Sinatra + GraphQL
- Python + WebSocket

BASE DE DATOS:
- PostgreSQL 12+
- TypeORM (Node.js)
- ActiveRecord (Ruby)

SEGURIDAD:
- JWT para autenticación
- Bcrypt para contraseñas
- Validación de datos

--------------------------------------------------------------------------------
CÓMO USAR ESTA DOCUMENTACIÓN
--------------------------------------------------------------------------------

PARA TESTSPRITE:
1. Leer ESPECIFICACION_PRODUCTO.md
2. Revisar arquitectura de microservicios
3. Entender flujos de usuario
4. Verificar casos de uso
5. Planificar pruebas según documentación

PARA DESARROLLO:
1. Usar como referencia de API
2. Consultar modelo de datos
3. Seguir patrones de arquitectura
4. Implementar según especificaciones

PARA PRESENTACIONES:
1. Usar RESUMEN_ESPECIFICACION.md
2. Extraer diagramas de flujo
3. Mostrar características principales
4. Destacar innovación (wallet cripto)

--------------------------------------------------------------------------------
PROPÓSITO DEL PROYECTO
--------------------------------------------------------------------------------

Marketplace Mantense Ecuador es una plataforma de e-commerce diseñada para:

1. Conectar emprendedores ecuatorianos con compradores
2. Facilitar venta de productos artesanales
3. Implementar sistema de pagos con criptomonedas
4. Proporcionar herramientas de gestión a vendedores
5. Ofrecer experiencia moderna de compra

USUARIOS OBJETIVO:
- Emprendedores: Artesanos y pequeños negocios
- Compradores: Consumidores de productos locales
- Administradores: Gestión de plataforma

--------------------------------------------------------------------------------
CONTACTO Y SOPORTE
--------------------------------------------------------------------------------

Repositorio: nicolemoreira12/PROYECTO-AUTONOMO
Curso: Servidor Web 2024
Universidad: ULEAM

Equipo de Desarrollo:
- Servicio REST API (TypeScript): Integrante 2
- Servicio GraphQL (Ruby): Integrante 3
- Servicio WebSocket (Python): Integrante 1

--------------------------------------------------------------------------------
ÚLTIMA ACTUALIZACIÓN
--------------------------------------------------------------------------------

Fecha: Noviembre 2024
Versión: 1.0
Estado: Completo y Operativo

================================================================================

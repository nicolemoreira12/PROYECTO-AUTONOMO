# Servicio GraphQL - Marketplace en Ruby

Sistema GraphQL completo desarrollado en Ruby con Sinatra y GraphQL-Ruby para el proyecto de Marketplace.

## 🚀 Características

- **GraphQL API completa** para reportes y consultas complejas
- **Arquitectura limpia** con separación de tipos, resolvers y modelos
- **ActiveRecord** para ORM y manejo de base de datos
- **Playground interactivo** para testing y documentación
- **CORS configurado** para integración con frontend
- **Logging avanzado** para debugging
- **Optimizaciones** con DataLoader y paginación

## 📋 Requisitos

- Ruby >= 3.2.0
- PostgreSQL >= 13
- Bundler

## 🔧 Instalación

1. **Instalar dependencias:**
```bash
bundle install
```

2. **Configurar variables de entorno:**
```bash
cp .env.example .env
# Editar .env con tus credenciales de base de datos
```

3. **Configurar base de datos:**
```bash
# La base de datos debe estar creada y accesible
# Asegúrate de que DATABASE_URL en .env apunte a la BD correcta
```

## 🚀 Ejecución

### Desarrollo
```bash
# Opción 1: Directamente con Ruby
ruby app.rb

# Opción 2: Con Puma (servidor de producción)
bundle exec puma config.ru -p 4000

# Opción 3: Con auto-reload (desarrollo)
bundle exec rerun 'ruby app.rb'
```

### Producción
```bash
bundle exec puma -C config/puma.rb
```

El servidor estará disponible en: `http://localhost:4000`

## 📚 Endpoints

### GraphQL
- **POST /graphql** - Endpoint principal GraphQL
- **GET /graphql** - GraphQL Playground (solo desarrollo)

### Utilidades
- **GET /health** - Health check del servicio
- **GET /schema** - Introspección del schema GraphQL

## 🔍 Consultas Principales

### Métricas Generales
```graphql
query {
  metricasGenerales {
    totalOrdenes
    totalProductos
    totalIngresos
    totalIngresosFormateado
    crecimientoMensual
    ticketPromedio
  }
}
```

### Productos Más Vendidos
```graphql
query {
  productosMasVendidos(limite: 10) {
    productoId
    nombre
    totalVendido
    ingresosGenerados
    ingresosFormateado
  }
}
```

### Estadísticas por Categoría
```graphql
query {
  estadisticasPorCategoria {
    nombreCategoria
    totalProductos
    ingresosTotales
    participacionMercado
  }
}
```

### Top Compradores
```graphql
query {
  topCompradores(limite: 10) {
    nombreCompleto
    email
    totalOrdenes
    totalGastado
  }
}
```

### Reporte de Inventario
```graphql
query {
  reporteInventario {
    nombre
    stockActual
    estadoStock
    valorInventario
  }
}
```

### Reporte de Ingresos
```graphql
query {
  reporteIngresos(agrupacion: "mes") {
    periodo
    totalOrdenes
    ingresosBrutos
    ticketPromedio
  }
}
```

## 🎯 Filtros y Parámetros

### Filtro de Fechas
```graphql
query {
  productosMasVendidos(
    limite: 5
    filtroFecha: {
      fechaInicio: "2024-01-01"
      fechaFin: "2024-12-31"
    }
  ) {
    nombre
    totalVendido
  }
}
```

### Agrupación de Reportes
```graphql
query {
  reporteIngresos(agrupacion: "dia") {
    periodo
    ingresosBrutos
  }
}
# Opciones: "dia", "semana", "mes", "anio"
```

## 📊 Tipos GraphQL Disponibles

### Entidades Principales
- `UsuarioType`
- `ProductoType`
- `CategoriaType`
- `EmprendedorType`
- `OrdenType`
- `DetalleOrdenType`
- `PagoType`

### Reportes y Estadísticas
- `MetricasGeneralesType`
- `TopProductoType`
- `EstadisticaCategoriaType`
- `EstadisticaEmprendedorType`
- `EstadisticaUsuarioType`
- `ReporteInventarioType`
- `ReporteIngresosType`
- `AnalisisAbandonoType`

## 🔗 Integración con otros servicios

### Desde el Frontend (React/Vue/Angular)
```javascript
// Configuración de cliente GraphQL (ejemplo con Apollo Client)
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const client = new ApolloClient({
  link: new HttpLink({
    uri: 'http://localhost:4000/graphql',
  }),
  cache: new InMemoryCache(),
});

// Ejemplo de query
const { data } = await client.query({
  query: gql`
    query {
      metricasGenerales {
        totalIngresos
        totalOrdenes
      }
    }
  `,
});
```

### Desde Python (WebSocket Service)
```python
import requests

def get_metrics():
    query = """
    query {
      metricasGenerales {
        totalOrdenes
        totalIngresos
      }
    }
    """
    
    response = requests.post(
        'http://localhost:4000/graphql',
        json={'query': query}
    )
    
    return response.json()
```

### Desde TypeScript (REST Service)
```typescript
async function fetchMetrics() {
  const query = `
    query {
      metricasGenerales {
        totalOrdenes
        totalIngresos
      }
    }
  `;

  const response = await fetch('http://localhost:4000/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  return await response.json();
}
```

## 🧪 Testing

```bash
# Ejecutar tests
bundle exec rspec

# Con coverage
bundle exec rspec --format documentation
```

## 📝 Estructura del Proyecto

```
graphql-ruby/
├── app.rb                          # Aplicación principal Sinatra
├── config.ru                       # Configuración Rack
├── Gemfile                         # Dependencias Ruby
├── .env.example                    # Variables de entorno ejemplo
├── config/
│   └── database.rb                 # Configuración de base de datos
├── models/
│   └── models.rb                   # Modelos ActiveRecord
├── graphql/
│   ├── schema.rb                   # Schema principal GraphQL
│   ├── query_type.rb               # Query root type
│   ├── types/
│   │   ├── types.rb               # Tipos de entidades
│   │   └── report_types.rb       # Tipos de reportes
│   └── resolvers/
│       └── reportes_resolver.rb   # Lógica de resolvers
└── views/
    └── playground.erb              # GraphQL Playground UI
```

## 🔒 Seguridad

- CORS configurado con orígenes permitidos
- Validación de queries con max_depth y max_complexity
- Manejo seguro de errores sin exponer detalles internos
- Logging de queries lentas para optimización

## 🚦 Variables de Entorno

```bash
# Base de datos
DATABASE_URL=postgresql://user:password@localhost:5432/marketplace_db

# Servidor
GRAPHQL_PORT=4000
RACK_ENV=development

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# API REST
REST_API_URL=http://localhost:3001

# Logging
LOG_LEVEL=info
```

## 📈 Performance

- Uso de DataLoader para evitar N+1 queries
- Paginación automática para listados grandes
- Caché de resultados frecuentes
- Optimización de queries SQL con eager loading
- Índices en campos frecuentemente consultados

## 🐛 Debugging

### Ver logs en tiempo real
```bash
tail -f log/development.log
```

### Habilitar query logging
```ruby
# En config/database.rb
ActiveRecord::Base.logger = Logger.new($stdout)
ActiveRecord::Base.logger.level = Logger::DEBUG
```

## 🤝 Contribución

Este proyecto es parte del trabajo académico del curso de Servidor Web.

### Integrantes del equipo:
- Integrante 1: Python - WebSocket Service
- Integrante 2: TypeScript - REST API Service
- Integrante 3: Ruby - GraphQL Service (Este servicio)

## 📄 Licencia

Proyecto académico - ULEAM 2024

## 📞 Soporte

Para dudas o problemas:
- Revisar la documentación en el playground: `http://localhost:4000/graphql`
- Verificar logs del servidor
- Contactar al equipo de desarrollo

---

**Desarrollado con ❤️ usando Ruby, Sinatra y GraphQL-Ruby**

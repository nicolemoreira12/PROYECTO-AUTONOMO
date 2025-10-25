# frozen_string_literal: true

require 'graphql'
require_relative 'types'

module Types
  # Tipo para métricas generales del dashboard
  class MetricasGeneralesType < BaseObject
    description 'Métricas generales del sistema para el dashboard'
    
    field :total_ordenes, Integer, null: false, description: 'Total de órdenes en el sistema'
    field :total_productos, Integer, null: false, description: 'Total de productos registrados'
    field :total_usuarios, Integer, null: false, description: 'Total de usuarios registrados'
    field :total_emprendedores, Integer, null: false, description: 'Total de emprendedores'
    field :total_ingresos, Float, null: false, description: 'Ingresos totales'
    field :productos_agotados, Integer, null: false, description: 'Productos sin stock'
    field :ordenes_pendientes, Integer, null: false, description: 'Órdenes pendientes de procesar'
    field :crecimiento_mensual, Float, null: false, description: 'Porcentaje de crecimiento mensual'
    field :ticket_promedio, Float, null: false, description: 'Valor promedio por orden'
    
    # Campos formateados
    field :total_ingresos_formateado, String, null: false
    field :ticket_promedio_formateado, String, null: false
    
    def total_ingresos_formateado
      "$#{format('%.2f', object[:total_ingresos])}"
    end
    
    def ticket_promedio_formateado
      "$#{format('%.2f', object[:ticket_promedio])}"
    end
  end

  # Tipo para productos más vendidos
  class TopProductoType < BaseObject
    description 'Información de productos más vendidos'
    
    field :producto_id, ID, null: false
    field :nombre, String, null: false
    field :total_vendido, Integer, null: false, description: 'Cantidad total vendida'
    field :ingresos_generados, Float, null: false, description: 'Ingresos totales por este producto'
    field :categoria, String, null: true
    field :emprendedor, String, null: true
    field :precio_promedio, Float, null: false
    
    field :ingresos_formateado, String, null: false
    
    def ingresos_formateado
      "$#{format('%.2f', object[:ingresos_generados])}"
    end
  end

  # Tipo para estadísticas de productos
  class EstadisticaProductoType < BaseObject
    description 'Estadísticas detalladas de productos'
    
    field :producto_id, ID, null: false
    field :nombre, String, null: false
    field :stock_actual, Integer, null: false
    field :total_vendido, Integer, null: false
    field :ingresos_totales, Float, null: false
    field :numero_ordenes, Integer, null: false, description: 'Número de órdenes que incluyen este producto'
    field :precio_actual, Float, null: false
    field :categoria, String, null: true
  end

  # Tipo para estadísticas por categoría
  class EstadisticaCategoriaType < BaseObject
    description 'Estadísticas por categoría de productos'
    
    field :categoria_id, ID, null: true
    field :nombre_categoria, String, null: false
    field :total_productos, Integer, null: false
    field :total_vendido, Integer, null: false
    field :ingresos_totales, Float, null: false
    field :productos_agotados, Integer, null: false
    field :precio_promedio, Float, null: false
    field :participacion_mercado, Float, null: false, description: 'Porcentaje del total de ventas'
  end

  # Tipo para estadísticas por emprendedor
  class EstadisticaEmprendedorType < BaseObject
    description 'Estadísticas por emprendedor'
    
    field :emprendedor_id, ID, null: false
    field :nombre_negocio, String, null: false
    field :total_productos, Integer, null: false
    field :productos_activos, Integer, null: false
    field :total_vendido, Integer, null: false
    field :ingresos_totales, Float, null: false
    field :numero_ordenes, Integer, null: false
    field :rating_promedio, Float, null: true
    field :productos_agotados, Integer, null: false
  end

  # Tipo para estadísticas de usuarios
  class EstadisticaUsuarioType < BaseObject
    description 'Estadísticas de comportamiento de usuarios'
    
    field :usuario_id, ID, null: false
    field :nombre_completo, String, null: false
    field :email, String, null: true
    field :total_ordenes, Integer, null: false
    field :total_gastado, Float, null: false
    field :ticket_promedio, Float, null: false
    field :primera_compra, GraphQL::Types::ISO8601DateTime, null: true
    field :ultima_compra, GraphQL::Types::ISO8601DateTime, null: true
    field :productos_favoritos, [String], null: true
  end

  # Tipo para reporte de inventario
  class ReporteInventarioType < BaseObject
    description 'Reporte detallado de inventario'
    
    field :producto_id, ID, null: false
    field :nombre, String, null: false
    field :categoria, String, null: true
    field :stock_actual, Integer, null: false
    field :stock_minimo, Integer, null: true
    field :estado_stock, String, null: false, description: 'Estado: BAJO, NORMAL, ALTO, AGOTADO'
    field :valor_inventario, Float, null: false
    field :rotacion, Float, null: true, description: 'Índice de rotación del producto'
  end

  # Tipo para reporte de órdenes
  class ReporteOrdenType < BaseObject
    description 'Reporte detallado de órdenes'
    
    field :orden_id, ID, null: false
    field :usuario, String, null: true
    field :fecha_orden, GraphQL::Types::ISO8601DateTime, null: false
    field :total, Float, null: false
    field :estado, String, null: false
    field :items_count, Integer, null: false
    field :metodo_pago, String, null: true
    field :estado_pago, String, null: true
    field :tiempo_procesamiento, Float, null: true, description: 'Tiempo en días desde la orden hasta completada'
  end

  # Tipo para reporte de ingresos
  class ReporteIngresosType < BaseObject
    description 'Reporte de ingresos por período'
    
    field :periodo, String, null: false, description: 'Período del reporte (ej: 2024-01, 2024-W12)'
    field :total_ordenes, Integer, null: false
    field :ingresos_brutos, Float, null: false
    field :ingresos_netos, Float, null: false
    field :comisiones, Float, null: true
    field :ticket_promedio, Float, null: false
    field :crecimiento, Float, null: true, description: 'Porcentaje de crecimiento vs período anterior'
  end

  # Tipo para tendencias de ventas
  class TendenciaVentasType < BaseObject
    description 'Análisis de tendencias de ventas'
    
    field :fecha, GraphQL::Types::ISO8601Date, null: false
    field :ventas, Integer, null: false
    field :ingresos, Float, null: false
    field :nuevos_clientes, Integer, null: false
    field :clientes_recurrentes, Integer, null: false
    field :ticket_promedio, Float, null: false
    field :tendencia, String, null: true, description: 'CRECIENTE, DECRECIENTE, ESTABLE'
  end

  # Tipo para análisis de abandono de carrito
  class AnalisisAbandonoType < BaseObject
    description 'Análisis de carritos abandonados'
    
    field :total_carritos_activos, Integer, null: false
    field :total_carritos_abandonados, Integer, null: false
    field :tasa_abandono, Float, null: false, description: 'Porcentaje de abandono'
    field :valor_total_abandonado, Float, null: false
    field :productos_mas_abandonados, [Types::ProductoType], null: true
    field :tiempo_promedio_abandono, Float, null: true, description: 'Horas promedio antes del abandono'
  end

  # Tipo para comparación de períodos
  class ComparacionPeriodosType < BaseObject
    description 'Comparación entre dos períodos de tiempo'
    
    field :periodo_actual, Types::ReporteIngresosType, null: false
    field :periodo_anterior, Types::ReporteIngresosType, null: false
    field :variacion_ordenes, Float, null: false, description: 'Variación porcentual en órdenes'
    field :variacion_ingresos, Float, null: false, description: 'Variación porcentual en ingresos'
    field :variacion_ticket, Float, null: false, description: 'Variación porcentual en ticket promedio'
    field :tendencia_general, String, null: false, description: 'POSITIVA, NEGATIVA, NEUTRAL'
  end

  # Tipo para respuesta paginada
  class PaginacionType < BaseObject
    description 'Información de paginación'
    
    field :pagina_actual, Integer, null: false
    field :items_por_pagina, Integer, null: false
    field :total_items, Integer, null: false
    field :total_paginas, Integer, null: false
    field :tiene_pagina_anterior, Boolean, null: false
    field :tiene_pagina_siguiente, Boolean, null: false
  end

  # Input para filtros de fecha
  class FiltroFechaInput < GraphQL::Schema::InputObject
    description 'Filtros de rango de fechas para reportes'
    
    argument :fecha_inicio, GraphQL::Types::ISO8601Date, required: false
    argument :fecha_fin, GraphQL::Types::ISO8601Date, required: false
  end

  # Input para paginación
  class PaginacionInput < GraphQL::Schema::InputObject
    description 'Parámetros de paginación'
    
    argument :pagina, Integer, required: false, default_value: 1
    argument :limite, Integer, required: false, default_value: 10
  end

  # Input para ordenamiento
  class OrdenamientoInput < GraphQL::Schema::InputObject
    description 'Parámetros de ordenamiento'
    
    argument :campo, String, required: true
    argument :direccion, String, required: false, default_value: 'DESC'
  end
end

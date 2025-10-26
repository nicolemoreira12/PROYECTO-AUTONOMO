# frozen_string_literal: true

require_relative '../types/report_types'
require_relative '../../models/models'

module Resolvers
  # Resolver para reportes y estadísticas
  class ReportesResolver
    # Obtiene métricas generales del sistema
    def self.metricas_generales
      total_ordenes = Orden.count
      total_productos = Producto.count
      total_usuarios = Usuario.count
      total_emprendedores = Emprendedor.count
      total_ingresos = Orden.completadas.sum(:total).to_f
      productos_agotados = Producto.agotados.count
      ordenes_pendientes = Orden.pendientes.count
      
      # Calcular crecimiento mensual
      mes_actual = Orden.completadas.where('fecha_orden >= ?', 1.month.ago).sum(:total).to_f
      mes_anterior = Orden.completadas
                          .where('fecha_orden >= ? AND fecha_orden < ?', 2.months.ago, 1.month.ago)
                          .sum(:total).to_f
      crecimiento_mensual = mes_anterior.positive? ? ((mes_actual - mes_anterior) / mes_anterior * 100) : 0
      
      # Ticket promedio
      ticket_promedio = total_ordenes.positive? ? total_ingresos / total_ordenes : 0
      
      {
        total_ordenes: total_ordenes,
        total_productos: total_productos,
        total_usuarios: total_usuarios,
        total_emprendedores: total_emprendedores,
        total_ingresos: total_ingresos.round(2),
        productos_agotados: productos_agotados,
        ordenes_pendientes: ordenes_pendientes,
        crecimiento_mensual: crecimiento_mensual.round(2),
        ticket_promedio: ticket_promedio.round(2)
      }
    end

    # Obtiene productos más vendidos
    def self.productos_mas_vendidos(limite: 10, filtro_fecha: nil)
      query = DetalleOrden
                .joins(:producto, orden: :pago)
                .where(pago: { estado: 'completado' })
                .select(
                  'producto.id as producto_id',
                  'producto.nombre',
                  'SUM(detalle_orden.cantidad) as total_vendido',
                  'SUM(detalle_orden.subtotal) as ingresos_generados',
                  'AVG(detalle_orden.precio_unitario) as precio_promedio'
                )
                .group('producto.id', 'producto.nombre')
      
      # Aplicar filtro de fecha si existe
      if filtro_fecha
        query = query.where('orden.fecha_orden BETWEEN ? AND ?', 
                           filtro_fecha[:fecha_inicio], 
                           filtro_fecha[:fecha_fin]) if filtro_fecha[:fecha_inicio] && filtro_fecha[:fecha_fin]
      end
      
      query.order('total_vendido DESC').limit(limite).map do |row|
        {
          producto_id: row.producto_id,
          nombre: row.nombre,
          total_vendido: row.total_vendido.to_i,
          ingresos_generados: row.ingresos_generados.to_f.round(2),
          precio_promedio: row.precio_promedio.to_f.round(2),
          categoria: row.producto&.categoria&.nombre,
          emprendedor: row.producto&.emprendedor&.nombre_negocio
        }
      end
    end

    # Obtiene productos más rentables
    def self.productos_mas_rentables(limite: 10, filtro_fecha: nil)
      query = DetalleOrden
                .joins(:producto)
                .select(
                  'producto.id as producto_id',
                  'producto.nombre',
                  'SUM(detalle_orden.subtotal) as ingresos_generados',
                  'SUM(detalle_orden.cantidad) as total_vendido',
                  'AVG(detalle_orden.precio_unitario) as precio_promedio'
                )
                .group('producto.id', 'producto.nombre')
      
      if filtro_fecha && filtro_fecha[:fecha_inicio] && filtro_fecha[:fecha_fin]
        query = query.joins(:orden)
                    .where('orden.fecha_orden BETWEEN ? AND ?', 
                           filtro_fecha[:fecha_inicio], 
                           filtro_fecha[:fecha_fin])
      end
      
      query.order('ingresos_generados DESC').limit(limite).map do |row|
        {
          producto_id: row.producto_id,
          nombre: row.nombre,
          total_vendido: row.total_vendido.to_i,
          ingresos_generados: row.ingresos_generados.to_f.round(2),
          precio_promedio: row.precio_promedio.to_f.round(2),
          categoria: Producto.find(row.producto_id).categoria&.nombre,
          emprendedor: Producto.find(row.producto_id).emprendedor&.nombre_negocio
        }
      end
    end

    # Estadísticas por categoría
    def self.estadisticas_por_categoria
      Categoria.all.map do |categoria|
        productos = categoria.productos
        total_productos = productos.count
        
        # Calcular ventas
        ventas = DetalleOrden.joins(:producto).where(producto: { categoria_id: categoria.id })
        total_vendido = ventas.sum(:cantidad).to_i
        ingresos_totales = ventas.sum(:subtotal).to_f
        productos_agotados = productos.agotados.count
        precio_promedio = total_productos.positive? ? productos.average(:precio).to_f : 0
        
        # Participación de mercado
        ingresos_totales_sistema = DetalleOrden.sum(:subtotal).to_f
        participacion = ingresos_totales_sistema.positive? ? 
                       (ingresos_totales / ingresos_totales_sistema * 100) : 0
        
        {
          categoria_id: categoria.id,
          nombre_categoria: categoria.nombre,
          total_productos: total_productos,
          total_vendido: total_vendido,
          ingresos_totales: ingresos_totales.round(2),
          productos_agotados: productos_agotados,
          precio_promedio: precio_promedio.round(2),
          participacion_mercado: participacion.round(2)
        }
      end.sort_by { |c| -c[:ingresos_totales] }
    end

    # Estadísticas por emprendedor
    def self.estadisticas_por_emprendedor
      Emprendedor.all.map do |emprendedor|
        productos = emprendedor.productos
        total_productos = productos.count
        productos_activos = productos.disponibles.count
        
        # Calcular ventas
        ventas = DetalleOrden.joins(:producto).where(producto: { emprendedor_id: emprendedor.id })
        total_vendido = ventas.sum(:cantidad).to_i
        ingresos_totales = ventas.sum(:subtotal).to_f
        numero_ordenes = ventas.select('DISTINCT orden_id').count
        productos_agotados = productos.agotados.count
        
        {
          emprendedor_id: emprendedor.id,
          nombre_negocio: emprendedor.nombre_negocio,
          total_productos: total_productos,
          productos_activos: productos_activos,
          total_vendido: total_vendido,
          ingresos_totales: ingresos_totales.round(2),
          numero_ordenes: numero_ordenes,
          rating_promedio: nil, # Puedes agregar lógica de ratings aquí
          productos_agotados: productos_agotados
        }
      end.sort_by { |e| -e[:ingresos_totales] }
    end

    # Top compradores
    def self.top_compradores(limite: 10, filtro_fecha: nil)
      query = Orden.joins(:usuario)
                  .select(
                    'usuario.id as usuario_id',
                    'usuario.nombre',
                    'usuario.apellido',
                    'usuario.email',
                    'COUNT(orden.id) as total_ordenes',
                    'SUM(orden.total) as total_gastado',
                    'AVG(orden.total) as ticket_promedio',
                    'MIN(orden.fecha_orden) as primera_compra',
                    'MAX(orden.fecha_orden) as ultima_compra'
                  )
                  .group('usuario.id', 'usuario.nombre', 'usuario.apellido', 'usuario.email')
      
      if filtro_fecha && filtro_fecha[:fecha_inicio] && filtro_fecha[:fecha_fin]
        query = query.where('orden.fecha_orden BETWEEN ? AND ?', 
                           filtro_fecha[:fecha_inicio], 
                           filtro_fecha[:fecha_fin])
      end
      
      query.order('total_gastado DESC').limit(limite).map do |row|
        {
          usuario_id: row.usuario_id,
          nombre_completo: "#{row.nombre} #{row.apellido}",
          email: row.email,
          total_ordenes: row.total_ordenes.to_i,
          total_gastado: row.total_gastado.to_f.round(2),
          ticket_promedio: row.ticket_promedio.to_f.round(2),
          primera_compra: row.primera_compra,
          ultima_compra: row.ultima_compra,
          productos_favoritos: [] # Puedes expandir esto
        }
      end
    end

    # Reporte de inventario
    def self.reporte_inventario
      Producto.all.map do |producto|
        stock_actual = producto.stock.to_i
        estado_stock = if stock_actual == 0
                        'AGOTADO'
                      elsif stock_actual < 10
                        'BAJO'
                      elsif stock_actual < 50
                        'NORMAL'
                      else
                        'ALTO'
                      end
        
        {
          producto_id: producto.id,
          nombre: producto.nombre,
          categoria: producto.categoria&.nombre,
          stock_actual: stock_actual,
          stock_minimo: 10, # Puedes hacer esto configurable
          estado_stock: estado_stock,
          valor_inventario: (stock_actual * producto.precio.to_f).round(2),
          rotacion: nil # Puedes calcular índice de rotación
        }
      end
    end

    # Reporte de ingresos por período
    def self.reporte_ingresos(filtro_fecha: nil, agrupacion: 'mes')
      query = Orden.completadas
      
      if filtro_fecha && filtro_fecha[:fecha_inicio] && filtro_fecha[:fecha_fin]
        query = query.where('fecha_orden BETWEEN ? AND ?', 
                           filtro_fecha[:fecha_inicio], 
                           filtro_fecha[:fecha_fin])
      end
      
      case agrupacion
      when 'dia'
        format_sql = "TO_CHAR(fecha_orden, 'YYYY-MM-DD')"
      when 'semana'
        format_sql = "TO_CHAR(fecha_orden, 'YYYY-WW')"
      when 'anio'
        format_sql = "TO_CHAR(fecha_orden, 'YYYY')"
      else # mes
        format_sql = "TO_CHAR(fecha_orden, 'YYYY-MM')"
      end
      
      query.select(
        "#{format_sql} as periodo",
        'COUNT(*) as total_ordenes',
        'SUM(total) as ingresos_brutos',
        'AVG(total) as ticket_promedio'
      )
      .group('periodo')
      .order('periodo DESC')
      .map do |row|
        {
          periodo: row.periodo,
          total_ordenes: row.total_ordenes.to_i,
          ingresos_brutos: row.ingresos_brutos.to_f.round(2),
          ingresos_netos: (row.ingresos_brutos.to_f * 0.95).round(2), # Asumiendo 5% comisión
          comisiones: (row.ingresos_brutos.to_f * 0.05).round(2),
          ticket_promedio: row.ticket_promedio.to_f.round(2),
          crecimiento: nil # Puedes calcular vs período anterior
        }
      end
    end

    # Análisis de abandono de carrito
    def self.analisis_abandono_carrito
      total_activos = CarritoCompra.activos.count
      abandonados = CarritoCompra.abandonados
      total_abandonados = abandonados.count
      tasa_abandono = total_activos.positive? ? (total_abandonados.to_f / total_activos * 100) : 0
      
      valor_abandonado = abandonados.includes(detalle_carrito: :producto).sum do |carrito|
        carrito.detalle_carrito.sum { |d| (d.producto&.precio || 0) * d.cantidad }
      end
      
      {
        total_carritos_activos: total_activos,
        total_carritos_abandonados: total_abandonados,
        tasa_abandono: tasa_abandono.round(2),
        valor_total_abandonado: valor_abandonado.round(2),
        productos_mas_abandonados: [],
        tiempo_promedio_abandono: nil
      }
    end
  end
end

# frozen_string_literal: true

require 'graphql'
require_relative 'types/types'
require_relative 'types/report_types'
require_relative 'resolvers/reportes_resolver'
require_relative '../models/models'

module Types
  class QueryType < Types::BaseObject
    description 'Root query type para el servicio GraphQL de Marketplace'

    # ==================== CONSULTAS BÁSICAS ====================

    # Obtener todos los usuarios
    field :usuarios, [Types::UsuarioType], null: false do
      description 'Lista todos los usuarios del sistema'
    end

    def usuarios
      Usuario.all
    end

    # Obtener un usuario por ID
    field :usuario, Types::UsuarioType, null: true do
      description 'Obtiene un usuario por su ID'
      argument :id, ID, required: true
    end

    def usuario(id:)
      Usuario.find_by(id: id)
    end

    # Obtener todos los productos
    field :productos, [Types::ProductoType], null: false do
      description 'Lista todos los productos'
      argument :disponibles_solo, Boolean, required: false, default_value: false
    end

    def productos(disponibles_solo:)
      disponibles_solo ? Producto.disponibles : Producto.all
    end

    # Obtener un producto por ID
    field :producto, Types::ProductoType, null: true do
      description 'Obtiene un producto por su ID'
      argument :id, ID, required: true
    end

    def producto(id:)
      Producto.find_by(id: id)
    end

    # Obtener todas las categorías
    field :categorias, [Types::CategoriaType], null: false do
      description 'Lista todas las categorías'
    end

    def categorias
      Categoria.all
    end

    # Obtener una categoría por ID
    field :categoria, Types::CategoriaType, null: true do
      description 'Obtiene una categoría por su ID'
      argument :id, ID, required: true
    end

    def categoria(id:)
      Categoria.find_by(id: id)
    end

    # Obtener todos los emprendedores
    field :emprendedores, [Types::EmprendedorType], null: false do
      description 'Lista todos los emprendedores'
    end

    def emprendedores
      Emprendedor.all
    end

    # Obtener un emprendedor por ID
    field :emprendedor, Types::EmprendedorType, null: true do
      description 'Obtiene un emprendedor por su ID'
      argument :id, ID, required: true
    end

    def emprendedor(id:)
      Emprendedor.find_by(id: id)
    end

    # Obtener todas las órdenes
    field :ordenes, [Types::OrdenType], null: false do
      description 'Lista todas las órdenes'
      argument :estado, String, required: false
      argument :usuario_id, ID, required: false
    end

    def ordenes(estado: nil, usuario_id: nil)
      query = Orden.all
      query = query.where(estado: estado) if estado
      query = query.where(usuario_id: usuario_id) if usuario_id
      query
    end

    # Obtener una orden por ID
    field :orden, Types::OrdenType, null: true do
      description 'Obtiene una orden por su ID'
      argument :id, ID, required: true
    end

    def orden(id:)
      Orden.find_by(id: id)
    end

    # ==================== REPORTES Y ESTADÍSTICAS ====================

    # Métricas generales del dashboard
    field :metricas_generales, Types::MetricasGeneralesType, null: false do
      description 'Obtiene las métricas generales del sistema para el dashboard'
    end

    def metricas_generales
      Resolvers::ReportesResolver.metricas_generales
    end

    # Productos más vendidos
    field :productos_mas_vendidos, [Types::TopProductoType], null: false do
      description 'Obtiene los productos más vendidos'
      argument :limite, Integer, required: false, default_value: 10
      argument :filtro_fecha, Types::FiltroFechaInput, required: false
    end

    def productos_mas_vendidos(limite:, filtro_fecha: nil)
      Resolvers::ReportesResolver.productos_mas_vendidos(
        limite: limite,
        filtro_fecha: filtro_fecha&.to_h
      )
    end

    # Productos más rentables
    field :productos_mas_rentables, [Types::TopProductoType], null: false do
      description 'Obtiene los productos más rentables'
      argument :limite, Integer, required: false, default_value: 10
      argument :filtro_fecha, Types::FiltroFechaInput, required: false
    end

    def productos_mas_rentables(limite:, filtro_fecha: nil)
      Resolvers::ReportesResolver.productos_mas_rentables(
        limite: limite,
        filtro_fecha: filtro_fecha&.to_h
      )
    end

    # Estadísticas por categoría
    field :estadisticas_por_categoria, [Types::EstadisticaCategoriaType], null: false do
      description 'Obtiene estadísticas agrupadas por categoría'
    end

    def estadisticas_por_categoria
      Resolvers::ReportesResolver.estadisticas_por_categoria
    end

    # Estadísticas por emprendedor
    field :estadisticas_por_emprendedor, [Types::EstadisticaEmprendedorType], null: false do
      description 'Obtiene estadísticas agrupadas por emprendedor'
    end

    def estadisticas_por_emprendedor
      Resolvers::ReportesResolver.estadisticas_por_emprendedor
    end

    # Top compradores
    field :top_compradores, [Types::EstadisticaUsuarioType], null: false do
      description 'Obtiene los mejores compradores del sistema'
      argument :limite, Integer, required: false, default_value: 10
      argument :filtro_fecha, Types::FiltroFechaInput, required: false
    end

    def top_compradores(limite:, filtro_fecha: nil)
      Resolvers::ReportesResolver.top_compradores(
        limite: limite,
        filtro_fecha: filtro_fecha&.to_h
      )
    end

    # Reporte de inventario
    field :reporte_inventario, [Types::ReporteInventarioType], null: false do
      description 'Obtiene el reporte completo de inventario'
    end

    def reporte_inventario
      Resolvers::ReportesResolver.reporte_inventario
    end

    # Reporte de ingresos
    field :reporte_ingresos, [Types::ReporteIngresosType], null: false do
      description 'Obtiene el reporte de ingresos por período'
      argument :filtro_fecha, Types::FiltroFechaInput, required: false
      argument :agrupacion, String, required: false, default_value: 'mes'
    end

    def reporte_ingresos(filtro_fecha: nil, agrupacion:)
      Resolvers::ReportesResolver.reporte_ingresos(
        filtro_fecha: filtro_fecha&.to_h,
        agrupacion: agrupacion
      )
    end

    # Análisis de abandono de carrito
    field :analisis_abandono_carrito, Types::AnalisisAbandonoType, null: false do
      description 'Análisis de carritos abandonados'
    end

    def analisis_abandono_carrito
      Resolvers::ReportesResolver.analisis_abandono_carrito
    end

    # ==================== BÚSQUEDAS Y FILTROS ====================

    # Buscar productos
    field :buscar_productos, [Types::ProductoType], null: false do
      description 'Busca productos por nombre o descripción'
      argument :termino, String, required: true
    end

    def buscar_productos(termino:)
      Producto.where('nombre ILIKE ? OR descripcion ILIKE ?', "%#{termino}%", "%#{termino}%")
    end

    # Productos por categoría
    field :productos_por_categoria, [Types::ProductoType], null: false do
      description 'Obtiene productos de una categoría específica'
      argument :categoria_id, ID, required: true
    end

    def productos_por_categoria(categoria_id:)
      Producto.where(categoria_id: categoria_id)
    end

    # Productos por emprendedor
    field :productos_por_emprendedor, [Types::ProductoType], null: false do
      description 'Obtiene productos de un emprendedor específico'
      argument :emprendedor_id, ID, required: true
    end

    def productos_por_emprendedor(emprendedor_id:)
      Producto.where(emprendedor_id: emprendedor_id)
    end

    # Órdenes por usuario
    field :ordenes_por_usuario, [Types::OrdenType], null: false do
      description 'Obtiene todas las órdenes de un usuario'
      argument :usuario_id, ID, required: true
    end

    def ordenes_por_usuario(usuario_id:)
      Orden.where(usuario_id: usuario_id).order(fecha_orden: :desc)
    end

    # ==================== AGREGACIONES ====================

    # Conteo de productos
    field :total_productos, Integer, null: false do
      description 'Cuenta total de productos en el sistema'
      argument :disponibles_solo, Boolean, required: false, default_value: false
    end

    def total_productos(disponibles_solo:)
      disponibles_solo ? Producto.disponibles.count : Producto.count
    end

    # Conteo de usuarios
    field :total_usuarios, Integer, null: false do
      description 'Cuenta total de usuarios en el sistema'
    end

    def total_usuarios
      Usuario.count
    end

    # Conteo de órdenes
    field :total_ordenes, Integer, null: false do
      description 'Cuenta total de órdenes en el sistema'
      argument :estado, String, required: false
    end

    def total_ordenes(estado: nil)
      estado ? Orden.where(estado: estado).count : Orden.count
    end
  end
end

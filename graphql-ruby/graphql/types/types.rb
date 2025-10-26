# frozen_string_literal: true

require 'graphql'

module Types
  # Tipo base para todos los objetos GraphQL
  class BaseObject < GraphQL::Schema::Object
    field_class Types::BaseField
  end

  class BaseField < GraphQL::Schema::Field
    argument_class Types::BaseArgument
  end

  class BaseArgument < GraphQL::Schema::Argument
  end

  # Tipo Usuario
  class UsuarioType < BaseObject
    field :id, ID, null: false
    field :nombre, String, null: true
    field :apellido, String, null: true
    field :email, String, null: true
    field :telefono, String, null: true
    field :direccion, String, null: true
    field :created_at, GraphQL::Types::ISO8601DateTime, null: true
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: true
    
    # Relaciones
    field :ordenes, [Types::OrdenType], null: true
    field :emprendedor, Types::EmprendedorType, null: true
    
    # Campos calculados
    field :nombre_completo, String, null: true
    
    def nombre_completo
      "#{object.nombre} #{object.apellido}".strip
    end
  end

  # Tipo Producto
  class ProductoType < BaseObject
    field :id, ID, null: false
    field :nombre, String, null: true
    field :descripcion, String, null: true
    field :precio, Float, null: true
    field :stock, Integer, null: true
    field :imagen_url, String, null: true
    field :categoria_id, Integer, null: true
    field :emprendedor_id, Integer, null: true
    field :created_at, GraphQL::Types::ISO8601DateTime, null: true
    
    # Relaciones
    field :categoria, Types::CategoriaType, null: true
    field :emprendedor, Types::EmprendedorType, null: true
    
    # Campos calculados
    field :disponible, Boolean, null: false
    field :precio_formateado, String, null: true
    
    def disponible
      object.stock.to_i > 0
    end
    
    def precio_formateado
      "$#{format('%.2f', object.precio || 0)}"
    end
  end

  # Tipo Categoría
  class CategoriaType < BaseObject
    field :id, ID, null: false
    field :nombre, String, null: true
    field :descripcion, String, null: true
    field :created_at, GraphQL::Types::ISO8601DateTime, null: true
    
    # Relaciones
    field :productos, [Types::ProductoType], null: true
    
    # Estadísticas
    field :total_productos, Integer, null: false
    
    def total_productos
      object.productos.count
    end
  end

  # Tipo Emprendedor
  class EmprendedorType < BaseObject
    field :id, ID, null: false
    field :nombre_negocio, String, null: true
    field :descripcion, String, null: true
    field :logo_url, String, null: true
    field :telefono, String, null: true
    field :email, String, null: true
    field :direccion, String, null: true
    field :usuario_id, Integer, null: true
    field :created_at, GraphQL::Types::ISO8601DateTime, null: true
    
    # Relaciones
    field :usuario, Types::UsuarioType, null: true
    field :productos, [Types::ProductoType], null: true
    
    # Estadísticas
    field :total_productos, Integer, null: false
    field :productos_disponibles, Integer, null: false
    
    def total_productos
      object.productos.count
    end
    
    def productos_disponibles
      object.productos.disponibles.count
    end
  end

  # Tipo Orden
  class OrdenType < BaseObject
    field :id, ID, null: false
    field :usuario_id, Integer, null: true
    field :total, Float, null: true
    field :estado, String, null: true
    field :fecha_orden, GraphQL::Types::ISO8601DateTime, null: true
    field :direccion_envio, String, null: true
    field :created_at, GraphQL::Types::ISO8601DateTime, null: true
    
    # Relaciones
    field :usuario, Types::UsuarioType, null: true
    field :detalle_orden, [Types::DetalleOrdenType], null: true
    field :pago, Types::PagoType, null: true
    
    # Campos calculados
    field :total_items, Integer, null: false
    field :total_formateado, String, null: true
    
    def total_items
      object.detalle_orden.sum(:cantidad)
    end
    
    def total_formateado
      "$#{format('%.2f', object.total || 0)}"
    end
  end

  # Tipo Detalle Orden
  class DetalleOrdenType < BaseObject
    field :id, ID, null: false
    field :orden_id, Integer, null: true
    field :producto_id, Integer, null: true
    field :cantidad, Integer, null: true
    field :precio_unitario, Float, null: true
    field :subtotal, Float, null: true
    
    # Relaciones
    field :orden, Types::OrdenType, null: true
    field :producto, Types::ProductoType, null: true
    
    # Campos calculados
    field :subtotal_formateado, String, null: true
    
    def subtotal_formateado
      "$#{format('%.2f', object.subtotal || 0)}"
    end
  end

  # Tipo Pago
  class PagoType < BaseObject
    field :id, ID, null: false
    field :orden_id, Integer, null: true
    field :metodo_pago, String, null: true
    field :monto, Float, null: true
    field :estado, String, null: true
    field :fecha_pago, GraphQL::Types::ISO8601DateTime, null: true
    field :referencia_transaccion, String, null: true
    
    # Relaciones
    field :orden, Types::OrdenType, null: true
    
    # Campos calculados
    field :monto_formateado, String, null: true
    
    def monto_formateado
      "$#{format('%.2f', object.monto || 0)}"
    end
  end

  # Tipo Carrito de Compra
  class CarritoCompraType < BaseObject
    field :id, ID, null: false
    field :usuario_id, Integer, null: true
    field :estado, String, null: true
    field :created_at, GraphQL::Types::ISO8601DateTime, null: true
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: true
    
    # Relaciones
    field :usuario, Types::UsuarioType, null: true
    field :detalle_carrito, [Types::DetalleCarritoType], null: true
    
    # Campos calculados
    field :total_items, Integer, null: false
    field :total_carrito, Float, null: false
    
    def total_items
      object.detalle_carrito.sum(:cantidad)
    end
    
    def total_carrito
      object.detalle_carrito.includes(:producto).sum { |d| (d.producto&.precio || 0) * d.cantidad }
    end
  end

  # Tipo Detalle Carrito
  class DetalleCarritoType < BaseObject
    field :id, ID, null: false
    field :carrito_id, Integer, null: true
    field :producto_id, Integer, null: true
    field :cantidad, Integer, null: true
    
    # Relaciones
    field :carrito_compra, Types::CarritoCompraType, null: true
    field :producto, Types::ProductoType, null: true
    
    # Campos calculados
    field :subtotal, Float, null: false
    
    def subtotal
      (object.producto&.precio || 0) * object.cantidad
    end
  end
end

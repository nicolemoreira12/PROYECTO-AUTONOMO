# frozen_string_literal: true

require 'active_record'

# Modelo Usuario
class Usuario < ActiveRecord::Base
  self.table_name = 'usuario'
  
  has_many :ordenes, foreign_key: 'usuario_id', class_name: 'Orden'
  has_one :emprendedor, foreign_key: 'usuario_id', class_name: 'Emprendedor'
  has_one :carrito_compra, foreign_key: 'usuario_id', class_name: 'CarritoCompra'

  validates :nombre, :apellido, :email, presence: true
  validates :email, uniqueness: true
end

# Modelo Producto
class Producto < ActiveRecord::Base
  self.table_name = 'producto'
  
  belongs_to :categoria, foreign_key: 'categoria_id', optional: true
  belongs_to :emprendedor, foreign_key: 'emprendedor_id', optional: true
  has_many :detalle_orden, foreign_key: 'producto_id', class_name: 'DetalleOrden'
  has_many :detalle_carrito, foreign_key: 'producto_id', class_name: 'DetalleCarrito'

  validates :nombre, :precio, presence: true
  validates :precio, numericality: { greater_than_or_equal_to: 0 }

  scope :disponibles, -> { where('stock > ?', 0) }
  scope :agotados, -> { where(stock: 0) }
end

# Modelo Categoría
class Categoria < ActiveRecord::Base
  self.table_name = 'categoria'
  
  has_many :productos, foreign_key: 'categoria_id', class_name: 'Producto'

  validates :nombre, presence: true, uniqueness: true
end

# Modelo Emprendedor
class Emprendedor < ActiveRecord::Base
  self.table_name = 'emprendedor'
  
  belongs_to :usuario, foreign_key: 'usuario_id', optional: true
  has_many :productos, foreign_key: 'emprendedor_id', class_name: 'Producto'

  validates :nombre_negocio, presence: true
end

# Modelo Orden
class Orden < ActiveRecord::Base
  self.table_name = 'orden'
  
  belongs_to :usuario, foreign_key: 'usuario_id', optional: true
  has_many :detalle_orden, foreign_key: 'orden_id', class_name: 'DetalleOrden'
  has_one :pago, foreign_key: 'orden_id', class_name: 'Pago'

  validates :total, presence: true
  validates :total, numericality: { greater_than_or_equal_to: 0 }

  scope :completadas, -> { where(estado: 'completada') }
  scope :pendientes, -> { where(estado: 'pendiente') }
  scope :canceladas, -> { where(estado: 'cancelada') }
  scope :en_rango_fecha, ->(desde, hasta) { where('fecha_orden BETWEEN ? AND ?', desde, hasta) }
end

# Modelo Detalle Orden
class DetalleOrden < ActiveRecord::Base
  self.table_name = 'detalle_orden'
  
  belongs_to :orden, foreign_key: 'orden_id', optional: true
  belongs_to :producto, foreign_key: 'producto_id', optional: true

  validates :cantidad, :precio_unitario, :subtotal, presence: true
  validates :cantidad, numericality: { greater_than: 0 }
end

# Modelo Pago
class Pago < ActiveRecord::Base
  self.table_name = 'pago'
  
  belongs_to :orden, foreign_key: 'orden_id', optional: true

  validates :monto, presence: true
  validates :monto, numericality: { greater_than: 0 }
end

# Modelo Carrito de Compra
class CarritoCompra < ActiveRecord::Base
  self.table_name = 'carrito_compra'
  
  belongs_to :usuario, foreign_key: 'usuario_id', optional: true
  has_many :detalle_carrito, foreign_key: 'carrito_id', class_name: 'DetalleCarrito'

  scope :activos, -> { where.not(estado: 'completado') }
  scope :abandonados, -> { 
    where(estado: 'activo')
      .where('updated_at < ?', 24.hours.ago) 
  }
end

# Modelo Detalle Carrito
class DetalleCarrito < ActiveRecord::Base
  self.table_name = 'detalle_carrito'
  
  belongs_to :carrito_compra, foreign_key: 'carrito_id', optional: true
  belongs_to :producto, foreign_key: 'producto_id', optional: true

  validates :cantidad, presence: true
  validates :cantidad, numericality: { greater_than: 0 }
end

# Modelo Transacción
class Transaccion < ActiveRecord::Base
  self.table_name = 'transaccion'
  
  validates :monto, presence: true
  validates :monto, numericality: { greater_than: 0 }
end

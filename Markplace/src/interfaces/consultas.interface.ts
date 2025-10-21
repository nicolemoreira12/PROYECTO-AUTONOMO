// Interfaces para definir la estructura de los datos de reportes y consultas complejas
// Estas interfaces aseguran type-safety en todo el modulo de reportes

// Interface para filtros de fecha en reportes
export interface FiltroFecha {
  fechaInicio: Date;
  fechaFin: Date;
}

// Interface para filtros de rango de precios
export interface FiltroPrecio {
  precioMinimo?: number;
  precioMaximo?: number;
}

// Interface para paginacion de resultados
export interface Paginacion {
  pagina: number;
  limite: number;
}

// Interface para ordenamiento de resultados
export interface Ordenamiento {
  campo: string;
  direccion: 'ASC' | 'DESC';
}

// Interface para estadisticas de ventas por producto
export interface EstadisticaProducto {
  idProducto: number;
  nombreProducto: string;
  totalVendido: number;
  cantidadVendida: number;
  ingresosGenerados: number;
  categoria: string;
  emprendedor: string;
}

// Interface para estadisticas de ventas por categoria
export interface EstadisticaCategoria {
  idCategoria: number;
  nombreCategoria: string;
  totalProductos: number;
  totalVentas: number;
  ingresosGenerados: number;
  productoMasVendido: string;
}

// Interface para estadisticas de emprendedores
export interface EstadisticaEmprendedor {
  idEmprendedor: number;
  nombreTienda: string;
  totalProductos: number;
  totalVentas: number;
  ingresosGenerados: number;
  rating: number;
  productoMasVendido: string;
}

// Interface para estadisticas de usuarios/compradores
export interface EstadisticaUsuario {
  idUsuario: number;
  nombreCompleto: string;
  email: string;
  totalOrdenes: number;
  totalGastado: number;
  promedioCompra: number;
  ultimaCompra: Date;
  categoriaFavorita: string;
}

// Interface para reporte de inventario y stock
export interface ReporteInventario {
  idProducto: number;
  nombreProducto: string;
  categoria: string;
  emprendedor: string;
  stockActual: number;
  stockMinimo: number;
  precio: number;
  valorInventario: number;
  estado: 'Disponible' | 'Stock Bajo' | 'Agotado';
}

// Interface para reporte de ordenes
export interface ReporteOrden {
  idOrden: number;
  fechaOrden: Date;
  usuario: string;
  estado: string;
  cantidadProductos: number;
  subtotal: number;
  total: number;
  metodoPago: string;
}

// Interface para reporte de ingresos por periodo
export interface ReporteIngresos {
  periodo: string;
  totalOrdenes: number;
  ingresosGenerados: number;
  promedioOrden: number;
  productosVendidos: number;
}

// Interface para top productos (mas vendidos o mas rentables)
export interface TopProducto {
  posicion: number;
  idProducto: number;
  nombreProducto: string;
  categoria: string;
  emprendedor: string;
  cantidadVendida?: number;
  ingresosGenerados?: number;
  valorMetrica: number;
}

// Interface para metricas generales del dashboard
export interface MetricasGenerales {
  totalUsuarios: number;
  totalProductos: number;
  totalOrdenes: number;
  totalIngresos: number;
  ordenesEnProceso: number;
  productosAgotados: number;
  crecimientoMensual: number;
  ticketPromedio: number;
}

// Interface para analisis de tendencias
export interface TendenciaVentas {
  fecha: Date;
  totalVentas: number;
  totalOrdenes: number;
  promedioOrden: number;
  productosVendidos: number;
}

// Interface para respuesta paginada generica
export interface RespuestaPaginada<T> {
  datos: T[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

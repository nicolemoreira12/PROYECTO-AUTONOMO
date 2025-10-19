// Archivo de ejemplo y documentacion de uso del ReportesRepository
// Muestra como utilizar cada metodo del repository para obtener reportes

import { ReportesRepository } from './reportes.repository';
import { FiltroFecha } from '../interfaces/consultas.interface';

// Instancia del repository
const reportesRepo = new ReportesRepository();

// EJEMPLO 1: Obtener metricas generales del sistema
async function ejemploMetricasGenerales() {
  const metricas = await reportesRepo.obtenerMetricasGenerales();
  console.log('Metricas del sistema:', metricas);
  // Retorna: totalUsuarios, totalProductos, totalOrdenes, totalIngresos, etc.
}

// EJEMPLO 2: Obtener top 10 productos mas vendidos
async function ejemploProductosMasVendidos() {
  const topProductos = await reportesRepo.obtenerProductosMasVendidos(10);
  console.log('Top 10 productos mas vendidos:', topProductos);
}

// EJEMPLO 3: Obtener productos mas vendidos con filtro de fecha
async function ejemploProductosConFiltroFecha() {
  const filtro: FiltroFecha = {
    fechaInicio: new Date('2024-01-01'),
    fechaFin: new Date('2024-12-31'),
  };
  const topProductos = await reportesRepo.obtenerProductosMasVendidos(5, filtro);
  console.log('Top 5 productos en 2024:', topProductos);
}

// EJEMPLO 4: Obtener productos mas rentables
async function ejemploProductosMasRentables() {
  const topRentables = await reportesRepo.obtenerProductosMasRentables(10);
  console.log('Top 10 productos mas rentables:', topRentables);
}

// EJEMPLO 5: Obtener estadisticas de un producto especifico
async function ejemploEstadisticasProducto() {
  const idProducto = 1;
  const estadisticas = await reportesRepo.obtenerEstadisticasProducto(idProducto);
  if (estadisticas) {
    console.log('Estadisticas del producto:', estadisticas);
    // Retorna: totalVendido, cantidadVendida, ingresosGenerados, etc.
  }
}

// EJEMPLO 6: Obtener estadisticas por categoria
async function ejemploEstadisticasCategorias() {
  const estadisticas = await reportesRepo.obtenerEstadisticasPorCategoria();
  console.log('Estadisticas por categoria:', estadisticas);
  // Retorna array con datos de cada categoria
}

// EJEMPLO 7: Obtener estadisticas por emprendedor
async function ejemploEstadisticasEmprendedores() {
  const filtro: FiltroFecha = {
    fechaInicio: new Date('2024-01-01'),
    fechaFin: new Date('2024-12-31'),
  };
  const estadisticas = await reportesRepo.obtenerEstadisticasPorEmprendedor(filtro);
  console.log('Estadisticas de emprendedores en 2024:', estadisticas);
}

// EJEMPLO 8: Obtener reporte de inventario con paginacion
async function ejemploReporteInventario() {
  const paginacion = { pagina: 1, limite: 20 };
  const resultado = await reportesRepo.obtenerReporteInventario(paginacion);
  console.log(`Total productos: ${resultado.total}`);
  console.log('Productos (pagina 1):', resultado.datos);
}

// EJEMPLO 9: Obtener reporte de inventario filtrado por categoria
async function ejemploInventarioPorCategoria() {
  const paginacion = { pagina: 1, limite: 10 };
  const idCategoria = 2;
  const resultado = await reportesRepo.obtenerReporteInventario(
    paginacion,
    idCategoria
  );
  console.log('Inventario de la categoria:', resultado.datos);
}

// EJEMPLO 10: Obtener productos con stock bajo
async function ejemploProductosStockBajo() {
  const paginacion = { pagina: 1, limite: 50 };
  const resultado = await reportesRepo.obtenerReporteInventario(
    paginacion,
    undefined,
    undefined,
    'Stock Bajo'
  );
  console.log('Productos con stock bajo:', resultado.datos);
}

// EJEMPLO 11: Obtener productos agotados
async function ejemploProductosAgotados() {
  const paginacion = { pagina: 1, limite: 50 };
  const resultado = await reportesRepo.obtenerReporteInventario(
    paginacion,
    undefined,
    undefined,
    'Agotado'
  );
  console.log('Productos agotados:', resultado.datos);
}

// EJEMPLO 12: Combinar multiples reportes para dashboard
async function ejemploDashboardCompleto() {
  const [metricas, topVendidos, topRentables, categorias] = await Promise.all([
    reportesRepo.obtenerMetricasGenerales(),
    reportesRepo.obtenerProductosMasVendidos(5),
    reportesRepo.obtenerProductosMasRentables(5),
    reportesRepo.obtenerEstadisticasPorCategoria(),
  ]);

  const dashboard = {
    metricas,
    topVendidos,
    topRentables,
    categorias,
  };

  console.log('Dashboard completo:', dashboard);
}

// Exporta las funciones de ejemplo
export {
  ejemploMetricasGenerales,
  ejemploProductosMasVendidos,
  ejemploProductosConFiltroFecha,
  ejemploProductosMasRentables,
  ejemploEstadisticasProducto,
  ejemploEstadisticasCategorias,
  ejemploEstadisticasEmprendedores,
  ejemploReporteInventario,
  ejemploInventarioPorCategoria,
  ejemploProductosStockBajo,
  ejemploProductosAgotados,
  ejemploDashboardCompleto,
};

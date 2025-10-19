// Ejemplos de uso avanzado del ReportesRepository
// Muestra como utilizar consultas complejas y agregaciones para analisis detallados

import { ReportesRepository } from './reportes.repository';
import { FiltroFecha } from '../interfaces/consultas.interface';

const reportesRepo = new ReportesRepository();

// ==================== REPORTES DE ORDENES ====================

// EJEMPLO 1: Obtener todas las ordenes con paginacion
async function ejemploReporteOrdenesBasico() {
  const paginacion = { pagina: 1, limite: 20 };
  const resultado = await reportesRepo.obtenerReporteOrdenes(paginacion);
  console.log(`Total ordenes: ${resultado.total}`);
  console.log('Ordenes (pagina 1):', resultado.datos);
}

// EJEMPLO 2: Filtrar ordenes por estado
async function ejemploOrdenesPorEstado() {
  const paginacion = { pagina: 1, limite: 10 };
  const resultado = await reportesRepo.obtenerReporteOrdenes(
    paginacion,
    undefined,
    'En Proceso'
  );
  console.log('Ordenes en proceso:', resultado.datos);
}

// EJEMPLO 3: Obtener ordenes de un usuario especifico
async function ejemploOrdenesDeUsuario() {
  const paginacion = { pagina: 1, limite: 50 };
  const idUsuario = 5;
  const resultado = await reportesRepo.obtenerReporteOrdenes(
    paginacion,
    undefined,
    undefined,
    idUsuario
  );
  console.log(`Ordenes del usuario ${idUsuario}:`, resultado.datos);
}

// EJEMPLO 4: Ordenes en un rango de fechas
async function ejemploOrdenesPorFecha() {
  const paginacion = { pagina: 1, limite: 100 };
  const filtro: FiltroFecha = {
    fechaInicio: new Date('2024-01-01'),
    fechaFin: new Date('2024-12-31'),
  };
  const resultado = await reportesRepo.obtenerReporteOrdenes(
    paginacion,
    filtro
  );
  console.log('Ordenes en 2024:', resultado.datos);
}

// ==================== ESTADISTICAS DE USUARIOS ====================

// EJEMPLO 5: Obtener estadisticas completas de un usuario
async function ejemploEstadisticasUsuario() {
  const idUsuario = 3;
  const estadisticas = await reportesRepo.obtenerEstadisticasUsuario(idUsuario);
  if (estadisticas) {
    console.log('Estadisticas del usuario:', estadisticas);
    console.log(`- Total gastado: $${estadisticas.totalGastado}`);
    console.log(`- Promedio por compra: $${estadisticas.promedioCompra}`);
    console.log(`- Categoria favorita: ${estadisticas.categoriaFavorita}`);
  }
}

// EJEMPLO 6: Estadisticas de usuario en periodo especifico
async function ejemploEstadisticasUsuarioPeriodo() {
  const idUsuario = 3;
  const filtro: FiltroFecha = {
    fechaInicio: new Date('2024-06-01'),
    fechaFin: new Date('2024-12-31'),
  };
  const estadisticas = await reportesRepo.obtenerEstadisticasUsuario(
    idUsuario,
    filtro
  );
  console.log('Estadisticas del segundo semestre 2024:', estadisticas);
}

// ==================== REPORTES DE INGRESOS ====================

// EJEMPLO 7: Reporte de ingresos mensuales
async function ejemploIngresosMensuales() {
  const filtro: FiltroFecha = {
    fechaInicio: new Date('2024-01-01'),
    fechaFin: new Date('2024-12-31'),
  };
  const reporte = await reportesRepo.obtenerReporteIngresos(filtro, 'mes');
  console.log('Ingresos mensuales 2024:', reporte);
  // Muestra ingresos agrupados por mes
}

// EJEMPLO 8: Reporte de ingresos diarios
async function ejemploIngresosDiarios() {
  const filtro: FiltroFecha = {
    fechaInicio: new Date('2024-10-01'),
    fechaFin: new Date('2024-10-31'),
  };
  const reporte = await reportesRepo.obtenerReporteIngresos(filtro, 'dia');
  console.log('Ingresos diarios de octubre:', reporte);
}

// EJEMPLO 9: Reporte de ingresos anuales
async function ejemploIngresosAnuales() {
  const filtro: FiltroFecha = {
    fechaInicio: new Date('2020-01-01'),
    fechaFin: new Date('2024-12-31'),
  };
  const reporte = await reportesRepo.obtenerReporteIngresos(filtro, 'anio');
  console.log('Ingresos anuales historicos:', reporte);
}

// ==================== ANALISIS DE TENDENCIAS ====================

// EJEMPLO 10: Analizar tendencias diarias del ultimo mes
async function ejemploTendenciasDiarias() {
  const fechaFin = new Date();
  const fechaInicio = new Date();
  fechaInicio.setMonth(fechaInicio.getMonth() - 1);

  const filtro: FiltroFecha = { fechaInicio, fechaFin };
  const tendencias = await reportesRepo.analizarTendencias(filtro, 'dia');
  console.log('Tendencias diarias del ultimo mes:', tendencias);
}

// EJEMPLO 11: Tendencias semanales por categoria
async function ejemploTendenciasPorCategoria() {
  const filtro: FiltroFecha = {
    fechaInicio: new Date('2024-01-01'),
    fechaFin: new Date('2024-12-31'),
  };
  const idCategoria = 2;
  const tendencias = await reportesRepo.analizarTendencias(
    filtro,
    'semana',
    idCategoria
  );
  console.log(`Tendencias semanales categoria ${idCategoria}:`, tendencias);
}

// ==================== COMPARACION DE PERIODOS ====================

// EJEMPLO 12: Comparar ventas del mes actual vs mes anterior
async function ejemploCompararMeses() {
  const fechaActual = new Date();

  // Mes actual
  const inicioMesActual = new Date(
    fechaActual.getFullYear(),
    fechaActual.getMonth(),
    1
  );
  const finMesActual = new Date(
    fechaActual.getFullYear(),
    fechaActual.getMonth() + 1,
    0
  );

  // Mes anterior
  const inicioMesAnterior = new Date(
    fechaActual.getFullYear(),
    fechaActual.getMonth() - 1,
    1
  );
  const finMesAnterior = new Date(
    fechaActual.getFullYear(),
    fechaActual.getMonth(),
    0
  );

  const comparacion = await reportesRepo.compararPeriodos(
    { fechaInicio: inicioMesAnterior, fechaFin: finMesAnterior },
    { fechaInicio: inicioMesActual, fechaFin: finMesActual }
  );

  console.log('Comparacion mes actual vs mes anterior:');
  console.log('Variacion en ordenes:', comparacion.variaciones.ordenesVariacion, '%');
  console.log('Variacion en ingresos:', comparacion.variaciones.ingresosVariacion, '%');
  console.log('Variacion en ticket promedio:', comparacion.variaciones.ticketVariacion, '%');
}

// EJEMPLO 13: Comparar trimestres
async function ejemploCompararTrimestres() {
  const año = 2024;

  // Q1 (Enero-Marzo)
  const q1 = {
    fechaInicio: new Date(año, 0, 1),
    fechaFin: new Date(año, 2, 31),
  };

  // Q2 (Abril-Junio)
  const q2 = {
    fechaInicio: new Date(año, 3, 1),
    fechaFin: new Date(año, 5, 30),
  };

  const comparacion = await reportesRepo.compararPeriodos(q1, q2);
  console.log('Comparacion Q1 vs Q2 2024:', comparacion);
}

// ==================== TOP COMPRADORES ====================

// EJEMPLO 14: Obtener top 10 compradores de todos los tiempos
async function ejemploTopCompradores() {
  const topCompradores = await reportesRepo.obtenerTopCompradores(10);
  console.log('Top 10 compradores:', topCompradores);
}

// EJEMPLO 15: Top compradores del ultimo año
async function ejemploTopCompradoresAnual() {
  const fechaInicio = new Date();
  fechaInicio.setFullYear(fechaInicio.getFullYear() - 1);

  const filtro: FiltroFecha = {
    fechaInicio,
    fechaFin: new Date(),
  };

  const topCompradores = await reportesRepo.obtenerTopCompradores(20, filtro);
  console.log('Top 20 compradores del ultimo año:', topCompradores);
}

// ==================== ANALISIS DE ABANDONO ====================

// EJEMPLO 16: Analizar abandono del carrito
async function ejemploAbandonoCarrito() {
  const analisis = await reportesRepo.analizarAbandonoCarrito();
  console.log('Analisis de abandono de carrito:');
  console.log(`- Carritos activos: ${analisis.totalCarritosActivos}`);
  console.log(`- Tasa de abandono: ${analisis.tasaAbandonoEstimada}%`);
  console.log('- Productos mas abandonados:', analisis.productosAbandonados);
}

// ==================== ANALISIS DE PRECIOS ====================

// EJEMPLO 17: Analizar precios promedio por categoria
async function ejemploPreciosPorCategoria() {
  const analisis = await reportesRepo.analizarPreciosPorCategoria();
  console.log('Analisis de precios por categoria:', analisis);
  // Muestra precio promedio, minimo y maximo por categoria
}

// ==================== PROYECCIONES ====================

// EJEMPLO 18: Proyectar ventas basado en ultimos 3 meses
async function ejemploProyeccionVentas() {
  const proyeccion = await reportesRepo.proyectarVentas(3);
  console.log('Proyeccion de ventas:');
  console.log(`- Meses analizados: ${proyeccion.mesesAnalizados}`);
  console.log(`- Promedio ordenes mensuales: ${proyeccion.promedioOrdenesMessuales}`);
  console.log(`- Proyeccion proximo mes: ${proyeccion.proyeccionProximoMes.ordenes} ordenes`);
  console.log(`- Ingresos esperados: $${proyeccion.proyeccionProximoMes.ingresos}`);
}

// EJEMPLO 19: Proyeccion basada en 6 meses
async function ejemploProyeccionSemestral() {
  const proyeccion = await reportesRepo.proyectarVentas(6);
  console.log('Proyeccion basada en 6 meses:', proyeccion);
}

// ==================== DASHBOARD EJECUTIVO COMPLETO ====================

// EJEMPLO 20: Dashboard ejecutivo con todos los KPIs principales
async function ejemploDashboardEjecutivo() {
  const fechaActual = new Date();
  const inicioMesActual = new Date(
    fechaActual.getFullYear(),
    fechaActual.getMonth(),
    1
  );
  const filtroMesActual: FiltroFecha = {
    fechaInicio: inicioMesActual,
    fechaFin: fechaActual,
  };

  // Ejecuta multiples consultas en paralelo
  const [
    metricas,
    topVendidos,
    topCompradores,
    ingresos,
    tendencias,
    proyeccion,
    abandono,
  ] = await Promise.all([
    reportesRepo.obtenerMetricasGenerales(),
    reportesRepo.obtenerProductosMasVendidos(5, filtroMesActual),
    reportesRepo.obtenerTopCompradores(5, filtroMesActual),
    reportesRepo.obtenerReporteIngresos(filtroMesActual, 'dia'),
    reportesRepo.analizarTendencias(filtroMesActual, 'dia'),
    reportesRepo.proyectarVentas(3),
    reportesRepo.analizarAbandonoCarrito(),
  ]);

  const dashboard = {
    metricas,
    topVendidos,
    topCompradores,
    ingresos,
    tendencias,
    proyeccion,
    abandono,
  };

  console.log('Dashboard Ejecutivo Completo:', dashboard);
  return dashboard;
}

// Exporta todas las funciones de ejemplo
export {
  ejemploReporteOrdenesBasico,
  ejemploOrdenesPorEstado,
  ejemploOrdenesDeUsuario,
  ejemploOrdenesPorFecha,
  ejemploEstadisticasUsuario,
  ejemploEstadisticasUsuarioPeriodo,
  ejemploIngresosMensuales,
  ejemploIngresosDiarios,
  ejemploIngresosAnuales,
  ejemploTendenciasDiarias,
  ejemploTendenciasPorCategoria,
  ejemploCompararMeses,
  ejemploCompararTrimestres,
  ejemploTopCompradores,
  ejemploTopCompradoresAnual,
  ejemploAbandonoCarrito,
  ejemploPreciosPorCategoria,
  ejemploProyeccionVentas,
  ejemploProyeccionSemestral,
  ejemploDashboardEjecutivo,
};

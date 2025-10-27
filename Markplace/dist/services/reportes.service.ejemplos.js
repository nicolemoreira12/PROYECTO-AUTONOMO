"use strict";
// Ejemplos de uso del ReportesService
// Muestra como utilizar el service para obtener reportes con logica de negocio aplicada
Object.defineProperty(exports, "__esModule", { value: true });
exports.ejemploMetricasGenerales = ejemploMetricasGenerales;
exports.ejemploDashboardCompleto = ejemploDashboardCompleto;
exports.ejemploTopProductos = ejemploTopProductos;
exports.ejemploProductosPeriodo = ejemploProductosPeriodo;
exports.ejemploValidacionLimite = ejemploValidacionLimite;
exports.ejemploEstadisticasProducto = ejemploEstadisticasProducto;
exports.ejemploEstadisticasCategorias = ejemploEstadisticasCategorias;
exports.ejemploEstadisticasEmprendedores = ejemploEstadisticasEmprendedores;
exports.ejemploReporteInventario = ejemploReporteInventario;
exports.ejemploResumenInventario = ejemploResumenInventario;
exports.ejemploInventarioPorEstado = ejemploInventarioPorEstado;
exports.ejemploReporteOrdenes = ejemploReporteOrdenes;
exports.ejemploEstadisticasUsuario = ejemploEstadisticasUsuario;
exports.ejemploTopCompradores = ejemploTopCompradores;
exports.ejemploIngresosMensuales = ejemploIngresosMensuales;
exports.ejemploTendencias = ejemploTendencias;
exports.ejemploCompararPeriodos = ejemploCompararPeriodos;
exports.ejemploValidacionFechas = ejemploValidacionFechas;
exports.ejemploAbandonoCarrito = ejemploAbandonoCarrito;
exports.ejemploProyeccionVentas = ejemploProyeccionVentas;
exports.ejemploExportarReporte = ejemploExportarReporte;
exports.ejemploExportarIngresos = ejemploExportarIngresos;
exports.ejemploPipelineAnalisisMensual = ejemploPipelineAnalisisMensual;
const reportes_service_1 = require("./reportes.service");
const reportesService = new reportes_service_1.ReportesService();
// ==================== DASHBOARD Y METRICAS ====================
// EJEMPLO 1: Obtener metricas generales formateadas
async function ejemploMetricasGenerales() {
    try {
        const metricas = await reportesService.obtenerMetricasGenerales();
        console.log('Metricas del sistema:', metricas);
        console.log(`Total ingresos: $${metricas.totalIngresos.toLocaleString()}`);
        console.log(`Crecimiento mensual: ${metricas.crecimientoMensual}%`);
    }
    catch (error) {
        console.error('Error al obtener metricas:', error);
    }
}
// EJEMPLO 2: Generar dashboard completo con alertas
async function ejemploDashboardCompleto() {
    try {
        const dashboard = await reportesService.generarDashboardPrincipal();
        console.log('Dashboard Principal:', dashboard);
        console.log('Estado del inventario:', dashboard.estadoInventario);
        console.log('Alertas del sistema:', dashboard.alertas);
    }
    catch (error) {
        console.error('Error al generar dashboard:', error);
    }
}
// ==================== PRODUCTOS ====================
// EJEMPLO 3: Top 10 productos mas vendidos
async function ejemploTopProductos() {
    try {
        const topProductos = await reportesService.obtenerProductosMasVendidos(10);
        console.log('Top 10 productos mas vendidos:', topProductos);
    }
    catch (error) {
        console.error('Error:', error);
    }
}
// EJEMPLO 4: Productos mas vendidos en un periodo con validacion
async function ejemploProductosPeriodo() {
    try {
        const productos = await reportesService.obtenerProductosMasVendidos(5, '2024-01-01', '2024-12-31');
        console.log('Top 5 productos en 2024:', productos);
    }
    catch (error) {
        console.error('Error:', error);
    }
}
// EJEMPLO 5: Manejo de errores con limite invalido
async function ejemploValidacionLimite() {
    try {
        // Esto lanzara un error porque el limite es mayor a 100
        await reportesService.obtenerProductosMasVendidos(150);
    }
    catch (error) {
        console.error('Error esperado:', error); // "El limite debe estar entre 1 y 100"
    }
}
// EJEMPLO 6: Estadisticas de producto especifico
async function ejemploEstadisticasProducto() {
    try {
        const idProducto = 1;
        const estadisticas = await reportesService.obtenerEstadisticasProducto(idProducto);
        if (estadisticas) {
            console.log(`Estadisticas del producto ${idProducto}:`, estadisticas);
            console.log(`Total vendido: ${estadisticas.totalVendido} unidades`);
            console.log(`Ingresos: $${estadisticas.ingresosGenerados}`);
        }
        else {
            console.log('Producto no encontrado o sin ventas');
        }
    }
    catch (error) {
        console.error('Error:', error);
    }
}
// ==================== CATEGORIAS Y EMPRENDEDORES ====================
// EJEMPLO 7: Estadisticas por categoria con ticket promedio
async function ejemploEstadisticasCategorias() {
    try {
        const estadisticas = await reportesService.obtenerEstadisticasPorCategoria();
        console.log('Estadisticas por categoria:', estadisticas);
        // Mostrar categoria con mayor ticket promedio
        const mejorTicket = estadisticas.reduce((prev, current) => current.ticketPromedio > prev.ticketPromedio ? current : prev);
        console.log('Categoria con mejor ticket promedio:', mejorTicket);
    }
    catch (error) {
        console.error('Error:', error);
    }
}
// EJEMPLO 8: Estadisticas de emprendedores con rating
async function ejemploEstadisticasEmprendedores() {
    try {
        const estadisticas = await reportesService.obtenerEstadisticasPorEmprendedor();
        // Ordenar por rating
        const mejoresRatings = estadisticas
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 5);
        console.log('Top 5 emprendedores por rating:', mejoresRatings);
    }
    catch (error) {
        console.error('Error:', error);
    }
}
// ==================== INVENTARIO ====================
// EJEMPLO 9: Reporte de inventario con paginacion
async function ejemploReporteInventario() {
    try {
        const pagina = 1;
        const limite = 20;
        const resultado = await reportesService.obtenerReporteInventario(pagina, limite);
        console.log(`Pagina ${resultado.pagina} de ${resultado.totalPaginas}`);
        console.log(`Total productos: ${resultado.total}`);
        console.log('Productos:', resultado.datos);
    }
    catch (error) {
        console.error('Error:', error);
    }
}
// EJEMPLO 10: Resumen del estado del inventario
async function ejemploResumenInventario() {
    try {
        const resumen = await reportesService.obtenerResumenInventario();
        console.log('Resumen de inventario:', resumen);
        console.log(`Disponibles: ${resumen.porcentajeDisponible}%`);
        console.log(`Stock bajo: ${resumen.porcentajeStockBajo}%`);
        console.log(`Agotados: ${resumen.porcentajeAgotado}%`);
    }
    catch (error) {
        console.error('Error:', error);
    }
}
// EJEMPLO 11: Filtrar inventario por estado
async function ejemploInventarioPorEstado() {
    try {
        const productosAgotados = await reportesService.obtenerReporteInventario(1, 50, undefined, undefined, 'Agotado');
        console.log(`Productos agotados: ${productosAgotados.total}`);
    }
    catch (error) {
        console.error('Error:', error);
    }
}
// ==================== ORDENES ====================
// EJEMPLO 12: Reporte de ordenes con filtros
async function ejemploReporteOrdenes() {
    try {
        const ordenes = await reportesService.obtenerReporteOrdenes(1, 20, '2024-01-01', '2024-12-31', 'Completado');
        console.log('Ordenes completadas en 2024:', ordenes);
    }
    catch (error) {
        console.error('Error:', error);
    }
}
// ==================== USUARIOS ====================
// EJEMPLO 13: Estadisticas de usuario especifico
async function ejemploEstadisticasUsuario() {
    try {
        const idUsuario = 5;
        const estadisticas = await reportesService.obtenerEstadisticasUsuario(idUsuario);
        if (estadisticas) {
            console.log(`Cliente: ${estadisticas.nombreCompleto}`);
            console.log(`Total gastado: $${estadisticas.totalGastado}`);
            console.log(`Promedio por compra: $${estadisticas.promedioCompra}`);
            console.log(`Categoria favorita: ${estadisticas.categoriaFavorita}`);
        }
    }
    catch (error) {
        console.error('Error:', error);
    }
}
// EJEMPLO 14: Top compradores
async function ejemploTopCompradores() {
    try {
        const topCompradores = await reportesService.obtenerTopCompradores(10);
        console.log('Top 10 compradores:', topCompradores);
        // Calcular valor total de los top 10
        const valorTotal = topCompradores.reduce((sum, c) => sum + c.totalGastado, 0);
        console.log(`Valor total de top 10: $${valorTotal.toFixed(2)}`);
    }
    catch (error) {
        console.error('Error:', error);
    }
}
// ==================== INGRESOS Y TENDENCIAS ====================
// EJEMPLO 15: Reporte de ingresos mensuales
async function ejemploIngresosMensuales() {
    try {
        const ingresos = await reportesService.obtenerReporteIngresos('2024-01-01', '2024-12-31', 'mes');
        console.log('Ingresos mensuales 2024:', ingresos);
        // Calcular total del año
        const totalAnual = ingresos.reduce((sum, item) => sum + item.ingresosGenerados, 0);
        console.log(`Total ingresos 2024: $${totalAnual.toFixed(2)}`);
    }
    catch (error) {
        console.error('Error:', error);
    }
}
// EJEMPLO 16: Analisis de tendencias diarias
async function ejemploTendencias() {
    try {
        const tendencias = await reportesService.analizarTendencias('2024-10-01', '2024-10-31', 'dia');
        console.log('Tendencias diarias de octubre:', tendencias);
    }
    catch (error) {
        console.error('Error:', error);
    }
}
// EJEMPLO 17: Comparar dos periodos
async function ejemploCompararPeriodos() {
    try {
        const comparacion = await reportesService.compararPeriodos('2024-01-01', '2024-06-30', // Primer semestre
        '2024-07-01', '2024-12-31' // Segundo semestre
        );
        console.log('Comparacion S1 vs S2 2024:');
        console.log('Variacion en ordenes:', comparacion.variaciones.ordenesVariacion, '%');
        console.log('Variacion en ingresos:', comparacion.variaciones.ingresosVariacion, '%');
    }
    catch (error) {
        console.error('Error:', error);
    }
}
// EJEMPLO 18: Validacion de fechas invalidas
async function ejemploValidacionFechas() {
    try {
        // Esto lanzara un error porque la fecha de inicio es posterior a la de fin
        await reportesService.obtenerReporteIngresos('2024-12-31', '2024-01-01', 'mes');
    }
    catch (error) {
        console.error('Error esperado:', error); // "La fecha de inicio debe ser anterior..."
    }
}
// ==================== ANALISIS AVANZADOS ====================
// EJEMPLO 19: Analizar abandono de carrito
async function ejemploAbandonoCarrito() {
    try {
        const analisis = await reportesService.analizarAbandonoCarrito();
        console.log('Analisis de abandono:', analisis);
        console.log(`Tasa de abandono: ${analisis.tasaAbandonoEstimada}%`);
        console.log('Productos mas abandonados:', analisis.productosAbandonados.slice(0, 5));
    }
    catch (error) {
        console.error('Error:', error);
    }
}
// EJEMPLO 20: Proyectar ventas
async function ejemploProyeccionVentas() {
    try {
        const proyeccion = await reportesService.proyectarVentas(3);
        console.log('Proyeccion basada en 3 meses:', proyeccion);
        console.log(`Ordenes esperadas: ${proyeccion.proyeccionProximoMes.ordenes}`);
        console.log(`Ingresos esperados: $${proyeccion.proyeccionProximoMes.ingresos}`);
    }
    catch (error) {
        console.error('Error:', error);
    }
}
// ==================== EXPORTACION DE REPORTES ====================
// EJEMPLO 21: Exportar dashboard a JSON
async function ejemploExportarReporte() {
    try {
        const reporte = await reportesService.exportarReporteJSON('dashboard', {});
        console.log('Reporte exportado:', reporte);
        console.log(`Generado en: ${reporte.fechaGeneracion}`);
        // Guardar en archivo (ejemplo simplificado)
        // fs.writeFileSync('dashboard.json', JSON.stringify(reporte, null, 2));
    }
    catch (error) {
        console.error('Error:', error);
    }
}
// EJEMPLO 22: Exportar ingresos a JSON
async function ejemploExportarIngresos() {
    try {
        const reporte = await reportesService.exportarReporteJSON('ingresos', {
            fechaInicio: '2024-01-01',
            fechaFin: '2024-12-31',
            agrupacion: 'mes'
        });
        console.log('Reporte de ingresos exportado:', reporte);
    }
    catch (error) {
        console.error('Error:', error);
    }
}
// ==================== PIPELINE COMPLETO ====================
// EJEMPLO 23: Pipeline completo de analisis mensual
async function ejemploPipelineAnalisisMensual() {
    try {
        const fechaInicio = '2024-10-01';
        const fechaFin = '2024-10-31';
        // Ejecutar multiples analisis en paralelo
        const [metricas, topProductos, ingresos, tendencias, topCompradores, resumenInventario] = await Promise.all([
            reportesService.obtenerMetricasGenerales(),
            reportesService.obtenerProductosMasVendidos(5, fechaInicio, fechaFin),
            reportesService.obtenerReporteIngresos(fechaInicio, fechaFin, 'dia'),
            reportesService.analizarTendencias(fechaInicio, fechaFin, 'dia'),
            reportesService.obtenerTopCompradores(10, fechaInicio, fechaFin),
            reportesService.obtenerResumenInventario()
        ]);
        const reporteMensual = {
            periodo: 'Octubre 2024',
            metricas,
            topProductos,
            ingresosDiarios: ingresos,
            tendencias,
            topCompradores,
            inventario: resumenInventario,
            fechaGeneracion: new Date()
        };
        console.log('Reporte mensual completo:', reporteMensual);
        return reporteMensual;
    }
    catch (error) {
        console.error('Error en pipeline:', error);
    }
}

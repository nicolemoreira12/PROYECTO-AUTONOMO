"use strict";
// Service para reportes con logica de negocio y transformacion de datos
// Orquesta las consultas del repository y aplica reglas de negocio
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportesService = void 0;
const reportes_repository_1 = require("../repositories/reportes.repository");
const reportes_utils_1 = require("../utils/reportes.utils");
class ReportesService {
    constructor() {
        this.reportesRepository = new reportes_repository_1.ReportesRepository();
    }
    // ==================== METRICAS Y DASHBOARD ====================
    // Obtiene las metricas generales del sistema con formateo
    async obtenerMetricasGenerales() {
        const metricas = await this.reportesRepository.obtenerMetricasGenerales();
        // Redondea valores decimales para mejor presentacion
        return {
            ...metricas,
            totalIngresos: (0, reportes_utils_1.redondearDecimales)(metricas.totalIngresos),
            crecimientoMensual: (0, reportes_utils_1.redondearDecimales)(metricas.crecimientoMensual),
            ticketPromedio: (0, reportes_utils_1.redondearDecimales)(metricas.ticketPromedio),
        };
    }
    // Genera un dashboard completo con multiples metricas
    async generarDashboardPrincipal() {
        // Ejecuta multiples consultas en paralelo para optimizar rendimiento
        const [metricas, topVendidos, topRentables, categorias, emprendedores,] = await Promise.all([
            this.obtenerMetricasGenerales(),
            this.obtenerProductosMasVendidos(5),
            this.obtenerProductosMasRentables(5),
            this.obtenerEstadisticasPorCategoria(),
            this.obtenerEstadisticasPorEmprendedor(),
        ]);
        // Calcula metricas adicionales
        const estadoInventario = this.calcularEstadoInventario(metricas);
        const alertas = this.generarAlertas(metricas);
        return {
            metricas,
            topVendidos,
            topRentables,
            categorias: categorias.slice(0, 5), // Top 5 categorias
            emprendedores: emprendedores.slice(0, 5), // Top 5 emprendedores
            estadoInventario,
            alertas,
            fechaGeneracion: new Date(),
        };
    }
    // Calcula el estado general del inventario
    calcularEstadoInventario(metricas) {
        const totalProductos = metricas.totalProductos;
        const productosAgotados = metricas.productosAgotados;
        const porcentajeAgotado = totalProductos > 0
            ? (productosAgotados / totalProductos) * 100
            : 0;
        return {
            totalProductos,
            productosAgotados,
            porcentajeAgotado: (0, reportes_utils_1.redondearDecimales)(porcentajeAgotado),
            estado: porcentajeAgotado > 20 ? 'Critico' :
                porcentajeAgotado > 10 ? 'Alerta' : 'Normal',
        };
    }
    // Genera alertas basadas en metricas del sistema
    generarAlertas(metricas) {
        const alertas = [];
        if (metricas.productosAgotados > 10) {
            alertas.push(`Atencion: ${metricas.productosAgotados} productos sin stock`);
        }
        if (metricas.ordenesEnProceso > 50) {
            alertas.push(`${metricas.ordenesEnProceso} ordenes pendientes de procesar`);
        }
        if (metricas.crecimientoMensual < -10) {
            alertas.push(`Alerta: Decrecimiento de ventas del ${metricas.crecimientoMensual.toFixed(1)}%`);
        }
        if (metricas.crecimientoMensual > 20) {
            alertas.push(`Excelente: Crecimiento de ventas del ${metricas.crecimientoMensual.toFixed(1)}%`);
        }
        return alertas;
    }
    // ==================== PRODUCTOS ====================
    // Obtiene productos mas vendidos con validacion de parametros
    async obtenerProductosMasVendidos(limite = 10, fechaInicio, fechaFin) {
        // Valida limite
        if (limite < 1 || limite > 100) {
            throw new Error('El limite debe estar entre 1 y 100');
        }
        // Construye filtro de fecha si se proporciona
        const filtroFecha = this.construirFiltroFecha(fechaInicio, fechaFin);
        const productos = await this.reportesRepository.obtenerProductosMasVendidos(limite, filtroFecha);
        // Formatea valores para mejor presentacion
        return productos.map(producto => ({
            ...producto,
            ingresosGenerados: (0, reportes_utils_1.redondearDecimales)(producto.ingresosGenerados || 0),
        }));
    }
    // Obtiene productos mas rentables
    async obtenerProductosMasRentables(limite = 10, fechaInicio, fechaFin) {
        if (limite < 1 || limite > 100) {
            throw new Error('El limite debe estar entre 1 y 100');
        }
        const filtroFecha = this.construirFiltroFecha(fechaInicio, fechaFin);
        const productos = await this.reportesRepository.obtenerProductosMasRentables(limite, filtroFecha);
        return productos.map(producto => ({
            ...producto,
            ingresosGenerados: (0, reportes_utils_1.redondearDecimales)(producto.ingresosGenerados || 0),
        }));
    }
    // Obtiene estadisticas detalladas de un producto
    async obtenerEstadisticasProducto(idProducto, fechaInicio, fechaFin) {
        if (idProducto < 1) {
            throw new Error('ID de producto invalido');
        }
        const filtroFecha = this.construirFiltroFecha(fechaInicio, fechaFin);
        const estadisticas = await this.reportesRepository.obtenerEstadisticasProducto(idProducto, filtroFecha);
        if (!estadisticas) {
            return null;
        }
        // Formatea valores numericos
        return {
            ...estadisticas,
            ingresosGenerados: (0, reportes_utils_1.redondearDecimales)(estadisticas.ingresosGenerados),
        };
    }
    // ==================== CATEGORIAS Y EMPRENDEDORES ====================
    // Obtiene estadisticas por categoria con metricas adicionales
    async obtenerEstadisticasPorCategoria(fechaInicio, fechaFin) {
        const filtroFecha = this.construirFiltroFecha(fechaInicio, fechaFin);
        const estadisticas = await this.reportesRepository.obtenerEstadisticasPorCategoria(filtroFecha);
        // Calcula metricas adicionales como ticket promedio por categoria
        return estadisticas.map(categoria => ({
            ...categoria,
            ingresosGenerados: (0, reportes_utils_1.redondearDecimales)(categoria.ingresosGenerados),
            ticketPromedio: categoria.totalVentas > 0
                ? (0, reportes_utils_1.redondearDecimales)(categoria.ingresosGenerados / categoria.totalVentas)
                : 0,
        }));
    }
    // Obtiene estadisticas por emprendedor
    async obtenerEstadisticasPorEmprendedor(fechaInicio, fechaFin) {
        const filtroFecha = this.construirFiltroFecha(fechaInicio, fechaFin);
        const estadisticas = await this.reportesRepository.obtenerEstadisticasPorEmprendedor(filtroFecha);
        return estadisticas.map(emprendedor => ({
            ...emprendedor,
            ingresosGenerados: (0, reportes_utils_1.redondearDecimales)(emprendedor.ingresosGenerados),
            rating: (0, reportes_utils_1.redondearDecimales)(emprendedor.rating, 1),
        }));
    }
    // ==================== INVENTARIO ====================
    // Obtiene reporte de inventario con paginacion
    async obtenerReporteInventario(pagina = 1, limite = 20, idCategoria, idEmprendedor, estado) {
        // Valida parametros de paginacion
        if (pagina < 1)
            pagina = 1;
        if (limite < 1 || limite > 100)
            limite = 20;
        const paginacion = { pagina, limite };
        const resultado = await this.reportesRepository.obtenerReporteInventario(paginacion, idCategoria, idEmprendedor, estado);
        // Formatea valores
        const datosFormateados = resultado.datos.map(item => ({
            ...item,
            precio: (0, reportes_utils_1.redondearDecimales)(item.precio),
            valorInventario: (0, reportes_utils_1.redondearDecimales)(item.valorInventario),
        }));
        return (0, reportes_utils_1.construirRespuestaPaginada)(datosFormateados, resultado.total, paginacion);
    }
    // Obtiene resumen del estado del inventario
    async obtenerResumenInventario() {
        const paginacion = { pagina: 1, limite: 1000 };
        // Obtiene todos los productos (o un limite razonable)
        const [disponibles, stockBajo, agotados] = await Promise.all([
            this.reportesRepository.obtenerReporteInventario(paginacion, undefined, undefined, 'Disponible'),
            this.reportesRepository.obtenerReporteInventario(paginacion, undefined, undefined, 'Stock Bajo'),
            this.reportesRepository.obtenerReporteInventario(paginacion, undefined, undefined, 'Agotado'),
        ]);
        const totalProductos = disponibles.total + stockBajo.total + agotados.total;
        return {
            totalProductos,
            disponibles: disponibles.total,
            stockBajo: stockBajo.total,
            agotados: agotados.total,
            porcentajeDisponible: totalProductos > 0 ? (0, reportes_utils_1.redondearDecimales)((disponibles.total / totalProductos) * 100) : 0,
            porcentajeStockBajo: totalProductos > 0 ? (0, reportes_utils_1.redondearDecimales)((stockBajo.total / totalProductos) * 100) : 0,
            porcentajeAgotado: totalProductos > 0 ? (0, reportes_utils_1.redondearDecimales)((agotados.total / totalProductos) * 100) : 0,
        };
    }
    // ==================== ORDENES ====================
    // Obtiene reporte de ordenes con paginacion y filtros
    async obtenerReporteOrdenes(pagina = 1, limite = 20, fechaInicio, fechaFin, estado, idUsuario) {
        if (pagina < 1)
            pagina = 1;
        if (limite < 1 || limite > 100)
            limite = 20;
        const paginacion = { pagina, limite };
        const filtroFecha = this.construirFiltroFecha(fechaInicio, fechaFin);
        const resultado = await this.reportesRepository.obtenerReporteOrdenes(paginacion, filtroFecha, estado, idUsuario);
        // Formatea valores
        const datosFormateados = resultado.datos.map(orden => ({
            ...orden,
            subtotal: (0, reportes_utils_1.redondearDecimales)(orden.subtotal),
            total: (0, reportes_utils_1.redondearDecimales)(orden.total),
        }));
        return (0, reportes_utils_1.construirRespuestaPaginada)(datosFormateados, resultado.total, paginacion);
    }
    // ==================== USUARIOS ====================
    // Obtiene estadisticas de un usuario especifico
    async obtenerEstadisticasUsuario(idUsuario, fechaInicio, fechaFin) {
        if (idUsuario < 1) {
            throw new Error('ID de usuario invalido');
        }
        const filtroFecha = this.construirFiltroFecha(fechaInicio, fechaFin);
        const estadisticas = await this.reportesRepository.obtenerEstadisticasUsuario(idUsuario, filtroFecha);
        if (!estadisticas) {
            return null;
        }
        return {
            ...estadisticas,
            totalGastado: (0, reportes_utils_1.redondearDecimales)(estadisticas.totalGastado),
            promedioCompra: (0, reportes_utils_1.redondearDecimales)(estadisticas.promedioCompra),
        };
    }
    // Obtiene top compradores
    async obtenerTopCompradores(limite = 10, fechaInicio, fechaFin) {
        if (limite < 1 || limite > 100) {
            throw new Error('El limite debe estar entre 1 y 100');
        }
        const filtroFecha = this.construirFiltroFecha(fechaInicio, fechaFin);
        const topCompradores = await this.reportesRepository.obtenerTopCompradores(limite, filtroFecha);
        return topCompradores.map(comprador => ({
            ...comprador,
            totalGastado: (0, reportes_utils_1.redondearDecimales)(comprador.totalGastado),
            promedioCompra: (0, reportes_utils_1.redondearDecimales)(comprador.promedioCompra),
        }));
    }
    // ==================== INGRESOS Y TENDENCIAS ====================
    // Obtiene reporte de ingresos por periodo
    async obtenerReporteIngresos(fechaInicio, fechaFin, agrupacion = 'mes') {
        const filtroFecha = this.construirFiltroFecha(fechaInicio, fechaFin);
        if (!filtroFecha) {
            throw new Error('Las fechas de inicio y fin son requeridas');
        }
        // Valida agrupacion
        const agrupacionesValidas = ['dia', 'semana', 'mes', 'anio'];
        if (!agrupacionesValidas.includes(agrupacion)) {
            throw new Error('Agrupacion invalida. Use: dia, semana, mes o anio');
        }
        const ingresos = await this.reportesRepository.obtenerReporteIngresos(filtroFecha, agrupacion);
        return ingresos.map(item => ({
            ...item,
            ingresosGenerados: (0, reportes_utils_1.redondearDecimales)(item.ingresosGenerados),
            promedioOrden: (0, reportes_utils_1.redondearDecimales)(item.promedioOrden),
        }));
    }
    // Analiza tendencias de ventas
    async analizarTendencias(fechaInicio, fechaFin, periodo = 'dia', idCategoria) {
        const filtroFecha = this.construirFiltroFecha(fechaInicio, fechaFin);
        if (!filtroFecha) {
            throw new Error('Las fechas de inicio y fin son requeridas');
        }
        const tendencias = await this.reportesRepository.analizarTendencias(filtroFecha, periodo, idCategoria);
        return tendencias.map(item => ({
            ...item,
            totalVentas: (0, reportes_utils_1.redondearDecimales)(item.totalVentas),
            promedioOrden: (0, reportes_utils_1.redondearDecimales)(item.promedioOrden),
        }));
    }
    // Compara dos periodos de tiempo
    async compararPeriodos(fechaInicio1, fechaFin1, fechaInicio2, fechaFin2) {
        const periodo1 = this.construirFiltroFecha(fechaInicio1, fechaFin1);
        const periodo2 = this.construirFiltroFecha(fechaInicio2, fechaFin2);
        if (!periodo1 || !periodo2) {
            throw new Error('Todas las fechas son requeridas para la comparacion');
        }
        const comparacion = await this.reportesRepository.compararPeriodos(periodo1, periodo2);
        // Formatea todos los valores numericos
        return {
            periodo1: {
                ...comparacion.periodo1,
                totalIngresos: (0, reportes_utils_1.redondearDecimales)(comparacion.periodo1.totalIngresos),
                ticketPromedio: (0, reportes_utils_1.redondearDecimales)(comparacion.periodo1.ticketPromedio),
            },
            periodo2: {
                ...comparacion.periodo2,
                totalIngresos: (0, reportes_utils_1.redondearDecimales)(comparacion.periodo2.totalIngresos),
                ticketPromedio: (0, reportes_utils_1.redondearDecimales)(comparacion.periodo2.ticketPromedio),
            },
            variaciones: {
                ordenesVariacion: (0, reportes_utils_1.redondearDecimales)(comparacion.variaciones.ordenesVariacion),
                ingresosVariacion: (0, reportes_utils_1.redondearDecimales)(comparacion.variaciones.ingresosVariacion),
                ticketVariacion: (0, reportes_utils_1.redondearDecimales)(comparacion.variaciones.ticketVariacion),
            },
        };
    }
    // ==================== ANALISIS AVANZADOS ====================
    // Analiza abandono de carrito
    async analizarAbandonoCarrito() {
        const analisis = await this.reportesRepository.analizarAbandonoCarrito();
        return {
            ...analisis,
            tasaAbandonoEstimada: (0, reportes_utils_1.redondearDecimales)(analisis.tasaAbandonoEstimada),
        };
    }
    // Analiza precios por categoria
    async analizarPreciosPorCategoria() {
        const analisis = await this.reportesRepository.analizarPreciosPorCategoria();
        return analisis.map(item => ({
            ...item,
            precioPromedio: (0, reportes_utils_1.redondearDecimales)(item.precioPromedio),
            precioMinimo: (0, reportes_utils_1.redondearDecimales)(item.precioMinimo),
            precioMaximo: (0, reportes_utils_1.redondearDecimales)(item.precioMaximo),
        }));
    }
    // Proyecta ventas futuras
    async proyectarVentas(mesesHistoricos = 3) {
        if (mesesHistoricos < 1 || mesesHistoricos > 12) {
            throw new Error('Los meses historicos deben estar entre 1 y 12');
        }
        const proyeccion = await this.reportesRepository.proyectarVentas(mesesHistoricos);
        return {
            ...proyeccion,
            promedioIngresosMessuales: (0, reportes_utils_1.redondearDecimales)(proyeccion.promedioIngresosMessuales),
            proyeccionProximoMes: {
                ordenes: proyeccion.proyeccionProximoMes.ordenes,
                ingresos: (0, reportes_utils_1.redondearDecimales)(proyeccion.proyeccionProximoMes.ingresos),
            },
            datosHistoricos: proyeccion.datosHistoricos.map((item) => ({
                ...item,
                ingresos: (0, reportes_utils_1.redondearDecimales)(item.ingresos),
            })),
        };
    }
    // ==================== METODOS AUXILIARES ====================
    // Construye un filtro de fecha validando las fechas proporcionadas
    construirFiltroFecha(fechaInicio, fechaFin) {
        if (!fechaInicio || !fechaFin) {
            return undefined;
        }
        const inicio = (0, reportes_utils_1.parsearFecha)(fechaInicio);
        const fin = (0, reportes_utils_1.parsearFecha)(fechaFin);
        if (!inicio || !fin) {
            throw new Error('Formato de fecha invalido. Use formato ISO (YYYY-MM-DD)');
        }
        if (!(0, reportes_utils_1.validarRangoFechas)(inicio, fin)) {
            throw new Error('La fecha de inicio debe ser anterior a la fecha fin');
        }
        return { fechaInicio: inicio, fechaFin: fin };
    }
    // Exporta un reporte a formato JSON estructurado
    async exportarReporteJSON(tipoReporte, parametros) {
        let datos;
        let nombreReporte;
        // Selecciona el reporte a exportar
        switch (tipoReporte) {
            case 'dashboard':
                datos = await this.generarDashboardPrincipal();
                nombreReporte = 'Dashboard Principal';
                break;
            case 'productos-vendidos':
                datos = await this.obtenerProductosMasVendidos(parametros.limite);
                nombreReporte = 'Productos Mas Vendidos';
                break;
            case 'inventario':
                datos = await this.obtenerReporteInventario(parametros.pagina, parametros.limite);
                nombreReporte = 'Reporte de Inventario';
                break;
            case 'ingresos':
                datos = await this.obtenerReporteIngresos(parametros.fechaInicio, parametros.fechaFin, parametros.agrupacion);
                nombreReporte = 'Reporte de Ingresos';
                break;
            default:
                throw new Error('Tipo de reporte no soportado');
        }
        return {
            nombreReporte,
            fechaGeneracion: new Date(),
            parametros,
            datos,
        };
    }
}
exports.ReportesService = ReportesService;

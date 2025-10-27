"use strict";
// Controller para endpoints REST de reportes y consultas complejas
// Maneja las peticiones HTTP y delega la logica al service
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportarReporte = exports.getProyeccionVentas = exports.getAnalisisPreciosCategorias = exports.getAnalisisAbandonoCarrito = exports.compararPeriodos = exports.getTendencias = exports.getReporteIngresos = exports.getTopCompradores = exports.getEstadisticasUsuario = exports.getReporteOrdenes = exports.getResumenInventario = exports.getReporteInventario = exports.getEstadisticasEmprendedores = exports.getEstadisticasCategorias = exports.getEstadisticasProducto = exports.getProductosMasRentables = exports.getProductosMasVendidos = exports.getDashboard = exports.getMetricasGenerales = void 0;
const reportes_service_1 = require("../services/reportes.service");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const reportes_dto_1 = require("../dtos/reportes.dto");
const reportesService = new reportes_service_1.ReportesService();
// ==================== DASHBOARD Y METRICAS ====================
// GET /api/reportes/metricas
// Obtiene las metricas generales del sistema
const getMetricasGenerales = async (_req, res) => {
    try {
        const metricas = await reportesService.obtenerMetricasGenerales();
        res.json({
            success: true,
            data: metricas,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener metricas generales',
            error: error.message,
        });
    }
};
exports.getMetricasGenerales = getMetricasGenerales;
// GET /api/reportes/dashboard
// Genera un dashboard completo con multiples metricas
const getDashboard = async (_req, res) => {
    try {
        const dashboard = await reportesService.generarDashboardPrincipal();
        res.json({
            success: true,
            data: dashboard,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al generar dashboard',
            error: error.message,
        });
    }
};
exports.getDashboard = getDashboard;
// ==================== PRODUCTOS ====================
// GET /api/reportes/productos/mas-vendidos
// Obtiene los productos mas vendidos
const getProductosMasVendidos = async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToClass)(reportes_dto_1.TopProductosDto, req.query);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Error de validacion',
                errors: errors.map(e => Object.values(e.constraints || {})).flat(),
            });
        }
        const limite = dto.limite || 10;
        const productos = await reportesService.obtenerProductosMasVendidos(limite, dto.fechaInicio, dto.fechaFin);
        res.json({
            success: true,
            data: productos,
            total: productos.length,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener productos mas vendidos',
            error: error.message,
        });
    }
};
exports.getProductosMasVendidos = getProductosMasVendidos;
// GET /api/reportes/productos/mas-rentables
// Obtiene los productos mas rentables
const getProductosMasRentables = async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToClass)(reportes_dto_1.TopProductosDto, req.query);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Error de validacion',
                errors: errors.map(e => Object.values(e.constraints || {})).flat(),
            });
        }
        const limite = dto.limite || 10;
        const productos = await reportesService.obtenerProductosMasRentables(limite, dto.fechaInicio, dto.fechaFin);
        res.json({
            success: true,
            data: productos,
            total: productos.length,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener productos mas rentables',
            error: error.message,
        });
    }
};
exports.getProductosMasRentables = getProductosMasRentables;
// GET /api/reportes/productos/:id/estadisticas
// Obtiene estadisticas de un producto especifico
const getEstadisticasProducto = async (req, res) => {
    try {
        const idProducto = parseInt(req.params.id);
        if (isNaN(idProducto) || idProducto < 1) {
            return res.status(400).json({
                success: false,
                message: 'ID de producto invalido',
            });
        }
        const { fechaInicio, fechaFin } = req.query;
        const estadisticas = await reportesService.obtenerEstadisticasProducto(idProducto, fechaInicio, fechaFin);
        if (!estadisticas) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado o sin estadisticas',
            });
        }
        res.json({
            success: true,
            data: estadisticas,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadisticas del producto',
            error: error.message,
        });
    }
};
exports.getEstadisticasProducto = getEstadisticasProducto;
// ==================== CATEGORIAS Y EMPRENDEDORES ====================
// GET /api/reportes/categorias/estadisticas
// Obtiene estadisticas por categoria
const getEstadisticasCategorias = async (req, res) => {
    try {
        const { fechaInicio, fechaFin } = req.query;
        const estadisticas = await reportesService.obtenerEstadisticasPorCategoria(fechaInicio, fechaFin);
        res.json({
            success: true,
            data: estadisticas,
            total: estadisticas.length,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadisticas de categorias',
            error: error.message,
        });
    }
};
exports.getEstadisticasCategorias = getEstadisticasCategorias;
// GET /api/reportes/emprendedores/estadisticas
// Obtiene estadisticas por emprendedor
const getEstadisticasEmprendedores = async (req, res) => {
    try {
        const { fechaInicio, fechaFin } = req.query;
        const estadisticas = await reportesService.obtenerEstadisticasPorEmprendedor(fechaInicio, fechaFin);
        res.json({
            success: true,
            data: estadisticas,
            total: estadisticas.length,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadisticas de emprendedores',
            error: error.message,
        });
    }
};
exports.getEstadisticasEmprendedores = getEstadisticasEmprendedores;
// ==================== INVENTARIO ====================
// GET /api/reportes/inventario
// Obtiene reporte de inventario con paginacion
const getReporteInventario = async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToClass)(reportes_dto_1.ReporteInventarioDto, req.query);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Error de validacion',
                errors: errors.map(e => Object.values(e.constraints || {})).flat(),
            });
        }
        const pagina = dto.pagina || 1;
        const limite = dto.limite || 20;
        const resultado = await reportesService.obtenerReporteInventario(pagina, limite, dto.idCategoria, dto.idEmprendedor, dto.estado);
        res.json({
            success: true,
            ...resultado,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener reporte de inventario',
            error: error.message,
        });
    }
};
exports.getReporteInventario = getReporteInventario;
// GET /api/reportes/inventario/resumen
// Obtiene resumen ejecutivo del inventario
const getResumenInventario = async (_req, res) => {
    try {
        const resumen = await reportesService.obtenerResumenInventario();
        res.json({
            success: true,
            data: resumen,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener resumen de inventario',
            error: error.message,
        });
    }
};
exports.getResumenInventario = getResumenInventario;
// ==================== ORDENES ====================
// GET /api/reportes/ordenes
// Obtiene reporte de ordenes con filtros
const getReporteOrdenes = async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToClass)(reportes_dto_1.ReporteOrdenesDto, req.query);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Error de validacion',
                errors: errors.map(e => Object.values(e.constraints || {})).flat(),
            });
        }
        const pagina = dto.pagina || 1;
        const limite = dto.limite || 20;
        const resultado = await reportesService.obtenerReporteOrdenes(pagina, limite, dto.fechaInicio, dto.fechaFin, dto.estado, dto.idUsuario);
        res.json({
            success: true,
            ...resultado,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener reporte de ordenes',
            error: error.message,
        });
    }
};
exports.getReporteOrdenes = getReporteOrdenes;
// ==================== USUARIOS ====================
// GET /api/reportes/usuarios/:id/estadisticas
// Obtiene estadisticas de un usuario especifico
const getEstadisticasUsuario = async (req, res) => {
    try {
        const idUsuario = parseInt(req.params.id);
        if (isNaN(idUsuario) || idUsuario < 1) {
            return res.status(400).json({
                success: false,
                message: 'ID de usuario invalido',
            });
        }
        const { fechaInicio, fechaFin } = req.query;
        const estadisticas = await reportesService.obtenerEstadisticasUsuario(idUsuario, fechaInicio, fechaFin);
        if (!estadisticas) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado o sin estadisticas',
            });
        }
        res.json({
            success: true,
            data: estadisticas,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadisticas del usuario',
            error: error.message,
        });
    }
};
exports.getEstadisticasUsuario = getEstadisticasUsuario;
// GET /api/reportes/usuarios/top-compradores
// Obtiene el ranking de mejores compradores
const getTopCompradores = async (req, res) => {
    try {
        const limite = parseInt(req.query.limite) || 10;
        const { fechaInicio, fechaFin } = req.query;
        if (limite < 1 || limite > 100) {
            return res.status(400).json({
                success: false,
                message: 'El limite debe estar entre 1 y 100',
            });
        }
        const topCompradores = await reportesService.obtenerTopCompradores(limite, fechaInicio, fechaFin);
        res.json({
            success: true,
            data: topCompradores,
            total: topCompradores.length,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener top compradores',
            error: error.message,
        });
    }
};
exports.getTopCompradores = getTopCompradores;
// ==================== INGRESOS Y TENDENCIAS ====================
// GET /api/reportes/ingresos
// Obtiene reporte de ingresos por periodo
const getReporteIngresos = async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToClass)(reportes_dto_1.ReporteIngresosDto, req.query);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Error de validacion',
                errors: errors.map(e => Object.values(e.constraints || {})).flat(),
            });
        }
        const agrupacion = dto.agrupacion || 'mes';
        const ingresos = await reportesService.obtenerReporteIngresos(dto.fechaInicio, dto.fechaFin, agrupacion);
        res.json({
            success: true,
            data: ingresos,
            total: ingresos.length,
            agrupacion,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener reporte de ingresos',
            error: error.message,
        });
    }
};
exports.getReporteIngresos = getReporteIngresos;
// GET /api/reportes/tendencias
// Analiza tendencias de ventas
const getTendencias = async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToClass)(reportes_dto_1.TendenciasDto, req.query);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Error de validacion',
                errors: errors.map(e => Object.values(e.constraints || {})).flat(),
            });
        }
        const periodo = dto.periodo || 'dia';
        const tendencias = await reportesService.analizarTendencias(dto.fechaInicio, dto.fechaFin, periodo, dto.idCategoria);
        res.json({
            success: true,
            data: tendencias,
            total: tendencias.length,
            periodo,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al analizar tendencias',
            error: error.message,
        });
    }
};
exports.getTendencias = getTendencias;
// POST /api/reportes/comparar-periodos
// Compara metricas entre dos periodos
const compararPeriodos = async (req, res) => {
    try {
        const { fechaInicio1, fechaFin1, fechaInicio2, fechaFin2 } = req.body;
        // Validacion basica
        if (!fechaInicio1 || !fechaFin1 || !fechaInicio2 || !fechaFin2) {
            return res.status(400).json({
                success: false,
                message: 'Todas las fechas son requeridas',
            });
        }
        const comparacion = await reportesService.compararPeriodos(fechaInicio1, fechaFin1, fechaInicio2, fechaFin2);
        res.json({
            success: true,
            data: comparacion,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al comparar periodos',
            error: error.message,
        });
    }
};
exports.compararPeriodos = compararPeriodos;
// ==================== ANALISIS AVANZADOS ====================
// GET /api/reportes/abandono-carrito
// Analiza el abandono del carrito de compras
const getAnalisisAbandonoCarrito = async (_req, res) => {
    try {
        const analisis = await reportesService.analizarAbandonoCarrito();
        res.json({
            success: true,
            data: analisis,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al analizar abandono de carrito',
            error: error.message,
        });
    }
};
exports.getAnalisisAbandonoCarrito = getAnalisisAbandonoCarrito;
// GET /api/reportes/precios-categoria
// Analiza precios promedio por categoria
const getAnalisisPreciosCategorias = async (_req, res) => {
    try {
        const analisis = await reportesService.analizarPreciosPorCategoria();
        res.json({
            success: true,
            data: analisis,
            total: analisis.length,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al analizar precios por categoria',
            error: error.message,
        });
    }
};
exports.getAnalisisPreciosCategorias = getAnalisisPreciosCategorias;
// GET /api/reportes/proyeccion-ventas
// Proyecta ventas futuras basado en historico
const getProyeccionVentas = async (req, res) => {
    try {
        const mesesHistoricos = parseInt(req.query.meses) || 3;
        if (mesesHistoricos < 1 || mesesHistoricos > 12) {
            return res.status(400).json({
                success: false,
                message: 'Los meses historicos deben estar entre 1 y 12',
            });
        }
        const proyeccion = await reportesService.proyectarVentas(mesesHistoricos);
        res.json({
            success: true,
            data: proyeccion,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al proyectar ventas',
            error: error.message,
        });
    }
};
exports.getProyeccionVentas = getProyeccionVentas;
// ==================== EXPORTACION ====================
// POST /api/reportes/exportar
// Exporta un reporte a formato JSON estructurado
const exportarReporte = async (req, res) => {
    try {
        const { tipoReporte, parametros } = req.body;
        if (!tipoReporte) {
            return res.status(400).json({
                success: false,
                message: 'El tipo de reporte es requerido',
            });
        }
        const reporte = await reportesService.exportarReporteJSON(tipoReporte, parametros || {});
        res.json({
            success: true,
            data: reporte,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al exportar reporte',
            error: error.message,
        });
    }
};
exports.exportarReporte = exportarReporte;

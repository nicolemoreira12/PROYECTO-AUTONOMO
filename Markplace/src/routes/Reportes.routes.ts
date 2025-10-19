// Rutas para los endpoints de reportes y consultas complejas
// Define todas las rutas REST disponibles para el modulo de reportes

import { Router } from 'express';
import {
  getMetricasGenerales,
  getDashboard,
  getProductosMasVendidos,
  getProductosMasRentables,
  getEstadisticasProducto,
  getEstadisticasCategorias,
  getEstadisticasEmprendedores,
  getReporteInventario,
  getResumenInventario,
  getReporteOrdenes,
  getEstadisticasUsuario,
  getTopCompradores,
  getReporteIngresos,
  getTendencias,
  compararPeriodos,
  getAnalisisAbandonoCarrito,
  getAnalisisPreciosCategorias,
  getProyeccionVentas,
  exportarReporte,
} from '../controllers/reportes.controller';

const router = Router();

// ==================== DASHBOARD Y METRICAS ====================

// GET /api/reportes/metricas - Obtiene metricas generales del sistema
router.get('/metricas', getMetricasGenerales);

// GET /api/reportes/dashboard - Genera dashboard completo
router.get('/dashboard', getDashboard);

// ==================== PRODUCTOS ====================

// GET /api/reportes/productos/mas-vendidos - Top productos por cantidad vendida
// Query params: limite (opcional), fechaInicio (opcional), fechaFin (opcional), criterio (opcional)
router.get('/productos/mas-vendidos', getProductosMasVendidos);

// GET /api/reportes/productos/mas-rentables - Top productos por ingresos
// Query params: limite (opcional), fechaInicio (opcional), fechaFin (opcional)
router.get('/productos/mas-rentables', getProductosMasRentables);

// GET /api/reportes/productos/:id/estadisticas - Estadisticas de producto especifico
// Path params: id (requerido)
// Query params: fechaInicio (opcional), fechaFin (opcional)
router.get('/productos/:id/estadisticas', getEstadisticasProducto);

// ==================== CATEGORIAS Y EMPRENDEDORES ====================

// GET /api/reportes/categorias/estadisticas - Estadisticas por categoria
// Query params: fechaInicio (opcional), fechaFin (opcional)
router.get('/categorias/estadisticas', getEstadisticasCategorias);

// GET /api/reportes/emprendedores/estadisticas - Estadisticas por emprendedor
// Query params: fechaInicio (opcional), fechaFin (opcional)
router.get('/emprendedores/estadisticas', getEstadisticasEmprendedores);

// ==================== INVENTARIO ====================

// GET /api/reportes/inventario - Reporte completo de inventario con paginacion
// Query params: pagina (opcional), limite (opcional), idCategoria (opcional), 
//               idEmprendedor (opcional), estado (opcional), stockMinimo (opcional)
router.get('/inventario', getReporteInventario);

// GET /api/reportes/inventario/resumen - Resumen ejecutivo del inventario
router.get('/inventario/resumen', getResumenInventario);

// ==================== ORDENES ====================

// GET /api/reportes/ordenes - Reporte de ordenes con filtros
// Query params: pagina (opcional), limite (opcional), fechaInicio (opcional),
//               fechaFin (opcional), estado (opcional), idUsuario (opcional)
router.get('/ordenes', getReporteOrdenes);

// ==================== USUARIOS ====================

// GET /api/reportes/usuarios/:id/estadisticas - Estadisticas de usuario especifico
// Path params: id (requerido)
// Query params: fechaInicio (opcional), fechaFin (opcional)
router.get('/usuarios/:id/estadisticas', getEstadisticasUsuario);

// GET /api/reportes/usuarios/top-compradores - Ranking de mejores compradores
// Query params: limite (opcional), fechaInicio (opcional), fechaFin (opcional)
router.get('/usuarios/top-compradores', getTopCompradores);

// ==================== INGRESOS Y TENDENCIAS ====================

// GET /api/reportes/ingresos - Reporte de ingresos por periodo
// Query params: fechaInicio (requerido), fechaFin (requerido), agrupacion (opcional: dia/semana/mes/anio)
router.get('/ingresos', getReporteIngresos);

// GET /api/reportes/tendencias - Analisis de tendencias de ventas
// Query params: fechaInicio (requerido), fechaFin (requerido), periodo (opcional: dia/semana/mes),
//               idCategoria (opcional)
router.get('/tendencias', getTendencias);

// POST /api/reportes/comparar-periodos - Compara dos periodos de tiempo
// Body: { fechaInicio1, fechaFin1, fechaInicio2, fechaFin2 }
router.post('/comparar-periodos', compararPeriodos);

// ==================== ANALISIS AVANZADOS ====================

// GET /api/reportes/abandono-carrito - Analisis de abandono de carrito
router.get('/abandono-carrito', getAnalisisAbandonoCarrito);

// GET /api/reportes/precios-categoria - Analisis de precios por categoria
router.get('/precios-categoria', getAnalisisPreciosCategorias);

// GET /api/reportes/proyeccion-ventas - Proyeccion de ventas futuras
// Query params: meses (opcional, default: 3, rango: 1-12)
router.get('/proyeccion-ventas', getProyeccionVentas);

// ==================== EXPORTACION ====================

// POST /api/reportes/exportar - Exporta un reporte a JSON estructurado
// Body: { tipoReporte: string, parametros: object }
// Tipos soportados: 'dashboard', 'productos-vendidos', 'inventario', 'ingresos'
router.post('/exportar', exportarReporte);

export default router;

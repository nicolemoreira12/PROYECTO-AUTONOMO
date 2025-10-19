// Controller para endpoints REST de reportes y consultas complejas
// Maneja las peticiones HTTP y delega la logica al service

import { Request, Response } from 'express';
import { ReportesService } from '../services/reportes.service';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import {
  ConsultaReporteDto,
  TopProductosDto,
  ReporteInventarioDto,
  ReporteOrdenesDto,
  ReporteIngresosDto,
  TendenciasDto,
  EstadisticaUsuarioDto,
} from '../dtos/reportes.dto';

const reportesService = new ReportesService();

// ==================== DASHBOARD Y METRICAS ====================

// GET /api/reportes/metricas
// Obtiene las metricas generales del sistema
export const getMetricasGenerales = async (_req: Request, res: Response) => {
  try {
    const metricas = await reportesService.obtenerMetricasGenerales();
    res.json({
      success: true,
      data: metricas,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener metricas generales',
      error: error.message,
    });
  }
};

// GET /api/reportes/dashboard
// Genera un dashboard completo con multiples metricas
export const getDashboard = async (_req: Request, res: Response) => {
  try {
    const dashboard = await reportesService.generarDashboardPrincipal();
    res.json({
      success: true,
      data: dashboard,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al generar dashboard',
      error: error.message,
    });
  }
};

// ==================== PRODUCTOS ====================

// GET /api/reportes/productos/mas-vendidos
// Obtiene los productos mas vendidos
export const getProductosMasVendidos = async (req: Request, res: Response) => {
  try {
    const dto = plainToClass(TopProductosDto, req.query);
    const errors = await validate(dto);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Error de validacion',
        errors: errors.map(e => Object.values(e.constraints || {})).flat(),
      });
    }

    const limite = dto.limite || 10;
    const productos = await reportesService.obtenerProductosMasVendidos(
      limite,
      dto.fechaInicio,
      dto.fechaFin
    );

    res.json({
      success: true,
      data: productos,
      total: productos.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos mas vendidos',
      error: error.message,
    });
  }
};

// GET /api/reportes/productos/mas-rentables
// Obtiene los productos mas rentables
export const getProductosMasRentables = async (req: Request, res: Response) => {
  try {
    const dto = plainToClass(TopProductosDto, req.query);
    const errors = await validate(dto);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Error de validacion',
        errors: errors.map(e => Object.values(e.constraints || {})).flat(),
      });
    }

    const limite = dto.limite || 10;
    const productos = await reportesService.obtenerProductosMasRentables(
      limite,
      dto.fechaInicio,
      dto.fechaFin
    );

    res.json({
      success: true,
      data: productos,
      total: productos.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos mas rentables',
      error: error.message,
    });
  }
};

// GET /api/reportes/productos/:id/estadisticas
// Obtiene estadisticas de un producto especifico
export const getEstadisticasProducto = async (req: Request, res: Response) => {
  try {
    const idProducto = parseInt(req.params.id);

    if (isNaN(idProducto) || idProducto < 1) {
      return res.status(400).json({
        success: false,
        message: 'ID de producto invalido',
      });
    }

    const { fechaInicio, fechaFin } = req.query;

    const estadisticas = await reportesService.obtenerEstadisticasProducto(
      idProducto,
      fechaInicio as string,
      fechaFin as string
    );

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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadisticas del producto',
      error: error.message,
    });
  }
};

// ==================== CATEGORIAS Y EMPRENDEDORES ====================

// GET /api/reportes/categorias/estadisticas
// Obtiene estadisticas por categoria
export const getEstadisticasCategorias = async (req: Request, res: Response) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    const estadisticas = await reportesService.obtenerEstadisticasPorCategoria(
      fechaInicio as string,
      fechaFin as string
    );

    res.json({
      success: true,
      data: estadisticas,
      total: estadisticas.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadisticas de categorias',
      error: error.message,
    });
  }
};

// GET /api/reportes/emprendedores/estadisticas
// Obtiene estadisticas por emprendedor
export const getEstadisticasEmprendedores = async (req: Request, res: Response) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    const estadisticas = await reportesService.obtenerEstadisticasPorEmprendedor(
      fechaInicio as string,
      fechaFin as string
    );

    res.json({
      success: true,
      data: estadisticas,
      total: estadisticas.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadisticas de emprendedores',
      error: error.message,
    });
  }
};

// ==================== INVENTARIO ====================

// GET /api/reportes/inventario
// Obtiene reporte de inventario con paginacion
export const getReporteInventario = async (req: Request, res: Response) => {
  try {
    const dto = plainToClass(ReporteInventarioDto, req.query);
    const errors = await validate(dto);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Error de validacion',
        errors: errors.map(e => Object.values(e.constraints || {})).flat(),
      });
    }

    const pagina = dto.pagina || 1;
    const limite = dto.limite || 20;

    const resultado = await reportesService.obtenerReporteInventario(
      pagina,
      limite,
      dto.idCategoria,
      dto.idEmprendedor,
      dto.estado
    );

    res.json({
      success: true,
      ...resultado,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener reporte de inventario',
      error: error.message,
    });
  }
};

// GET /api/reportes/inventario/resumen
// Obtiene resumen ejecutivo del inventario
export const getResumenInventario = async (_req: Request, res: Response) => {
  try {
    const resumen = await reportesService.obtenerResumenInventario();
    res.json({
      success: true,
      data: resumen,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener resumen de inventario',
      error: error.message,
    });
  }
};

// ==================== ORDENES ====================

// GET /api/reportes/ordenes
// Obtiene reporte de ordenes con filtros
export const getReporteOrdenes = async (req: Request, res: Response) => {
  try {
    const dto = plainToClass(ReporteOrdenesDto, req.query);
    const errors = await validate(dto);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Error de validacion',
        errors: errors.map(e => Object.values(e.constraints || {})).flat(),
      });
    }

    const pagina = dto.pagina || 1;
    const limite = dto.limite || 20;

    const resultado = await reportesService.obtenerReporteOrdenes(
      pagina,
      limite,
      dto.fechaInicio,
      dto.fechaFin,
      dto.estado,
      dto.idUsuario
    );

    res.json({
      success: true,
      ...resultado,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener reporte de ordenes',
      error: error.message,
    });
  }
};

// ==================== USUARIOS ====================

// GET /api/reportes/usuarios/:id/estadisticas
// Obtiene estadisticas de un usuario especifico
export const getEstadisticasUsuario = async (req: Request, res: Response) => {
  try {
    const idUsuario = parseInt(req.params.id);

    if (isNaN(idUsuario) || idUsuario < 1) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuario invalido',
      });
    }

    const { fechaInicio, fechaFin } = req.query;

    const estadisticas = await reportesService.obtenerEstadisticasUsuario(
      idUsuario,
      fechaInicio as string,
      fechaFin as string
    );

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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadisticas del usuario',
      error: error.message,
    });
  }
};

// GET /api/reportes/usuarios/top-compradores
// Obtiene el ranking de mejores compradores
export const getTopCompradores = async (req: Request, res: Response) => {
  try {
    const limite = parseInt(req.query.limite as string) || 10;
    const { fechaInicio, fechaFin } = req.query;

    if (limite < 1 || limite > 100) {
      return res.status(400).json({
        success: false,
        message: 'El limite debe estar entre 1 y 100',
      });
    }

    const topCompradores = await reportesService.obtenerTopCompradores(
      limite,
      fechaInicio as string,
      fechaFin as string
    );

    res.json({
      success: true,
      data: topCompradores,
      total: topCompradores.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener top compradores',
      error: error.message,
    });
  }
};

// ==================== INGRESOS Y TENDENCIAS ====================

// GET /api/reportes/ingresos
// Obtiene reporte de ingresos por periodo
export const getReporteIngresos = async (req: Request, res: Response) => {
  try {
    const dto = plainToClass(ReporteIngresosDto, req.query);
    const errors = await validate(dto);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Error de validacion',
        errors: errors.map(e => Object.values(e.constraints || {})).flat(),
      });
    }

    const agrupacion = dto.agrupacion || 'mes';

    const ingresos = await reportesService.obtenerReporteIngresos(
      dto.fechaInicio!,
      dto.fechaFin!,
      agrupacion
    );

    res.json({
      success: true,
      data: ingresos,
      total: ingresos.length,
      agrupacion,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener reporte de ingresos',
      error: error.message,
    });
  }
};

// GET /api/reportes/tendencias
// Analiza tendencias de ventas
export const getTendencias = async (req: Request, res: Response) => {
  try {
    const dto = plainToClass(TendenciasDto, req.query);
    const errors = await validate(dto);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Error de validacion',
        errors: errors.map(e => Object.values(e.constraints || {})).flat(),
      });
    }

    const periodo = (dto.periodo as 'dia' | 'semana' | 'mes') || 'dia';

    const tendencias = await reportesService.analizarTendencias(
      dto.fechaInicio!,
      dto.fechaFin!,
      periodo,
      dto.idCategoria
    );

    res.json({
      success: true,
      data: tendencias,
      total: tendencias.length,
      periodo,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al analizar tendencias',
      error: error.message,
    });
  }
};

// POST /api/reportes/comparar-periodos
// Compara metricas entre dos periodos
export const compararPeriodos = async (req: Request, res: Response) => {
  try {
    const { fechaInicio1, fechaFin1, fechaInicio2, fechaFin2 } = req.body;

    // Validacion basica
    if (!fechaInicio1 || !fechaFin1 || !fechaInicio2 || !fechaFin2) {
      return res.status(400).json({
        success: false,
        message: 'Todas las fechas son requeridas',
      });
    }

    const comparacion = await reportesService.compararPeriodos(
      fechaInicio1,
      fechaFin1,
      fechaInicio2,
      fechaFin2
    );

    res.json({
      success: true,
      data: comparacion,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al comparar periodos',
      error: error.message,
    });
  }
};

// ==================== ANALISIS AVANZADOS ====================

// GET /api/reportes/abandono-carrito
// Analiza el abandono del carrito de compras
export const getAnalisisAbandonoCarrito = async (_req: Request, res: Response) => {
  try {
    const analisis = await reportesService.analizarAbandonoCarrito();
    res.json({
      success: true,
      data: analisis,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al analizar abandono de carrito',
      error: error.message,
    });
  }
};

// GET /api/reportes/precios-categoria
// Analiza precios promedio por categoria
export const getAnalisisPreciosCategorias = async (_req: Request, res: Response) => {
  try {
    const analisis = await reportesService.analizarPreciosPorCategoria();
    res.json({
      success: true,
      data: analisis,
      total: analisis.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al analizar precios por categoria',
      error: error.message,
    });
  }
};

// GET /api/reportes/proyeccion-ventas
// Proyecta ventas futuras basado en historico
export const getProyeccionVentas = async (req: Request, res: Response) => {
  try {
    const mesesHistoricos = parseInt(req.query.meses as string) || 3;

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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al proyectar ventas',
      error: error.message,
    });
  }
};

// ==================== EXPORTACION ====================

// POST /api/reportes/exportar
// Exporta un reporte a formato JSON estructurado
export const exportarReporte = async (req: Request, res: Response) => {
  try {
    const { tipoReporte, parametros } = req.body;

    if (!tipoReporte) {
      return res.status(400).json({
        success: false,
        message: 'El tipo de reporte es requerido',
      });
    }

    const reporte = await reportesService.exportarReporteJSON(
      tipoReporte,
      parametros || {}
    );

    res.json({
      success: true,
      data: reporte,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al exportar reporte',
      error: error.message,
    });
  }
};

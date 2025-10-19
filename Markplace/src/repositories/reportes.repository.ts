// Repository para consultas complejas y reportes analiticos
// Utiliza TypeORM QueryBuilder para optimizar las consultas a la base de datos

import { AppDataSource } from '../config/data-source';
import { Producto } from '../entities/Producto';
import { Orden } from '../entities/Orden';
import { DetalleOrden } from '../entities/DetalleOrden';
import { Usuario } from '../entities/Usuario';
import { Categoria } from '../entities/Categoria';
import { Emprendedor } from '../entities/Emprendedor';
import {
  EstadisticaProducto,
  EstadisticaCategoria,
  EstadisticaEmprendedor,
  ReporteInventario,
  TopProducto,
  MetricasGenerales,
  FiltroFecha,
  Paginacion,
} from '../interfaces/consultas.interface';
import {
  calcularOffset,
  determinarEstadoStock,
  aplicarFiltrosFecha,
} from '../utils/reportes.utils';

export class ReportesRepository {
  private productoRepository = AppDataSource.getRepository(Producto);
  private ordenRepository = AppDataSource.getRepository(Orden);
  private detalleOrdenRepository = AppDataSource.getRepository(DetalleOrden);
  private usuarioRepository = AppDataSource.getRepository(Usuario);
  private categoriaRepository = AppDataSource.getRepository(Categoria);
  private emprendedorRepository = AppDataSource.getRepository(Emprendedor);

  // Obtiene las metricas generales del sistema (dashboard principal)
  async obtenerMetricasGenerales(): Promise<MetricasGenerales> {
    // Cuenta total de usuarios registrados
    const totalUsuarios = await this.usuarioRepository.count();

    // Cuenta total de productos en catalogo
    const totalProductos = await this.productoRepository.count();

    // Cuenta total de ordenes realizadas
    const totalOrdenes = await this.ordenRepository.count();

    // Suma total de ingresos de todas las ordenes
    const resultadoIngresos = await this.ordenRepository
      .createQueryBuilder('orden')
      .select('SUM(orden.total)', 'total')
      .getRawOne();
    const totalIngresos = parseFloat(resultadoIngresos?.total || '0');

    // Cuenta ordenes en proceso (no completadas ni canceladas)
    const ordenesEnProceso = await this.ordenRepository.count({
      where: { estado: 'En Proceso' },
    });

    // Cuenta productos con stock agotado (stock = 0)
    const productosAgotados = await this.productoRepository.count({
      where: { stock: 0 },
    });

    // Calcula el ticket promedio (ingreso total / numero de ordenes)
    const ticketPromedio = totalOrdenes > 0 ? totalIngresos / totalOrdenes : 0;

    // Calcula crecimiento mensual comparando este mes con el anterior
    const fechaActual = new Date();
    const inicioMesActual = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
    const inicioMesAnterior = new Date(fechaActual.getFullYear(), fechaActual.getMonth() - 1, 1);
    const finMesAnterior = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 0);

    const ventasMesActual = await this.ordenRepository
      .createQueryBuilder('orden')
      .where('orden.fechaOrden >= :fecha', { fecha: inicioMesActual })
      .getCount();

    const ventasMesAnterior = await this.ordenRepository
      .createQueryBuilder('orden')
      .where('orden.fechaOrden >= :inicio', { inicio: inicioMesAnterior })
      .andWhere('orden.fechaOrden <= :fin', { fin: finMesAnterior })
      .getCount();

    const crecimientoMensual =
      ventasMesAnterior > 0
        ? ((ventasMesActual - ventasMesAnterior) / ventasMesAnterior) * 100
        : 0;

    return {
      totalUsuarios,
      totalProductos,
      totalOrdenes,
      totalIngresos,
      ordenesEnProceso,
      productosAgotados,
      crecimientoMensual,
      ticketPromedio,
    };
  }

  // Obtiene los productos mas vendidos con opcion de limitar resultados
  async obtenerProductosMasVendidos(
    limite: number = 10,
    filtroFecha?: FiltroFecha
  ): Promise<TopProducto[]> {
    const query = this.detalleOrdenRepository
      .createQueryBuilder('detalle')
      .select('producto.idProducto', 'idProducto')
      .addSelect('producto.nombreProducto', 'nombreProducto')
      .addSelect('categoria.nombreCategoria', 'categoria')
      .addSelect('emprendedor.nombreTienda', 'emprendedor')
      .addSelect('SUM(detalle.cantidad)', 'cantidadVendida')
      .addSelect('SUM(detalle.subtotal)', 'ingresosGenerados')
      .innerJoin('detalle.producto', 'producto')
      .innerJoin('detalle.orden', 'orden')
      .innerJoin('producto.categoria', 'categoria')
      .innerJoin('producto.emprendedor', 'emprendedor')
      .groupBy('producto.idProducto')
      .addGroupBy('producto.nombreProducto')
      .addGroupBy('categoria.nombreCategoria')
      .addGroupBy('emprendedor.nombreTienda')
      .orderBy('cantidadVendida', 'DESC')
      .limit(limite);

    // Aplica filtros de fecha si se proporcionan
    if (filtroFecha) {
      aplicarFiltrosFecha(query, 'orden', 'fechaOrden', filtroFecha.fechaInicio, filtroFecha.fechaFin);
    }

    const resultados = await query.getRawMany();

    // Transforma los resultados y agrega la posicion en el ranking
    return resultados.map((item, index) => ({
      posicion: index + 1,
      idProducto: parseInt(item.idProducto),
      nombreProducto: item.nombreProducto,
      categoria: item.categoria,
      emprendedor: item.emprendedor,
      cantidadVendida: parseInt(item.cantidadVendida),
      ingresosGenerados: parseFloat(item.ingresosGenerados),
      valorMetrica: parseInt(item.cantidadVendida),
    }));
  }

  // Obtiene los productos mas rentables (mayores ingresos generados)
  async obtenerProductosMasRentables(
    limite: number = 10,
    filtroFecha?: FiltroFecha
  ): Promise<TopProducto[]> {
    const query = this.detalleOrdenRepository
      .createQueryBuilder('detalle')
      .select('producto.idProducto', 'idProducto')
      .addSelect('producto.nombreProducto', 'nombreProducto')
      .addSelect('categoria.nombreCategoria', 'categoria')
      .addSelect('emprendedor.nombreTienda', 'emprendedor')
      .addSelect('SUM(detalle.cantidad)', 'cantidadVendida')
      .addSelect('SUM(detalle.subtotal)', 'ingresosGenerados')
      .innerJoin('detalle.producto', 'producto')
      .innerJoin('detalle.orden', 'orden')
      .innerJoin('producto.categoria', 'categoria')
      .innerJoin('producto.emprendedor', 'emprendedor')
      .groupBy('producto.idProducto')
      .addGroupBy('producto.nombreProducto')
      .addGroupBy('categoria.nombreCategoria')
      .addGroupBy('emprendedor.nombreTienda')
      .orderBy('ingresosGenerados', 'DESC')
      .limit(limite);

    // Aplica filtros de fecha si se proporcionan
    if (filtroFecha) {
      aplicarFiltrosFecha(query, 'orden', 'fechaOrden', filtroFecha.fechaInicio, filtroFecha.fechaFin);
    }

    const resultados = await query.getRawMany();

    return resultados.map((item, index) => ({
      posicion: index + 1,
      idProducto: parseInt(item.idProducto),
      nombreProducto: item.nombreProducto,
      categoria: item.categoria,
      emprendedor: item.emprendedor,
      cantidadVendida: parseInt(item.cantidadVendida),
      ingresosGenerados: parseFloat(item.ingresosGenerados),
      valorMetrica: parseFloat(item.ingresosGenerados),
    }));
  }

  // Obtiene estadisticas detalladas de ventas por producto
  async obtenerEstadisticasProducto(
    idProducto: number,
    filtroFecha?: FiltroFecha
  ): Promise<EstadisticaProducto | null> {
    const query = this.detalleOrdenRepository
      .createQueryBuilder('detalle')
      .select('producto.idProducto', 'idProducto')
      .addSelect('producto.nombreProducto', 'nombreProducto')
      .addSelect('categoria.nombreCategoria', 'categoria')
      .addSelect('emprendedor.nombreTienda', 'emprendedor')
      .addSelect('COUNT(DISTINCT orden.idOrden)', 'totalVendido')
      .addSelect('SUM(detalle.cantidad)', 'cantidadVendida')
      .addSelect('SUM(detalle.subtotal)', 'ingresosGenerados')
      .innerJoin('detalle.producto', 'producto')
      .innerJoin('detalle.orden', 'orden')
      .innerJoin('producto.categoria', 'categoria')
      .innerJoin('producto.emprendedor', 'emprendedor')
      .where('producto.idProducto = :idProducto', { idProducto })
      .groupBy('producto.idProducto')
      .addGroupBy('producto.nombreProducto')
      .addGroupBy('categoria.nombreCategoria')
      .addGroupBy('emprendedor.nombreTienda');

    if (filtroFecha) {
      aplicarFiltrosFecha(query, 'orden', 'fechaOrden', filtroFecha.fechaInicio, filtroFecha.fechaFin);
    }

    const resultado = await query.getRawOne();

    if (!resultado) return null;

    return {
      idProducto: parseInt(resultado.idProducto),
      nombreProducto: resultado.nombreProducto,
      totalVendido: parseInt(resultado.totalVendido),
      cantidadVendida: parseInt(resultado.cantidadVendida),
      ingresosGenerados: parseFloat(resultado.ingresosGenerados),
      categoria: resultado.categoria,
      emprendedor: resultado.emprendedor,
    };
  }

  // Obtiene estadisticas de ventas agrupadas por categoria
  async obtenerEstadisticasPorCategoria(
    filtroFecha?: FiltroFecha
  ): Promise<EstadisticaCategoria[]> {
    const query = this.categoriaRepository
      .createQueryBuilder('categoria')
      .select('categoria.idCategoria', 'idCategoria')
      .addSelect('categoria.nombreCategoria', 'nombreCategoria')
      .addSelect('COUNT(DISTINCT producto.idProducto)', 'totalProductos')
      .addSelect('COUNT(DISTINCT orden.idOrden)', 'totalVentas')
      .addSelect('COALESCE(SUM(detalle.subtotal), 0)', 'ingresosGenerados')
      .leftJoin('categoria.productos', 'producto')
      .leftJoin('producto.detalles', 'detalle')
      .leftJoin('detalle.orden', 'orden')
      .groupBy('categoria.idCategoria')
      .addGroupBy('categoria.nombreCategoria')
      .orderBy('ingresosGenerados', 'DESC');

    if (filtroFecha) {
      query.andWhere('orden.fechaOrden >= :fechaInicio', { fechaInicio: filtroFecha.fechaInicio });
      query.andWhere('orden.fechaOrden <= :fechaFin', { fechaFin: filtroFecha.fechaFin });
    }

    const resultados = await query.getRawMany();

    // Para cada categoria, obtiene el producto mas vendido
    const estadisticas: EstadisticaCategoria[] = [];
    for (const item of resultados) {
      const productoMasVendido = await this.obtenerProductoMasVendidoPorCategoria(
        parseInt(item.idCategoria),
        filtroFecha
      );

      estadisticas.push({
        idCategoria: parseInt(item.idCategoria),
        nombreCategoria: item.nombreCategoria,
        totalProductos: parseInt(item.totalProductos),
        totalVentas: parseInt(item.totalVentas),
        ingresosGenerados: parseFloat(item.ingresosGenerados),
        productoMasVendido: productoMasVendido || 'Sin ventas',
      });
    }

    return estadisticas;
  }

  // Metodo auxiliar para obtener el producto mas vendido de una categoria
  private async obtenerProductoMasVendidoPorCategoria(
    idCategoria: number,
    filtroFecha?: FiltroFecha
  ): Promise<string | null> {
    const query = this.detalleOrdenRepository
      .createQueryBuilder('detalle')
      .select('producto.nombreProducto', 'nombreProducto')
      .addSelect('SUM(detalle.cantidad)', 'cantidadVendida')
      .innerJoin('detalle.producto', 'producto')
      .innerJoin('detalle.orden', 'orden')
      .where('producto.categoria.idCategoria = :idCategoria', { idCategoria })
      .groupBy('producto.nombreProducto')
      .orderBy('cantidadVendida', 'DESC')
      .limit(1);

    if (filtroFecha) {
      aplicarFiltrosFecha(query, 'orden', 'fechaOrden', filtroFecha.fechaInicio, filtroFecha.fechaFin);
    }

    const resultado = await query.getRawOne();
    return resultado?.nombreProducto || null;
  }

  // Obtiene estadisticas de ventas agrupadas por emprendedor
  async obtenerEstadisticasPorEmprendedor(
    filtroFecha?: FiltroFecha
  ): Promise<EstadisticaEmprendedor[]> {
    const query = this.emprendedorRepository
      .createQueryBuilder('emprendedor')
      .select('emprendedor.idEmprendedor', 'idEmprendedor')
      .addSelect('emprendedor.nombreTienda', 'nombreTienda')
      .addSelect('emprendedor.rating', 'rating')
      .addSelect('COUNT(DISTINCT producto.idProducto)', 'totalProductos')
      .addSelect('COUNT(DISTINCT orden.idOrden)', 'totalVentas')
      .addSelect('COALESCE(SUM(detalle.subtotal), 0)', 'ingresosGenerados')
      .leftJoin('emprendedor.productos', 'producto')
      .leftJoin('producto.detalles', 'detalle')
      .leftJoin('detalle.orden', 'orden')
      .groupBy('emprendedor.idEmprendedor')
      .addGroupBy('emprendedor.nombreTienda')
      .addGroupBy('emprendedor.rating')
      .orderBy('ingresosGenerados', 'DESC');

    if (filtroFecha) {
      query.andWhere('orden.fechaOrden >= :fechaInicio', { fechaInicio: filtroFecha.fechaInicio });
      query.andWhere('orden.fechaOrden <= :fechaFin', { fechaFin: filtroFecha.fechaFin });
    }

    const resultados = await query.getRawMany();

    const estadisticas: EstadisticaEmprendedor[] = [];
    for (const item of resultados) {
      const productoMasVendido = await this.obtenerProductoMasVendidoPorEmprendedor(
        parseInt(item.idEmprendedor),
        filtroFecha
      );

      estadisticas.push({
        idEmprendedor: parseInt(item.idEmprendedor),
        nombreTienda: item.nombreTienda,
        totalProductos: parseInt(item.totalProductos),
        totalVentas: parseInt(item.totalVentas),
        ingresosGenerados: parseFloat(item.ingresosGenerados),
        rating: parseFloat(item.rating),
        productoMasVendido: productoMasVendido || 'Sin ventas',
      });
    }

    return estadisticas;
  }

  // Metodo auxiliar para obtener el producto mas vendido de un emprendedor
  private async obtenerProductoMasVendidoPorEmprendedor(
    idEmprendedor: number,
    filtroFecha?: FiltroFecha
  ): Promise<string | null> {
    const query = this.detalleOrdenRepository
      .createQueryBuilder('detalle')
      .select('producto.nombreProducto', 'nombreProducto')
      .addSelect('SUM(detalle.cantidad)', 'cantidadVendida')
      .innerJoin('detalle.producto', 'producto')
      .innerJoin('detalle.orden', 'orden')
      .where('producto.emprendedor.idEmprendedor = :idEmprendedor', { idEmprendedor })
      .groupBy('producto.nombreProducto')
      .orderBy('cantidadVendida', 'DESC')
      .limit(1);

    if (filtroFecha) {
      aplicarFiltrosFecha(query, 'orden', 'fechaOrden', filtroFecha.fechaInicio, filtroFecha.fechaFin);
    }

    const resultado = await query.getRawOne();
    return resultado?.nombreProducto || null;
  }

  // Obtiene reporte completo de inventario con paginacion
  async obtenerReporteInventario(
    paginacion: Paginacion,
    idCategoria?: number,
    idEmprendedor?: number,
    estado?: string
  ): Promise<{ datos: ReporteInventario[]; total: number }> {
    const query = this.productoRepository
      .createQueryBuilder('producto')
      .select('producto.idProducto', 'idProducto')
      .addSelect('producto.nombreProducto', 'nombreProducto')
      .addSelect('categoria.nombreCategoria', 'categoria')
      .addSelect('emprendedor.nombreTienda', 'emprendedor')
      .addSelect('producto.stock', 'stockActual')
      .addSelect('producto.precio', 'precio')
      .innerJoin('producto.categoria', 'categoria')
      .innerJoin('producto.emprendedor', 'emprendedor');

    // Aplica filtros opcionales
    if (idCategoria) {
      query.andWhere('categoria.idCategoria = :idCategoria', { idCategoria });
    }

    if (idEmprendedor) {
      query.andWhere('emprendedor.idEmprendedor = :idEmprendedor', { idEmprendedor });
    }

    // Filtra por estado de stock si se especifica
    if (estado && estado !== 'Todos') {
      if (estado === 'Agotado') {
        query.andWhere('producto.stock = 0');
      } else if (estado === 'Stock Bajo') {
        query.andWhere('producto.stock > 0 AND producto.stock <= 10');
      } else if (estado === 'Disponible') {
        query.andWhere('producto.stock > 10');
      }
    }

    // Cuenta el total de registros antes de paginar
    const total = await query.getCount();

    // Aplica paginacion
    const offset = calcularOffset(paginacion.pagina, paginacion.limite);
    query.skip(offset).take(paginacion.limite);

    const resultados = await query.getRawMany();

    const datos: ReporteInventario[] = resultados.map((item) => {
      const stockActual = parseInt(item.stockActual);
      const precio = parseFloat(item.precio);
      const stockMinimo = 10; // Valor configurable

      return {
        idProducto: parseInt(item.idProducto),
        nombreProducto: item.nombreProducto,
        categoria: item.categoria,
        emprendedor: item.emprendedor,
        stockActual,
        stockMinimo,
        precio,
        valorInventario: stockActual * precio,
        estado: determinarEstadoStock(stockActual, stockMinimo) as any,
      };
    });

    return { datos, total };
  }
}

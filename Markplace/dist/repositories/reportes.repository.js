"use strict";
// Repository para consultas complejas y reportes analiticos
// Utiliza TypeORM QueryBuilder para optimizar las consultas a la base de datos
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportesRepository = void 0;
const data_source_1 = require("../config/data-source");
const Producto_1 = require("../entities/Producto");
const Orden_1 = require("../entities/Orden");
const DetalleOrden_1 = require("../entities/DetalleOrden");
const Usuario_1 = require("../entities/Usuario");
const Categoria_1 = require("../entities/Categoria");
const Emprendedor_1 = require("../entities/Emprendedor");
const reportes_utils_1 = require("../utils/reportes.utils");
class ReportesRepository {
    constructor() {
        this.productoRepository = data_source_1.AppDataSource.getRepository(Producto_1.Producto);
        this.ordenRepository = data_source_1.AppDataSource.getRepository(Orden_1.Orden);
        this.detalleOrdenRepository = data_source_1.AppDataSource.getRepository(DetalleOrden_1.DetalleOrden);
        this.usuarioRepository = data_source_1.AppDataSource.getRepository(Usuario_1.Usuario);
        this.categoriaRepository = data_source_1.AppDataSource.getRepository(Categoria_1.Categoria);
        this.emprendedorRepository = data_source_1.AppDataSource.getRepository(Emprendedor_1.Emprendedor);
    }
    // Obtiene las metricas generales del sistema (dashboard principal)
    async obtenerMetricasGenerales() {
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
        const crecimientoMensual = ventasMesAnterior > 0
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
    async obtenerProductosMasVendidos(limite = 10, filtroFecha) {
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
            (0, reportes_utils_1.aplicarFiltrosFecha)(query, 'orden', 'fechaOrden', filtroFecha.fechaInicio, filtroFecha.fechaFin);
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
    async obtenerProductosMasRentables(limite = 10, filtroFecha) {
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
            (0, reportes_utils_1.aplicarFiltrosFecha)(query, 'orden', 'fechaOrden', filtroFecha.fechaInicio, filtroFecha.fechaFin);
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
    async obtenerEstadisticasProducto(idProducto, filtroFecha) {
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
            (0, reportes_utils_1.aplicarFiltrosFecha)(query, 'orden', 'fechaOrden', filtroFecha.fechaInicio, filtroFecha.fechaFin);
        }
        const resultado = await query.getRawOne();
        if (!resultado)
            return null;
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
    async obtenerEstadisticasPorCategoria(filtroFecha) {
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
        const estadisticas = [];
        for (const item of resultados) {
            const productoMasVendido = await this.obtenerProductoMasVendidoPorCategoria(parseInt(item.idCategoria), filtroFecha);
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
    async obtenerProductoMasVendidoPorCategoria(idCategoria, filtroFecha) {
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
            (0, reportes_utils_1.aplicarFiltrosFecha)(query, 'orden', 'fechaOrden', filtroFecha.fechaInicio, filtroFecha.fechaFin);
        }
        const resultado = await query.getRawOne();
        return resultado?.nombreProducto || null;
    }
    // Obtiene estadisticas de ventas agrupadas por emprendedor
    async obtenerEstadisticasPorEmprendedor(filtroFecha) {
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
        const estadisticas = [];
        for (const item of resultados) {
            const productoMasVendido = await this.obtenerProductoMasVendidoPorEmprendedor(parseInt(item.idEmprendedor), filtroFecha);
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
    async obtenerProductoMasVendidoPorEmprendedor(idEmprendedor, filtroFecha) {
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
            (0, reportes_utils_1.aplicarFiltrosFecha)(query, 'orden', 'fechaOrden', filtroFecha.fechaInicio, filtroFecha.fechaFin);
        }
        const resultado = await query.getRawOne();
        return resultado?.nombreProducto || null;
    }
    // Obtiene reporte completo de inventario con paginacion
    async obtenerReporteInventario(paginacion, idCategoria, idEmprendedor, estado) {
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
            }
            else if (estado === 'Stock Bajo') {
                query.andWhere('producto.stock > 0 AND producto.stock <= 10');
            }
            else if (estado === 'Disponible') {
                query.andWhere('producto.stock > 10');
            }
        }
        // Cuenta el total de registros antes de paginar
        const total = await query.getCount();
        // Aplica paginacion
        const offset = (0, reportes_utils_1.calcularOffset)(paginacion.pagina, paginacion.limite);
        query.skip(offset).take(paginacion.limite);
        const resultados = await query.getRawMany();
        const datos = resultados.map((item) => {
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
                estado: (0, reportes_utils_1.determinarEstadoStock)(stockActual, stockMinimo),
            };
        });
        return { datos, total };
    }
    // ==================== CONSULTAS AVANZADAS Y AGREGACIONES ====================
    // Obtiene reporte de ordenes con filtros avanzados y paginacion
    async obtenerReporteOrdenes(paginacion, filtroFecha, estado, idUsuario) {
        const query = this.ordenRepository
            .createQueryBuilder('orden')
            .select('orden.idOrden', 'idOrden')
            .addSelect('orden.fechaOrden', 'fechaOrden')
            .addSelect('orden.estado', 'estado')
            .addSelect('orden.total', 'total')
            .addSelect('usuario.nombre', 'nombreUsuario')
            .addSelect('usuario.apellido', 'apellidoUsuario')
            .addSelect('COUNT(DISTINCT detalle.idDetalleOrden)', 'cantidadProductos')
            .addSelect('SUM(detalle.subtotal)', 'subtotal')
            .innerJoin('orden.usuario', 'usuario')
            .leftJoin('orden.detalles', 'detalle')
            .groupBy('orden.idOrden')
            .addGroupBy('orden.fechaOrden')
            .addGroupBy('orden.estado')
            .addGroupBy('orden.total')
            .addGroupBy('usuario.nombre')
            .addGroupBy('usuario.apellido')
            .orderBy('orden.fechaOrden', 'DESC');
        // Aplica filtros opcionales
        if (filtroFecha) {
            (0, reportes_utils_1.aplicarFiltrosFecha)(query, 'orden', 'fechaOrden', filtroFecha.fechaInicio, filtroFecha.fechaFin);
        }
        if (estado && estado !== 'Todos') {
            query.andWhere('orden.estado = :estado', { estado });
        }
        if (idUsuario) {
            query.andWhere('usuario.idUsuario = :idUsuario', { idUsuario });
        }
        // Cuenta el total antes de paginar
        const total = await query.getCount();
        // Aplica paginacion
        const offset = (0, reportes_utils_1.calcularOffset)(paginacion.pagina, paginacion.limite);
        query.skip(offset).take(paginacion.limite);
        const resultados = await query.getRawMany();
        const datos = resultados.map((item) => ({
            idOrden: parseInt(item.idOrden),
            fechaOrden: item.fechaOrden,
            usuario: `${item.nombreUsuario} ${item.apellidoUsuario}`,
            estado: item.estado,
            cantidadProductos: parseInt(item.cantidadProductos),
            subtotal: parseFloat(item.subtotal || '0'),
            total: parseFloat(item.total),
            metodoPago: 'Tarjeta Virtual', // Se puede extender segun necesidad
        }));
        return { datos, total };
    }
    // Obtiene estadisticas detalladas de un usuario especifico
    async obtenerEstadisticasUsuario(idUsuario, filtroFecha) {
        // Obtiene datos basicos del usuario
        const usuario = await this.usuarioRepository.findOne({
            where: { idUsuario },
        });
        if (!usuario)
            return null;
        // Construye consulta para estadisticas de ordenes
        const queryOrdenes = this.ordenRepository
            .createQueryBuilder('orden')
            .select('COUNT(orden.idOrden)', 'totalOrdenes')
            .addSelect('SUM(orden.total)', 'totalGastado')
            .addSelect('AVG(orden.total)', 'promedioCompra')
            .addSelect('MAX(orden.fechaOrden)', 'ultimaCompra')
            .where('orden.usuario.idUsuario = :idUsuario', { idUsuario });
        if (filtroFecha) {
            (0, reportes_utils_1.aplicarFiltrosFecha)(queryOrdenes, 'orden', 'fechaOrden', filtroFecha.fechaInicio, filtroFecha.fechaFin);
        }
        const estadisticasOrdenes = await queryOrdenes.getRawOne();
        // Obtiene la categoria favorita del usuario (mas comprada)
        const queryCategoriaFavorita = this.detalleOrdenRepository
            .createQueryBuilder('detalle')
            .select('categoria.nombreCategoria', 'nombreCategoria')
            .addSelect('COUNT(detalle.idDetalleOrden)', 'totalCompras')
            .innerJoin('detalle.producto', 'producto')
            .innerJoin('producto.categoria', 'categoria')
            .innerJoin('detalle.orden', 'orden')
            .where('orden.usuario.idUsuario = :idUsuario', { idUsuario })
            .groupBy('categoria.nombreCategoria')
            .orderBy('totalCompras', 'DESC')
            .limit(1);
        if (filtroFecha) {
            (0, reportes_utils_1.aplicarFiltrosFecha)(queryCategoriaFavorita, 'orden', 'fechaOrden', filtroFecha.fechaInicio, filtroFecha.fechaFin);
        }
        const categoriaFavorita = await queryCategoriaFavorita.getRawOne();
        return {
            idUsuario: usuario.idUsuario,
            nombreCompleto: `${usuario.nombre} ${usuario.apellido}`,
            email: usuario.email,
            totalOrdenes: parseInt(estadisticasOrdenes?.totalOrdenes || '0'),
            totalGastado: parseFloat(estadisticasOrdenes?.totalGastado || '0'),
            promedioCompra: parseFloat(estadisticasOrdenes?.promedioCompra || '0'),
            ultimaCompra: estadisticasOrdenes?.ultimaCompra || null,
            categoriaFavorita: categoriaFavorita?.nombreCategoria || 'Sin compras',
        };
    }
    // Obtiene reporte de ingresos agrupados por periodo (dia, mes, anio)
    async obtenerReporteIngresos(filtroFecha, agrupacion = 'mes') {
        let formatoFecha;
        // Define el formato de agrupacion segun el periodo solicitado
        switch (agrupacion) {
            case 'dia':
                formatoFecha = "TO_CHAR(orden.fechaOrden, 'YYYY-MM-DD')";
                break;
            case 'semana':
                formatoFecha = "TO_CHAR(orden.fechaOrden, 'IYYY-IW')"; // Año-Semana ISO
                break;
            case 'mes':
                formatoFecha = "TO_CHAR(orden.fechaOrden, 'YYYY-MM')";
                break;
            case 'anio':
                formatoFecha = "TO_CHAR(orden.fechaOrden, 'YYYY')";
                break;
            default:
                formatoFecha = "TO_CHAR(orden.fechaOrden, 'YYYY-MM')";
        }
        const query = this.ordenRepository
            .createQueryBuilder('orden')
            .select(formatoFecha, 'periodo')
            .addSelect('COUNT(orden.idOrden)', 'totalOrdenes')
            .addSelect('SUM(orden.total)', 'ingresosGenerados')
            .addSelect('AVG(orden.total)', 'promedioOrden')
            .addSelect('SUM(detalle.cantidad)', 'productosVendidos')
            .leftJoin('orden.detalles', 'detalle')
            .where('orden.fechaOrden >= :fechaInicio', { fechaInicio: filtroFecha.fechaInicio })
            .andWhere('orden.fechaOrden <= :fechaFin', { fechaFin: filtroFecha.fechaFin })
            .groupBy('periodo')
            .orderBy('periodo', 'ASC');
        const resultados = await query.getRawMany();
        return resultados.map((item) => ({
            periodo: item.periodo,
            totalOrdenes: parseInt(item.totalOrdenes),
            ingresosGenerados: parseFloat(item.ingresosGenerados || '0'),
            promedioOrden: parseFloat(item.promedioOrden || '0'),
            productosVendidos: parseInt(item.productosVendidos || '0'),
        }));
    }
    // Analiza tendencias de ventas en un periodo con granularidad especificada
    async analizarTendencias(filtroFecha, periodo = 'dia', idCategoria) {
        let formatoFecha;
        // Define formato segun periodo de agrupacion
        switch (periodo) {
            case 'dia':
                formatoFecha = "TO_CHAR(orden.fechaOrden, 'YYYY-MM-DD')";
                break;
            case 'semana':
                formatoFecha = "TO_CHAR(orden.fechaOrden, 'IYYY-IW')";
                break;
            case 'mes':
                formatoFecha = "TO_CHAR(orden.fechaOrden, 'YYYY-MM')";
                break;
            default:
                formatoFecha = "TO_CHAR(orden.fechaOrden, 'YYYY-MM-DD')";
        }
        const query = this.ordenRepository
            .createQueryBuilder('orden')
            .select(formatoFecha, 'fecha')
            .addSelect('COUNT(orden.idOrden)', 'totalOrdenes')
            .addSelect('SUM(orden.total)', 'totalVentas')
            .addSelect('AVG(orden.total)', 'promedioOrden')
            .addSelect('SUM(detalle.cantidad)', 'productosVendidos')
            .leftJoin('orden.detalles', 'detalle')
            .where('orden.fechaOrden >= :fechaInicio', { fechaInicio: filtroFecha.fechaInicio })
            .andWhere('orden.fechaOrden <= :fechaFin', { fechaFin: filtroFecha.fechaFin });
        // Filtra por categoria si se especifica
        if (idCategoria) {
            query
                .leftJoin('detalle.producto', 'producto')
                .andWhere('producto.categoria.idCategoria = :idCategoria', { idCategoria });
        }
        query.groupBy('fecha').orderBy('fecha', 'ASC');
        const resultados = await query.getRawMany();
        return resultados.map((item) => ({
            fecha: new Date(item.fecha),
            totalVentas: parseFloat(item.totalVentas || '0'),
            totalOrdenes: parseInt(item.totalOrdenes),
            promedioOrden: parseFloat(item.promedioOrden || '0'),
            productosVendidos: parseInt(item.productosVendidos || '0'),
        }));
    }
    // Obtiene comparativa de rendimiento entre periodos
    async compararPeriodos(periodo1, periodo2) {
        // Obtiene metricas del primer periodo
        const [ventasPeriodo1] = await Promise.all([
            this.ordenRepository
                .createQueryBuilder('orden')
                .select('COUNT(orden.idOrden)', 'totalOrdenes')
                .addSelect('SUM(orden.total)', 'totalIngresos')
                .addSelect('AVG(orden.total)', 'ticketPromedio')
                .where('orden.fechaOrden >= :fechaInicio', { fechaInicio: periodo1.fechaInicio })
                .andWhere('orden.fechaOrden <= :fechaFin', { fechaFin: periodo1.fechaFin })
                .getRawOne(),
        ]);
        // Obtiene metricas del segundo periodo
        const [ventasPeriodo2] = await Promise.all([
            this.ordenRepository
                .createQueryBuilder('orden')
                .select('COUNT(orden.idOrden)', 'totalOrdenes')
                .addSelect('SUM(orden.total)', 'totalIngresos')
                .addSelect('AVG(orden.total)', 'ticketPromedio')
                .where('orden.fechaOrden >= :fechaInicio', { fechaInicio: periodo2.fechaInicio })
                .andWhere('orden.fechaOrden <= :fechaFin', { fechaFin: periodo2.fechaFin })
                .getRawOne(),
        ]);
        // Calcula variaciones porcentuales
        const calcularVariacion = (actual, anterior) => {
            if (anterior === 0)
                return 0;
            return ((actual - anterior) / anterior) * 100;
        };
        const ordenes1 = parseInt(ventasPeriodo1?.totalOrdenes || '0');
        const ordenes2 = parseInt(ventasPeriodo2?.totalOrdenes || '0');
        const ingresos1 = parseFloat(ventasPeriodo1?.totalIngresos || '0');
        const ingresos2 = parseFloat(ventasPeriodo2?.totalIngresos || '0');
        const ticket1 = parseFloat(ventasPeriodo1?.ticketPromedio || '0');
        const ticket2 = parseFloat(ventasPeriodo2?.ticketPromedio || '0');
        return {
            periodo1: {
                totalOrdenes: ordenes1,
                totalIngresos: ingresos1,
                ticketPromedio: ticket1,
            },
            periodo2: {
                totalOrdenes: ordenes2,
                totalIngresos: ingresos2,
                ticketPromedio: ticket2,
            },
            variaciones: {
                ordenesVariacion: calcularVariacion(ordenes2, ordenes1),
                ingresosVariacion: calcularVariacion(ingresos2, ingresos1),
                ticketVariacion: calcularVariacion(ticket2, ticket1),
            },
        };
    }
    // Obtiene el top de compradores (usuarios con mayor gasto)
    async obtenerTopCompradores(limite = 10, filtroFecha) {
        const query = this.usuarioRepository
            .createQueryBuilder('usuario')
            .select('usuario.idUsuario', 'idUsuario')
            .addSelect('usuario.nombre', 'nombre')
            .addSelect('usuario.apellido', 'apellido')
            .addSelect('usuario.email', 'email')
            .addSelect('COUNT(orden.idOrden)', 'totalOrdenes')
            .addSelect('SUM(orden.total)', 'totalGastado')
            .addSelect('AVG(orden.total)', 'promedioCompra')
            .innerJoin('usuario.ordenes', 'orden')
            .groupBy('usuario.idUsuario')
            .addGroupBy('usuario.nombre')
            .addGroupBy('usuario.apellido')
            .addGroupBy('usuario.email')
            .orderBy('totalGastado', 'DESC')
            .limit(limite);
        if (filtroFecha) {
            (0, reportes_utils_1.aplicarFiltrosFecha)(query, 'orden', 'fechaOrden', filtroFecha.fechaInicio, filtroFecha.fechaFin);
        }
        const resultados = await query.getRawMany();
        return resultados.map((item, index) => ({
            posicion: index + 1,
            idUsuario: parseInt(item.idUsuario),
            nombreCompleto: `${item.nombre} ${item.apellido}`,
            email: item.email,
            totalOrdenes: parseInt(item.totalOrdenes),
            totalGastado: parseFloat(item.totalGastado),
            promedioCompra: parseFloat(item.promedioCompra),
        }));
    }
    // Analiza el abandono del carrito (productos agregados pero no comprados)
    async analizarAbandonoCarrito() {
        // Cuenta total de carritos activos
        const totalCarritos = await this.productoRepository
            .createQueryBuilder('producto')
            .select('COUNT(DISTINCT carrito.idCarrito)', 'totalCarritos')
            .innerJoin('producto.carritosDetalle', 'detalleCarrito')
            .innerJoin('detalleCarrito.carrito', 'carrito')
            .getRawOne();
        // Cuenta ordenes realizadas
        const totalOrdenes = await this.ordenRepository.count();
        // Obtiene productos mas abandonados
        const productosAbandonados = await this.productoRepository
            .createQueryBuilder('producto')
            .select('producto.idProducto', 'idProducto')
            .addSelect('producto.nombreProducto', 'nombreProducto')
            .addSelect('COUNT(detalleCarrito.idDetalleCarrito)', 'vecesAgregado')
            .addSelect('SUM(detalleCarrito.cantidad)', 'cantidadTotal')
            .innerJoin('producto.carritosDetalle', 'detalleCarrito')
            .groupBy('producto.idProducto')
            .addGroupBy('producto.nombreProducto')
            .orderBy('vecesAgregado', 'DESC')
            .limit(10)
            .getRawMany();
        const tasaAbandonoEstimada = totalCarritos && totalOrdenes
            ? ((parseInt(totalCarritos.totalCarritos) - totalOrdenes) /
                parseInt(totalCarritos.totalCarritos)) *
                100
            : 0;
        return {
            totalCarritosActivos: parseInt(totalCarritos?.totalCarritos || '0'),
            totalOrdenesCompletadas: totalOrdenes,
            tasaAbandonoEstimada,
            productosAbandonados: productosAbandonados.map((item, index) => ({
                posicion: index + 1,
                idProducto: parseInt(item.idProducto),
                nombreProducto: item.nombreProducto,
                vecesAgregado: parseInt(item.vecesAgregado),
                cantidadTotal: parseInt(item.cantidadTotal),
            })),
        };
    }
    // Obtiene analisis de precio promedio por categoria
    async analizarPreciosPorCategoria() {
        const resultados = await this.productoRepository
            .createQueryBuilder('producto')
            .select('categoria.idCategoria', 'idCategoria')
            .addSelect('categoria.nombreCategoria', 'nombreCategoria')
            .addSelect('COUNT(producto.idProducto)', 'totalProductos')
            .addSelect('AVG(producto.precio)', 'precioPromedio')
            .addSelect('MIN(producto.precio)', 'precioMinimo')
            .addSelect('MAX(producto.precio)', 'precioMaximo')
            .innerJoin('producto.categoria', 'categoria')
            .groupBy('categoria.idCategoria')
            .addGroupBy('categoria.nombreCategoria')
            .orderBy('precioPromedio', 'DESC')
            .getRawMany();
        return resultados.map((item) => ({
            idCategoria: parseInt(item.idCategoria),
            nombreCategoria: item.nombreCategoria,
            totalProductos: parseInt(item.totalProductos),
            precioPromedio: parseFloat(item.precioPromedio),
            precioMinimo: parseFloat(item.precioMinimo),
            precioMaximo: parseFloat(item.precioMaximo),
        }));
    }
    // Obtiene proyeccion de ventas basada en tendencia historica
    async proyectarVentas(mesesHistoricos = 3) {
        const fechaActual = new Date();
        const fechaInicio = new Date(fechaActual);
        fechaInicio.setMonth(fechaInicio.getMonth() - mesesHistoricos);
        // Obtiene ventas historicas mensuales
        const ventasHistoricas = await this.ordenRepository
            .createQueryBuilder('orden')
            .select("TO_CHAR(orden.fechaOrden, 'YYYY-MM')", 'mes')
            .addSelect('COUNT(orden.idOrden)', 'totalOrdenes')
            .addSelect('SUM(orden.total)', 'totalIngresos')
            .where('orden.fechaOrden >= :fechaInicio', { fechaInicio })
            .groupBy('mes')
            .orderBy('mes', 'ASC')
            .getRawMany();
        if (ventasHistoricas.length === 0) {
            return {
                promedioOrdenesMessuales: 0,
                promedioIngresosMessuales: 0,
                proyeccionProximoMes: {
                    ordenes: 0,
                    ingresos: 0,
                },
            };
        }
        // Calcula promedios
        const totalOrdenesHistoricas = ventasHistoricas.reduce((sum, item) => sum + parseInt(item.totalOrdenes), 0);
        const totalIngresosHistoricos = ventasHistoricas.reduce((sum, item) => sum + parseFloat(item.totalIngresos || '0'), 0);
        const promedioOrdenes = totalOrdenesHistoricas / ventasHistoricas.length;
        const promedioIngresos = totalIngresosHistoricos / ventasHistoricas.length;
        return {
            mesesAnalizados: ventasHistoricas.length,
            promedioOrdenesMessuales: Math.round(promedioOrdenes),
            promedioIngresosMessuales: Math.round(promedioIngresos * 100) / 100,
            proyeccionProximoMes: {
                ordenes: Math.round(promedioOrdenes),
                ingresos: Math.round(promedioIngresos * 100) / 100,
            },
            datosHistoricos: ventasHistoricas.map((item) => ({
                mes: item.mes,
                ordenes: parseInt(item.totalOrdenes),
                ingresos: parseFloat(item.totalIngresos || '0'),
            })),
        };
    }
}
exports.ReportesRepository = ReportesRepository;

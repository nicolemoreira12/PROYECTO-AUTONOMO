"use strict";
// Utilidades y funciones auxiliares para el modulo de reportes
// Contiene helpers para calculos, formateo de datos y validaciones
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizarOrdenamiento = exports.generarRangoFechas = exports.aplicarFiltrosFecha = exports.parsearFecha = exports.determinarEstadoStock = exports.agruparPorPeriodo = exports.redondearDecimales = exports.calcularPorcentajeCambio = exports.validarRangoFechas = exports.formatearFecha = exports.construirRespuestaPaginada = exports.calcularTotalPaginas = exports.calcularOffset = void 0;
// Calcula el offset para consultas paginadas basado en numero de pagina y limite
const calcularOffset = (pagina, limite) => {
    return (pagina - 1) * limite;
};
exports.calcularOffset = calcularOffset;
// Calcula el total de paginas basado en total de registros y limite por pagina
const calcularTotalPaginas = (total, limite) => {
    return Math.ceil(total / limite);
};
exports.calcularTotalPaginas = calcularTotalPaginas;
// Construye la respuesta paginada con metadatos
const construirRespuestaPaginada = (datos, total, paginacion) => {
    return {
        datos,
        total,
        pagina: paginacion.pagina,
        limite: paginacion.limite,
        totalPaginas: (0, exports.calcularTotalPaginas)(total, paginacion.limite),
    };
};
exports.construirRespuestaPaginada = construirRespuestaPaginada;
// Formatea una fecha a string en formato ISO
const formatearFecha = (fecha) => {
    return fecha.toISOString().split('T')[0];
};
exports.formatearFecha = formatearFecha;
// Valida que la fecha de inicio sea anterior a la fecha fin
const validarRangoFechas = (fechaInicio, fechaFin) => {
    return fechaInicio <= fechaFin;
};
exports.validarRangoFechas = validarRangoFechas;
// Calcula el porcentaje de cambio entre dos valores
const calcularPorcentajeCambio = (valorActual, valorAnterior) => {
    if (valorAnterior === 0)
        return 0;
    return ((valorActual - valorAnterior) / valorAnterior) * 100;
};
exports.calcularPorcentajeCambio = calcularPorcentajeCambio;
// Redondea un numero a dos decimales
const redondearDecimales = (valor, decimales = 2) => {
    return Math.round(valor * Math.pow(10, decimales)) / Math.pow(10, decimales);
};
exports.redondearDecimales = redondearDecimales;
// Agrupa datos por periodo (dia, semana, mes)
const agruparPorPeriodo = (fecha, periodo) => {
    const año = fecha.getFullYear();
    const mes = fecha.getMonth() + 1;
    const dia = fecha.getDate();
    switch (periodo) {
        case 'dia':
            return `${año}-${mes.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
        case 'mes':
            return `${año}-${mes.toString().padStart(2, '0')}`;
        case 'anio':
            return `${año}`;
        default:
            return `${año}-${mes.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
    }
};
exports.agruparPorPeriodo = agruparPorPeriodo;
// Determina el estado del stock basado en la cantidad disponible
const determinarEstadoStock = (stockActual, stockMinimo = 10) => {
    if (stockActual === 0)
        return 'Agotado';
    if (stockActual <= stockMinimo)
        return 'Stock Bajo';
    return 'Disponible';
};
exports.determinarEstadoStock = determinarEstadoStock;
// Convierte string a Date o retorna undefined si es invalido
const parsearFecha = (fechaStr) => {
    if (!fechaStr)
        return undefined;
    const fecha = new Date(fechaStr);
    return isNaN(fecha.getTime()) ? undefined : fecha;
};
exports.parsearFecha = parsearFecha;
// Aplica filtros de fecha a una consulta TypeORM QueryBuilder
const aplicarFiltrosFecha = (query, alias, campoFecha, fechaInicio, fechaFin) => {
    if (fechaInicio) {
        query.andWhere(`${alias}.${campoFecha} >= :fechaInicio`, { fechaInicio });
    }
    if (fechaFin) {
        query.andWhere(`${alias}.${campoFecha} <= :fechaFin`, { fechaFin });
    }
};
exports.aplicarFiltrosFecha = aplicarFiltrosFecha;
// Genera un rango de fechas entre dos fechas con intervalo especificado
const generarRangoFechas = (fechaInicio, fechaFin, periodo = 'dia') => {
    const fechas = [];
    const fechaActual = new Date(fechaInicio);
    while (fechaActual <= fechaFin) {
        fechas.push(new Date(fechaActual));
        // Incrementar segun el periodo
        switch (periodo) {
            case 'dia':
                fechaActual.setDate(fechaActual.getDate() + 1);
                break;
            case 'semana':
                fechaActual.setDate(fechaActual.getDate() + 7);
                break;
            case 'mes':
                fechaActual.setMonth(fechaActual.getMonth() + 1);
                break;
        }
    }
    return fechas;
};
exports.generarRangoFechas = generarRangoFechas;
// Sanitiza los parametros de ordenamiento para prevenir inyeccion SQL
const sanitizarOrdenamiento = (campo, direccion) => {
    // Lista blanca de campos permitidos para ordenamiento
    const camposPermitidos = [
        'id', 'nombre', 'precio', 'fecha', 'total', 'cantidad',
        'fechaOrden', 'fechaRegistro', 'stock', 'rating'
    ];
    const campoSanitizado = camposPermitidos.includes(campo) ? campo : 'id';
    const direccionSanitizada = direccion.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    return { campo: campoSanitizado, direccion: direccionSanitizada };
};
exports.sanitizarOrdenamiento = sanitizarOrdenamiento;

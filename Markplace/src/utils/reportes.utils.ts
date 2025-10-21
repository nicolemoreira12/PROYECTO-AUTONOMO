// Utilidades y funciones auxiliares para el modulo de reportes
// Contiene helpers para calculos, formateo de datos y validaciones

import { Paginacion, RespuestaPaginada } from '../interfaces/consultas.interface';

// Calcula el offset para consultas paginadas basado en numero de pagina y limite
export const calcularOffset = (pagina: number, limite: number): number => {
  return (pagina - 1) * limite;
};

// Calcula el total de paginas basado en total de registros y limite por pagina
export const calcularTotalPaginas = (total: number, limite: number): number => {
  return Math.ceil(total / limite);
};

// Construye la respuesta paginada con metadatos
export const construirRespuestaPaginada = <T>(
  datos: T[],
  total: number,
  paginacion: Paginacion
): RespuestaPaginada<T> => {
  return {
    datos,
    total,
    pagina: paginacion.pagina,
    limite: paginacion.limite,
    totalPaginas: calcularTotalPaginas(total, paginacion.limite),
  };
};

// Formatea una fecha a string en formato ISO
export const formatearFecha = (fecha: Date): string => {
  return fecha.toISOString().split('T')[0];
};

// Valida que la fecha de inicio sea anterior a la fecha fin
export const validarRangoFechas = (fechaInicio: Date, fechaFin: Date): boolean => {
  return fechaInicio <= fechaFin;
};

// Calcula el porcentaje de cambio entre dos valores
export const calcularPorcentajeCambio = (valorActual: number, valorAnterior: number): number => {
  if (valorAnterior === 0) return 0;
  return ((valorActual - valorAnterior) / valorAnterior) * 100;
};

// Redondea un numero a dos decimales
export const redondearDecimales = (valor: number, decimales: number = 2): number => {
  return Math.round(valor * Math.pow(10, decimales)) / Math.pow(10, decimales);
};

// Agrupa datos por periodo (dia, semana, mes)
export const agruparPorPeriodo = (fecha: Date, periodo: string): string => {
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

// Determina el estado del stock basado en la cantidad disponible
export const determinarEstadoStock = (stockActual: number, stockMinimo: number = 10): string => {
  if (stockActual === 0) return 'Agotado';
  if (stockActual <= stockMinimo) return 'Stock Bajo';
  return 'Disponible';
};

// Convierte string a Date o retorna undefined si es invalido
export const parsearFecha = (fechaStr: string | undefined): Date | undefined => {
  if (!fechaStr) return undefined;
  const fecha = new Date(fechaStr);
  return isNaN(fecha.getTime()) ? undefined : fecha;
};

// Aplica filtros de fecha a una consulta TypeORM QueryBuilder
export const aplicarFiltrosFecha = (
  query: any,
  alias: string,
  campoFecha: string,
  fechaInicio?: Date,
  fechaFin?: Date
): void => {
  if (fechaInicio) {
    query.andWhere(`${alias}.${campoFecha} >= :fechaInicio`, { fechaInicio });
  }
  if (fechaFin) {
    query.andWhere(`${alias}.${campoFecha} <= :fechaFin`, { fechaFin });
  }
};

// Genera un rango de fechas entre dos fechas con intervalo especificado
export const generarRangoFechas = (
  fechaInicio: Date,
  fechaFin: Date,
  periodo: 'dia' | 'semana' | 'mes' = 'dia'
): Date[] => {
  const fechas: Date[] = [];
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

// Sanitiza los parametros de ordenamiento para prevenir inyeccion SQL
export const sanitizarOrdenamiento = (campo: string, direccion: string): { campo: string; direccion: 'ASC' | 'DESC' } => {
  // Lista blanca de campos permitidos para ordenamiento
  const camposPermitidos = [
    'id', 'nombre', 'precio', 'fecha', 'total', 'cantidad', 
    'fechaOrden', 'fechaRegistro', 'stock', 'rating'
  ];

  const campoSanitizado = camposPermitidos.includes(campo) ? campo : 'id';
  const direccionSanitizada = direccion.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  return { campo: campoSanitizado, direccion: direccionSanitizada };
};

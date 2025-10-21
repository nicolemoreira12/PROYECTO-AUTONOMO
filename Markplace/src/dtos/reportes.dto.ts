// DTOs (Data Transfer Objects) para validar y estructurar las peticiones de reportes
// Utilizan class-validator para asegurar que los datos recibidos sean correctos

import { IsDateString, IsInt, IsNumber, IsOptional, IsString, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

// DTO para solicitar reportes con filtro de fechas
export class ReporteFechaDto {
  @IsDateString()
  fechaInicio!: string;

  @IsDateString()
  fechaFin!: string;
}

// DTO para solicitar reportes con paginacion
export class PaginacionDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pagina?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limite?: number = 10;
}

// DTO para solicitar reportes con ordenamiento
export class OrdenamientoDto {
  @IsOptional()
  @IsString()
  campo?: string = 'id';

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  direccion?: 'ASC' | 'DESC' = 'DESC';
}

// DTO completo para reportes con filtros, paginacion y ordenamiento
export class ConsultaReporteDto extends PaginacionDto {
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  precioMinimo?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  precioMaximo?: number;

  @IsOptional()
  @IsString()
  campo?: string = 'id';

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  direccion?: 'ASC' | 'DESC' = 'DESC';
}

// DTO para solicitar reporte de productos por categoria
export class ReporteCategoriaDt {
  @Type(() => Number)
  @IsInt()
  idCategoria!: number;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;
}

// DTO para solicitar reporte de productos por emprendedor
export class ReporteEmprendedorDto {
  @Type(() => Number)
  @IsInt()
  idEmprendedor!: number;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;
}

// DTO para solicitar top productos
export class TopProductosDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limite?: number = 10;

  @IsOptional()
  @IsIn(['ventas', 'ingresos'])
  criterio?: 'ventas' | 'ingresos' = 'ventas';

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;
}

// DTO para solicitar estadisticas de usuario
export class EstadisticaUsuarioDto {
  @Type(() => Number)
  @IsInt()
  idUsuario!: number;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;
}

// DTO para solicitar reporte de inventario con filtros
export class ReporteInventarioDto extends PaginacionDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idCategoria?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idEmprendedor?: number;

  @IsOptional()
  @IsIn(['Disponible', 'Stock Bajo', 'Agotado', 'Todos'])
  estado?: string = 'Todos';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  stockMinimo?: number;
}

// DTO para solicitar reporte de ordenes con filtros
export class ReporteOrdenesDto extends ConsultaReporteDto {
  @IsOptional()
  @IsIn(['Pendiente', 'En Proceso', 'Completado', 'Cancelado', 'Todos'])
  estado?: string = 'Todos';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idUsuario?: number;
}

// DTO para solicitar reporte de ingresos por periodo
export class ReporteIngresosDto {
  @IsDateString()
  fechaInicio!: string;

  @IsDateString()
  fechaFin!: string;

  @IsOptional()
  @IsIn(['dia', 'semana', 'mes', 'anio'])
  agrupacion?: string = 'mes';
}

// DTO para solicitar analisis de tendencias
export class TendenciasDto {
  @IsDateString()
  fechaInicio!: string;

  @IsDateString()
  fechaFin!: string;

  @IsOptional()
  @IsIn(['dia', 'semana', 'mes'])
  periodo?: string = 'dia';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idCategoria?: number;
}

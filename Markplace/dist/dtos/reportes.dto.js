"use strict";
// DTOs (Data Transfer Objects) para validar y estructurar las peticiones de reportes
// Utilizan class-validator para asegurar que los datos recibidos sean correctos
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TendenciasDto = exports.ReporteIngresosDto = exports.ReporteOrdenesDto = exports.ReporteInventarioDto = exports.EstadisticaUsuarioDto = exports.TopProductosDto = exports.ReporteEmprendedorDto = exports.ReporteCategoriaDt = exports.ConsultaReporteDto = exports.OrdenamientoDto = exports.PaginacionDto = exports.ReporteFechaDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
// DTO para solicitar reportes con filtro de fechas
class ReporteFechaDto {
}
exports.ReporteFechaDto = ReporteFechaDto;
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ReporteFechaDto.prototype, "fechaInicio", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ReporteFechaDto.prototype, "fechaFin", void 0);
// DTO para solicitar reportes con paginacion
class PaginacionDto {
    constructor() {
        this.pagina = 1;
        this.limite = 10;
    }
}
exports.PaginacionDto = PaginacionDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], PaginacionDto.prototype, "pagina", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], PaginacionDto.prototype, "limite", void 0);
// DTO para solicitar reportes con ordenamiento
class OrdenamientoDto {
    constructor() {
        this.campo = 'id';
        this.direccion = 'DESC';
    }
}
exports.OrdenamientoDto = OrdenamientoDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OrdenamientoDto.prototype, "campo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['ASC', 'DESC']),
    __metadata("design:type", String)
], OrdenamientoDto.prototype, "direccion", void 0);
// DTO completo para reportes con filtros, paginacion y ordenamiento
class ConsultaReporteDto extends PaginacionDto {
    constructor() {
        super(...arguments);
        this.campo = 'id';
        this.direccion = 'DESC';
    }
}
exports.ConsultaReporteDto = ConsultaReporteDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ConsultaReporteDto.prototype, "fechaInicio", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ConsultaReporteDto.prototype, "fechaFin", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ConsultaReporteDto.prototype, "precioMinimo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ConsultaReporteDto.prototype, "precioMaximo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConsultaReporteDto.prototype, "campo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['ASC', 'DESC']),
    __metadata("design:type", String)
], ConsultaReporteDto.prototype, "direccion", void 0);
// DTO para solicitar reporte de productos por categoria
class ReporteCategoriaDt {
}
exports.ReporteCategoriaDt = ReporteCategoriaDt;
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ReporteCategoriaDt.prototype, "idCategoria", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ReporteCategoriaDt.prototype, "fechaInicio", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ReporteCategoriaDt.prototype, "fechaFin", void 0);
// DTO para solicitar reporte de productos por emprendedor
class ReporteEmprendedorDto {
}
exports.ReporteEmprendedorDto = ReporteEmprendedorDto;
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ReporteEmprendedorDto.prototype, "idEmprendedor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ReporteEmprendedorDto.prototype, "fechaInicio", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ReporteEmprendedorDto.prototype, "fechaFin", void 0);
// DTO para solicitar top productos
class TopProductosDto {
    constructor() {
        this.limite = 10;
        this.criterio = 'ventas';
    }
}
exports.TopProductosDto = TopProductosDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], TopProductosDto.prototype, "limite", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['ventas', 'ingresos']),
    __metadata("design:type", String)
], TopProductosDto.prototype, "criterio", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], TopProductosDto.prototype, "fechaInicio", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], TopProductosDto.prototype, "fechaFin", void 0);
// DTO para solicitar estadisticas de usuario
class EstadisticaUsuarioDto {
}
exports.EstadisticaUsuarioDto = EstadisticaUsuarioDto;
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], EstadisticaUsuarioDto.prototype, "idUsuario", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], EstadisticaUsuarioDto.prototype, "fechaInicio", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], EstadisticaUsuarioDto.prototype, "fechaFin", void 0);
// DTO para solicitar reporte de inventario con filtros
class ReporteInventarioDto extends PaginacionDto {
    constructor() {
        super(...arguments);
        this.estado = 'Todos';
    }
}
exports.ReporteInventarioDto = ReporteInventarioDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ReporteInventarioDto.prototype, "idCategoria", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ReporteInventarioDto.prototype, "idEmprendedor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['Disponible', 'Stock Bajo', 'Agotado', 'Todos']),
    __metadata("design:type", String)
], ReporteInventarioDto.prototype, "estado", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReporteInventarioDto.prototype, "stockMinimo", void 0);
// DTO para solicitar reporte de ordenes con filtros
class ReporteOrdenesDto extends ConsultaReporteDto {
    constructor() {
        super(...arguments);
        this.estado = 'Todos';
    }
}
exports.ReporteOrdenesDto = ReporteOrdenesDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['Pendiente', 'En Proceso', 'Completado', 'Cancelado', 'Todos']),
    __metadata("design:type", String)
], ReporteOrdenesDto.prototype, "estado", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ReporteOrdenesDto.prototype, "idUsuario", void 0);
// DTO para solicitar reporte de ingresos por periodo
class ReporteIngresosDto {
    constructor() {
        this.agrupacion = 'mes';
    }
}
exports.ReporteIngresosDto = ReporteIngresosDto;
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ReporteIngresosDto.prototype, "fechaInicio", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ReporteIngresosDto.prototype, "fechaFin", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['dia', 'semana', 'mes', 'anio']),
    __metadata("design:type", String)
], ReporteIngresosDto.prototype, "agrupacion", void 0);
// DTO para solicitar analisis de tendencias
class TendenciasDto {
    constructor() {
        this.periodo = 'dia';
    }
}
exports.TendenciasDto = TendenciasDto;
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], TendenciasDto.prototype, "fechaInicio", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], TendenciasDto.prototype, "fechaFin", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['dia', 'semana', 'mes']),
    __metadata("design:type", String)
], TendenciasDto.prototype, "periodo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], TendenciasDto.prototype, "idCategoria", void 0);

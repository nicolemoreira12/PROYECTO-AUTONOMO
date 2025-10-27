"use strict";
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
exports.Orden = void 0;
const typeorm_1 = require("typeorm");
const Usuario_1 = require("./Usuario");
const DetalleOrden_1 = require("./DetalleOrden");
const Pago_1 = require("./Pago");
let Orden = class Orden {
};
exports.Orden = Orden;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Orden.prototype, "idOrden", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    __metadata("design:type", Date)
], Orden.prototype, "fechaOrden", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], Orden.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)("decimal", { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Orden.prototype, "total", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Usuario_1.Usuario, (usuario) => usuario.ordenes),
    __metadata("design:type", Usuario_1.Usuario)
], Orden.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => DetalleOrden_1.DetalleOrden, (detalle) => detalle.orden),
    __metadata("design:type", Array)
], Orden.prototype, "detalles", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Pago_1.Pago, (pago) => pago.orden),
    __metadata("design:type", Array)
], Orden.prototype, "pagos", void 0);
exports.Orden = Orden = __decorate([
    (0, typeorm_1.Entity)()
], Orden);

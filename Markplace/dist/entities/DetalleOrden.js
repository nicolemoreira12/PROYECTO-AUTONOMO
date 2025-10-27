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
exports.DetalleOrden = void 0;
const typeorm_1 = require("typeorm");
const Orden_1 = require("./Orden");
const Producto_1 = require("./Producto");
let DetalleOrden = class DetalleOrden {
};
exports.DetalleOrden = DetalleOrden;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], DetalleOrden.prototype, "idDetalleOrden", void 0);
__decorate([
    (0, typeorm_1.Column)("int"),
    __metadata("design:type", Number)
], DetalleOrden.prototype, "cantidad", void 0);
__decorate([
    (0, typeorm_1.Column)("decimal", { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], DetalleOrden.prototype, "precioUnitario", void 0);
__decorate([
    (0, typeorm_1.Column)("decimal", { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], DetalleOrden.prototype, "subtotal", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Orden_1.Orden, (orden) => orden.detalles),
    __metadata("design:type", Orden_1.Orden)
], DetalleOrden.prototype, "orden", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Producto_1.Producto, { eager: true }),
    __metadata("design:type", Producto_1.Producto)
], DetalleOrden.prototype, "producto", void 0);
exports.DetalleOrden = DetalleOrden = __decorate([
    (0, typeorm_1.Entity)()
], DetalleOrden);

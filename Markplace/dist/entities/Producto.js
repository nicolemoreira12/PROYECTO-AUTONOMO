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
exports.Producto = void 0;
const typeorm_1 = require("typeorm");
const Emprendedor_1 = require("./Emprendedor");
const Categoria_1 = require("./Categoria");
const DetalleOrden_1 = require("./DetalleOrden");
const DetalleCarrito_1 = require("./DetalleCarrito");
let Producto = class Producto {
};
exports.Producto = Producto;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Producto.prototype, "idProducto", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Producto.prototype, "nombreProducto", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 250 }),
    __metadata("design:type", String)
], Producto.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)("decimal", { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Producto.prototype, "precio", void 0);
__decorate([
    (0, typeorm_1.Column)("int"),
    __metadata("design:type", Number)
], Producto.prototype, "stock", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], Producto.prototype, "imagenURL", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Emprendedor_1.Emprendedor, (emprendedor) => emprendedor.productos, { eager: true }),
    __metadata("design:type", Emprendedor_1.Emprendedor)
], Producto.prototype, "emprendedor", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Categoria_1.Categoria, (categoria) => categoria.productos, { eager: true }),
    __metadata("design:type", Categoria_1.Categoria)
], Producto.prototype, "categoria", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => DetalleOrden_1.DetalleOrden, (detalle) => detalle.producto),
    __metadata("design:type", Array)
], Producto.prototype, "detalles", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => DetalleCarrito_1.DetalleCarrito, (detalleCarrito) => detalleCarrito.producto),
    __metadata("design:type", Array)
], Producto.prototype, "carritosDetalle", void 0);
exports.Producto = Producto = __decorate([
    (0, typeorm_1.Entity)()
], Producto);

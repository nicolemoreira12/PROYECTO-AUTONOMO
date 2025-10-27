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
exports.Usuario = void 0;
const typeorm_1 = require("typeorm");
const Orden_1 = require("./Orden");
const CarritoCompra_1 = require("./CarritoCompra");
const TarjetaVirtual_1 = require("./TarjetaVirtual");
let Usuario = class Usuario {
};
exports.Usuario = Usuario;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Usuario.prototype, "idUsuario", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Usuario.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Usuario.prototype, "apellido", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, unique: true }),
    __metadata("design:type", String)
], Usuario.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Usuario.prototype, "contrasena", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", String)
], Usuario.prototype, "direccion", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], Usuario.prototype, "telefono", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], Usuario.prototype, "rol", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    __metadata("design:type", Date)
], Usuario.prototype, "fechaRegistro", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Orden_1.Orden, (orden) => orden.usuario),
    __metadata("design:type", Array)
], Usuario.prototype, "ordenes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CarritoCompra_1.CarritoCompra, (carrito) => carrito.usuario),
    __metadata("design:type", Array)
], Usuario.prototype, "carritos", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => TarjetaVirtual_1.TarjetaVirtual, (tarjeta) => tarjeta.usuario),
    __metadata("design:type", Array)
], Usuario.prototype, "tarjetas", void 0);
exports.Usuario = Usuario = __decorate([
    (0, typeorm_1.Entity)()
], Usuario);

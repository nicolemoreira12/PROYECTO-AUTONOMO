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
exports.TarjetaVirtual = void 0;
const typeorm_1 = require("typeorm");
const Usuario_1 = require("./Usuario");
const Transaccion_1 = require("./Transaccion");
let TarjetaVirtual = class TarjetaVirtual {
};
exports.TarjetaVirtual = TarjetaVirtual;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TarjetaVirtual.prototype, "idTarjeta", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], TarjetaVirtual.prototype, "idUsuario", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Usuario_1.Usuario, (usuario) => usuario.tarjetas),
    (0, typeorm_1.JoinColumn)({ name: "idUsuario" }),
    __metadata("design:type", Usuario_1.Usuario)
], TarjetaVirtual.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    __metadata("design:type", String)
], TarjetaVirtual.prototype, "numeroTarjeta", void 0);
__decorate([
    (0, typeorm_1.Column)("decimal", { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], TarjetaVirtual.prototype, "saldoDisponible", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    __metadata("design:type", Date)
], TarjetaVirtual.prototype, "fechaExpiracion", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], TarjetaVirtual.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Transaccion_1.Transaccion, (transaccion) => transaccion.tarjeta),
    __metadata("design:type", Array)
], TarjetaVirtual.prototype, "transacciones", void 0);
exports.TarjetaVirtual = TarjetaVirtual = __decorate([
    (0, typeorm_1.Entity)("tarjetavirtual")
], TarjetaVirtual);

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
exports.Transaccion = void 0;
const typeorm_1 = require("typeorm");
const TarjetaVirtual_1 = require("./TarjetaVirtual");
let Transaccion = class Transaccion {
};
exports.Transaccion = Transaccion;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Transaccion.prototype, "idTransaccion", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => TarjetaVirtual_1.TarjetaVirtual, (tarjeta) => tarjeta.transacciones),
    (0, typeorm_1.JoinColumn)({ name: "idTarjeta" }),
    __metadata("design:type", TarjetaVirtual_1.TarjetaVirtual)
], Transaccion.prototype, "tarjeta", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Transaccion.prototype, "idTarjeta", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Transaccion.prototype, "monto", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], Transaccion.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: "date" }),
    __metadata("design:type", Date)
], Transaccion.prototype, "fecha", void 0);
exports.Transaccion = Transaccion = __decorate([
    (0, typeorm_1.Entity)("transaccion")
], Transaccion);

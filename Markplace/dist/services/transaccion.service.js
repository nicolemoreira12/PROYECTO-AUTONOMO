"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransaccionService = void 0;
const data_source_1 = require("../config/data-source");
const Transaccion_1 = require("../entities/Transaccion");
const TarjetaVirtual_1 = require("../entities/TarjetaVirtual");
const transaccionRepo = data_source_1.AppDataSource.getRepository(Transaccion_1.Transaccion);
const tarjetaRepo = data_source_1.AppDataSource.getRepository(TarjetaVirtual_1.TarjetaVirtual);
class TransaccionService {
    async getAll() {
        return await transaccionRepo.find({ relations: ["tarjeta"] });
    }
    async getById(id) {
        return await transaccionRepo.findOne({ where: { idTransaccion: id }, relations: ["tarjeta"] });
    }
    async create(data) {
        // buscamos la tarjeta
        const tarjeta = await tarjetaRepo.findOne({ where: { idTarjeta: data.idTarjeta } });
        if (!tarjeta)
            throw new Error("Tarjeta no encontrada");
        // si es depósito -> aumenta saldo
        if (data.tipo === "DEPOSITO") {
            tarjeta.saldoDisponible += Number(data.monto);
        }
        // si es compra -> disminuye saldo
        if (data.tipo === "COMPRA") {
            if (tarjeta.saldoDisponible < Number(data.monto)) {
                throw new Error("Saldo insuficiente");
            }
            tarjeta.saldoDisponible -= Number(data.monto);
        }
        if ("fecha" in data)
            delete data.fecha;
        // guardamos transacción
        const nuevaTransaccion = transaccionRepo.create(data);
        await transaccionRepo.save(nuevaTransaccion);
        // actualizamos saldo de la tarjeta
        await tarjetaRepo.save(tarjeta);
        return nuevaTransaccion;
    }
}
exports.TransaccionService = TransaccionService;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PagoService = void 0;
const data_source_1 = require("../config/data-source");
const Pago_1 = require("../entities/Pago");
const pagoRepo = data_source_1.AppDataSource.getRepository(Pago_1.Pago);
class PagoService {
    async getAll() {
        return await pagoRepo.find({ relations: ["orden"] });
    }
    async getById(id) {
        const pago = await pagoRepo.findOne({
            where: { idPago: id },
            relations: ["orden"]
        });
        if (!pago) {
            throw new Error("Pago no encontrado");
        }
        return pago;
    }
    async create(data) {
        const nuevo = pagoRepo.create(data);
        return await pagoRepo.save(nuevo);
    }
    async update(id, data) {
        const pago = await pagoRepo.findOneBy({ idPago: id });
        if (!pago) {
            throw new Error("Pago no encontrado");
        }
        pagoRepo.merge(pago, data);
        return await pagoRepo.save(pago);
    }
    async delete(id) {
        const result = await pagoRepo.delete(id);
        if (result.affected === 0) {
            throw new Error("Pago no encontrado");
        }
        return result;
    }
}
exports.PagoService = PagoService;

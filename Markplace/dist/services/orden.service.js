"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdenService = void 0;
const data_source_1 = require("../config/data-source");
const Orden_1 = require("../entities/Orden");
const ordenRepo = data_source_1.AppDataSource.getRepository(Orden_1.Orden);
class OrdenService {
    async getAll() {
        return await ordenRepo.find({ relations: ["usuario", "detalles", "detalles.producto"] });
    }
    async getById(id) {
        const orden = await ordenRepo.findOne({
            where: { idOrden: id },
            relations: ["usuario", "detalles", "detalles.producto"],
        });
        if (!orden) {
            throw new Error("Orden no encontrada");
        }
        return orden;
    }
    async create(data) {
        const nuevo = ordenRepo.create(data);
        return await ordenRepo.save(nuevo);
    }
    async update(id, data) {
        const orden = await ordenRepo.findOneBy({ idOrden: id });
        if (!orden) {
            throw new Error("Orden no encontrada");
        }
        ordenRepo.merge(orden, data);
        return await ordenRepo.save(orden);
    }
    async delete(id) {
        const result = await ordenRepo.delete(id);
        if (result.affected === 0) {
            throw new Error("Orden no encontrada");
        }
        return result;
    }
}
exports.OrdenService = OrdenService;

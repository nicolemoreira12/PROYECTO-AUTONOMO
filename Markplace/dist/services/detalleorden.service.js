"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DetalleOrdenService = void 0;
const data_source_1 = require("../config/data-source");
const DetalleOrden_1 = require("../entities/DetalleOrden");
const detalleOrdenRepo = data_source_1.AppDataSource.getRepository(DetalleOrden_1.DetalleOrden);
class DetalleOrdenService {
    async getAll() {
        return await detalleOrdenRepo.find({ relations: ["orden", "producto"] });
    }
    async getById(id) {
        const detalle = await detalleOrdenRepo.findOne({
            where: { idDetalleOrden: id },
            relations: ["orden", "producto"]
        });
        if (!detalle) {
            throw new Error("Detalle de orden no encontrado");
        }
        return detalle;
    }
    async create(data) {
        const nuevo = detalleOrdenRepo.create(data);
        return await detalleOrdenRepo.save(nuevo);
    }
    async update(id, data) {
        const detalle = await detalleOrdenRepo.findOneBy({ idDetalleOrden: id });
        if (!detalle) {
            throw new Error("Detalle de orden no encontrado");
        }
        detalleOrdenRepo.merge(detalle, data);
        return await detalleOrdenRepo.save(detalle);
    }
    async delete(id) {
        const result = await detalleOrdenRepo.delete(id);
        if (result.affected === 0) {
            throw new Error("Detalle de orden no encontrado");
        }
        return result;
    }
}
exports.DetalleOrdenService = DetalleOrdenService;

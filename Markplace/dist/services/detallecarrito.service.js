"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DetalleCarritoService = void 0;
const data_source_1 = require("../config/data-source");
const DetalleCarrito_1 = require("../entities/DetalleCarrito");
const detalleRepo = data_source_1.AppDataSource.getRepository(DetalleCarrito_1.DetalleCarrito);
class DetalleCarritoService {
    async getAll() {
        return await detalleRepo.find({ relations: ["carrito", "producto"] });
    }
    async getById(id) {
        const detalle = await detalleRepo.findOne({
            where: { idDetalleCarrito: id },
            relations: ["carrito", "producto"]
        });
        if (!detalle) {
            throw new Error("Detalle de carrito no encontrado");
        }
        return detalle;
    }
    async create(data) {
        const nuevo = detalleRepo.create(data);
        return await detalleRepo.save(nuevo);
    }
    async update(id, data) {
        const detalle = await detalleRepo.findOneBy({ idDetalleCarrito: id });
        if (!detalle) {
            throw new Error("Detalle de carrito no encontrado");
        }
        detalleRepo.merge(detalle, data);
        return await detalleRepo.save(detalle);
    }
    async delete(id) {
        const result = await detalleRepo.delete(id);
        if (result.affected === 0) {
            throw new Error("Detalle de carrito no encontrado");
        }
        return result;
    }
}
exports.DetalleCarritoService = DetalleCarritoService;

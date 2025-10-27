"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarritoService = void 0;
const data_source_1 = require("../config/data-source");
const CarritoCompra_1 = require("../entities/CarritoCompra");
const carritoRepo = data_source_1.AppDataSource.getRepository(CarritoCompra_1.CarritoCompra);
class CarritoService {
    async getAll() {
        return await carritoRepo.find({ relations: ["usuario", "detalles", "detalles.producto"] });
    }
    async getById(id) {
        const carrito = await carritoRepo.findOne({
            where: { idCarrito: id },
            relations: ["usuario", "detalles", "detalles.producto"]
        });
        if (!carrito) {
            throw new Error("Carrito no encontrado");
        }
        return carrito;
    }
    async create(data) {
        const nuevo = carritoRepo.create(data);
        return await carritoRepo.save(nuevo);
    }
    async update(id, data) {
        const carrito = await carritoRepo.findOneBy({ idCarrito: id });
        if (!carrito) {
            throw new Error("Carrito no encontrado");
        }
        carritoRepo.merge(carrito, data);
        return await carritoRepo.save(carrito);
    }
    async delete(id) {
        const result = await carritoRepo.delete(id);
        if (result.affected === 0) {
            throw new Error("Carrito no encontrado");
        }
        return result;
    }
}
exports.CarritoService = CarritoService;

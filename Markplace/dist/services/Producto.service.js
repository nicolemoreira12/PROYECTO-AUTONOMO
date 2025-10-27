"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductoService = void 0;
const data_source_1 = require("../config/data-source");
const Producto_1 = require("../entities/Producto");
const productoRepo = data_source_1.AppDataSource.getRepository(Producto_1.Producto);
class ProductoService {
    async getAll() {
        return await productoRepo.find({ relations: ["emprendedor", "categoria"] });
    }
    async getById(id) {
        const producto = await productoRepo.findOne({
            where: { idProducto: id },
            relations: ["emprendedor", "categoria"]
        });
        if (!producto) {
            throw new Error("Producto no encontrado");
        }
        return producto;
    }
    async create(data) {
        const nuevo = productoRepo.create(data);
        return await productoRepo.save(nuevo);
    }
    async update(id, data) {
        const producto = await productoRepo.findOneBy({ idProducto: id });
        if (!producto) {
            throw new Error("Producto no encontrado");
        }
        productoRepo.merge(producto, data);
        return await productoRepo.save(producto);
    }
    async delete(id) {
        const result = await productoRepo.delete(id);
        if (result.affected === 0) {
            throw new Error("Producto no encontrado");
        }
        return result;
    }
}
exports.ProductoService = ProductoService;

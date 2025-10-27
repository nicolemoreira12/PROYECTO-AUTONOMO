"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarritoController = void 0;
const carritocompra_service_1 = require("../services/carritocompra.service");
const carritoService = new carritocompra_service_1.CarritoService();
class CarritoController {
    async getAll(req, res) {
        try {
            const data = await carritoService.getAll();
            res.json(data);
        }
        catch (error) {
            res.status(500).json({ message: "Error al obtener carritos", error });
        }
    }
    async getById(req, res) {
        try {
            const data = await carritoService.getById(Number(req.params.id));
            res.json(data);
        }
        catch (error) {
            res.status(404).json({ message: error instanceof Error ? error.message : "Carrito no encontrado" });
        }
    }
    async create(req, res) {
        try {
            const data = await carritoService.create(req.body);
            res.status(201).json(data);
        }
        catch (error) {
            res.status(400).json({ message: "Error al crear carrito", error });
        }
    }
    async update(req, res) {
        try {
            const data = await carritoService.update(Number(req.params.id), req.body);
            res.json(data);
        }
        catch (error) {
            res.status(400).json({ message: error instanceof Error ? error.message : "Error al actualizar carrito" });
        }
    }
    async delete(req, res) {
        try {
            await carritoService.delete(Number(req.params.id));
            res.json({ message: "Carrito eliminado" });
        }
        catch (error) {
            res.status(404).json({ message: error instanceof Error ? error.message : "Error al eliminar carrito" });
        }
    }
}
exports.CarritoController = CarritoController;

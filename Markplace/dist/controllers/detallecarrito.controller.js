"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DetalleCarritoController = void 0;
const detallecarrito_service_1 = require("../services/detallecarrito.service");
const detalleService = new detallecarrito_service_1.DetalleCarritoService();
class DetalleCarritoController {
    async getAll(req, res) {
        try {
            const data = await detalleService.getAll();
            res.json(data);
        }
        catch (error) {
            res.status(500).json({ message: "Error al obtener detalles", error });
        }
    }
    async getById(req, res) {
        try {
            const data = await detalleService.getById(Number(req.params.id));
            res.json(data);
        }
        catch (error) {
            res.status(404).json({ message: error instanceof Error ? error.message : "Detalle no encontrado" });
        }
    }
    async create(req, res) {
        try {
            const data = await detalleService.create(req.body);
            res.status(201).json(data);
        }
        catch (error) {
            res.status(400).json({ message: "Error al crear detalle", error });
        }
    }
    async update(req, res) {
        try {
            const data = await detalleService.update(Number(req.params.id), req.body);
            res.json(data);
        }
        catch (error) {
            res.status(400).json({ message: error instanceof Error ? error.message : "Error al actualizar detalle" });
        }
    }
    async delete(req, res) {
        try {
            await detalleService.delete(Number(req.params.id));
            res.json({ message: "Detalle eliminado" });
        }
        catch (error) {
            res.status(404).json({ message: error instanceof Error ? error.message : "Error al eliminar detalle" });
        }
    }
}
exports.DetalleCarritoController = DetalleCarritoController;

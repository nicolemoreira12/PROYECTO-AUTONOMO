"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdenController = void 0;
const orden_service_1 = require("../services/orden.service");
const service = new orden_service_1.OrdenService();
class OrdenController {
    async getAll(req, res) {
        try {
            const ordenes = await service.getAll();
            res.json(ordenes);
        }
        catch (err) {
            res.status(500).json({ error: "Error al obtener órdenes" });
        }
    }
    async getById(req, res) {
        try {
            const id = parseInt(req.params.id);
            const orden = await service.getById(id);
            if (!orden)
                return res.status(404).json({ message: "Orden no encontrada" });
            res.json(orden);
        }
        catch (err) {
            res.status(500).json({ error: "Error al obtener orden" });
        }
    }
    async create(req, res) {
        try {
            const nuevaOrden = await service.create(req.body);
            res.status(201).json(nuevaOrden);
        }
        catch (err) {
            console.error("Error al crear orden:", err.message || err);
            res.status(400).json({
                error: "Error al crear orden",
                details: err.message || "Error desconocido"
            });
        }
    }
    async update(req, res) {
        try {
            const id = parseInt(req.params.id);
            const actualizada = await service.update(id, req.body);
            if (!actualizada)
                return res.status(404).json({ message: "Orden no encontrada" });
            res.json(actualizada);
        }
        catch (err) {
            res.status(400).json({ error: "Error al actualizar orden" });
        }
    }
    async delete(req, res) {
        try {
            const id = parseInt(req.params.id);
            const resultado = await service.delete(id);
            if (!resultado.affected)
                return res.status(404).json({ message: "Orden no encontrada" });
            res.json({ message: "Orden eliminada correctamente" });
        }
        catch (err) {
            res.status(500).json({ error: "Error al eliminar orden" });
        }
    }
}
exports.OrdenController = OrdenController;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TarjetaVirtualController = void 0;
const TarjetaVirtual_service_1 = require("../services/TarjetaVirtual.service");
const service = new TarjetaVirtual_service_1.TarjetaVirtualService();
class TarjetaVirtualController {
    async getAll(req, res) {
        try {
            const tarjetas = await service.getAll();
            res.json(tarjetas);
        }
        catch (err) {
            res.status(500).json({ error: "Error al obtener tarjetas" });
        }
    }
    async getById(req, res) {
        try {
            const id = parseInt(req.params.id);
            const tarjeta = await service.getById(id);
            if (!tarjeta)
                return res.status(404).json({ message: "Tarjeta no encontrada" });
            res.json(tarjeta);
        }
        catch (err) {
            res.status(500).json({ error: "Error al obtener tarjeta" });
        }
    }
    async create(req, res) {
        try {
            const nueva = await service.create(req.body);
            res.status(201).json(nueva);
        }
        catch (err) {
            res.status(400).json({ error: "Error al crear tarjeta" });
        }
    }
    async update(req, res) {
        try {
            const id = parseInt(req.params.id);
            const actualizada = await service.update(id, req.body);
            if (!actualizada)
                return res.status(404).json({ message: "Tarjeta no encontrada" });
            res.json(actualizada);
        }
        catch (err) {
            res.status(400).json({ error: "Error al actualizar tarjeta" });
        }
    }
    async delete(req, res) {
        try {
            const id = parseInt(req.params.id);
            const resultado = await service.delete(id);
            if (!resultado.affected)
                return res.status(404).json({ message: "Tarjeta no encontrada" });
            res.json({ message: "Tarjeta eliminada correctamente" });
        }
        catch (err) {
            res.status(500).json({ error: "Error al eliminar tarjeta" });
        }
    }
}
exports.TarjetaVirtualController = TarjetaVirtualController;

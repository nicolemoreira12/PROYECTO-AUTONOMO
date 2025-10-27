"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransaccionController = void 0;
const transaccion_service_1 = require("../services/transaccion.service");
const service = new transaccion_service_1.TransaccionService();
class TransaccionController {
    async getAll(req, res) {
        try {
            const transacciones = await service.getAll();
            res.json(transacciones);
        }
        catch (err) {
            res.status(500).json({ error: "Error al obtener transacciones" });
        }
    }
    async getById(req, res) {
        try {
            const id = parseInt(req.params.id);
            const transaccion = await service.getById(id);
            if (!transaccion)
                return res.status(404).json({ message: "No encontrada" });
            res.json(transaccion);
        }
        catch (err) {
            res.status(500).json({ error: "Error al obtener transacción" });
        }
    }
    async create(req, res) {
        try {
            const nueva = await service.create(req.body);
            res.status(201).json(nueva);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
}
exports.TransaccionController = TransaccionController;

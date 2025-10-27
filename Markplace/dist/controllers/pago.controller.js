"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PagoController = void 0;
const pago_service_1 = require("../services/pago.service");
const pagoService = new pago_service_1.PagoService();
class PagoController {
    async getAll(req, res) {
        try {
            const data = await pagoService.getAll();
            res.json(data);
        }
        catch (error) {
            res.status(500).json({ message: "Error al obtener pagos", error });
        }
    }
    async getById(req, res) {
        try {
            const data = await pagoService.getById(Number(req.params.id));
            res.json(data);
        }
        catch (error) {
            res.status(404).json({ message: error instanceof Error ? error.message : "Pago no encontrado" });
        }
    }
    async create(req, res) {
        try {
            const data = await pagoService.create(req.body);
            res.status(201).json(data);
        }
        catch (error) {
            res.status(400).json({ message: "Error al crear pago", error });
        }
    }
    async update(req, res) {
        try {
            const data = await pagoService.update(Number(req.params.id), req.body);
            res.json(data);
        }
        catch (error) {
            res.status(400).json({ message: error instanceof Error ? error.message : "Error al actualizar pago" });
        }
    }
    async delete(req, res) {
        try {
            await pagoService.delete(Number(req.params.id));
            res.json({ message: "Pago eliminado correctamente" });
        }
        catch (error) {
            res.status(404).json({ message: error instanceof Error ? error.message : "Error al eliminar pago" });
        }
    }
}
exports.PagoController = PagoController;

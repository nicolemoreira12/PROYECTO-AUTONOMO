"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmprendedorController = void 0;
const emprendedor_service_1 = require("../services/emprendedor.service");
const service = new emprendedor_service_1.EmprendedorService();
class EmprendedorController {
    async getAll(req, res) {
        try {
            const data = await service.getAll();
            return res.json(data);
        }
        catch (error) {
            return res.status(500).json({ message: "Error al obtener emprendedores", error });
        }
    }
    async getById(req, res) {
        try {
            const { id } = req.params;
            const data = await service.getById(Number(id));
            return res.json(data);
        }
        catch (error) {
            return res.status(404).json({ message: error instanceof Error ? error.message : "Emprendedor no encontrado" });
        }
    }
    async create(req, res) {
        try {
            const data = await service.create(req.body);
            return res.status(201).json(data);
        }
        catch (error) {
            return res.status(400).json({ message: "Error al crear emprendedor", error });
        }
    }
    async update(req, res) {
        try {
            const { id } = req.params;
            const data = await service.update(Number(id), req.body);
            return res.json(data);
        }
        catch (error) {
            return res.status(400).json({ message: error instanceof Error ? error.message : "Error al actualizar emprendedor" });
        }
    }
    async delete(req, res) {
        try {
            const { id } = req.params;
            await service.delete(Number(id));
            return res.json({ message: "Emprendedor eliminado" });
        }
        catch (error) {
            return res.status(404).json({ message: error instanceof Error ? error.message : "Error al eliminar emprendedor" });
        }
    }
}
exports.EmprendedorController = EmprendedorController;

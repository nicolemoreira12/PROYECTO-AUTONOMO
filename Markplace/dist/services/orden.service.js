"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdenService = void 0;
const data_source_1 = require("../config/data-source");
const Orden_1 = require("../entities/Orden");
const Usuario_1 = require("../entities/Usuario");
const ordenRepo = data_source_1.AppDataSource.getRepository(Orden_1.Orden);
const usuarioRepo = data_source_1.AppDataSource.getRepository(Usuario_1.Usuario);
class OrdenService {
    async getAll() {
        return await ordenRepo.find({ relations: ["usuario", "detalles", "detalles.producto"] });
    }
    async getById(id) {
        const orden = await ordenRepo.findOne({
            where: { idOrden: id },
            relations: ["usuario", "detalles", "detalles.producto"],
        });
        if (!orden) {
            throw new Error("Orden no encontrada");
        }
        return orden;
    }
    async create(data) {
        // Obtener el ID del usuario
        const usuarioId = data.usuarioIdUsuario || data.usuarioId;
        if (!usuarioId) {
            throw new Error("Se requiere usuarioIdUsuario");
        }
        // Buscar el usuario
        const usuario = await usuarioRepo.findOneBy({ idUsuario: usuarioId });
        if (!usuario) {
            throw new Error("Usuario no encontrado");
        }
        // Crear la orden con la relación correcta
        const nuevaOrden = ordenRepo.create({
            usuario,
            estado: data.estado || "pendiente",
            total: data.total,
            fechaOrden: new Date()
        });
        return await ordenRepo.save(nuevaOrden);
    }
    async update(id, data) {
        const orden = await ordenRepo.findOneBy({ idOrden: id });
        if (!orden) {
            throw new Error("Orden no encontrada");
        }
        ordenRepo.merge(orden, data);
        return await ordenRepo.save(orden);
    }
    async delete(id) {
        const result = await ordenRepo.delete(id);
        if (result.affected === 0) {
            throw new Error("Orden no encontrada");
        }
        return result;
    }
}
exports.OrdenService = OrdenService;

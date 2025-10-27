"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuarioService = void 0;
const data_source_1 = require("../config/data-source");
const Usuario_1 = require("../entities/Usuario");
const usuarioRepo = data_source_1.AppDataSource.getRepository(Usuario_1.Usuario);
class UsuarioService {
    async getAll() {
        return await usuarioRepo.find();
    }
    async getById(id) {
        const usuario = await usuarioRepo.findOne({ where: { idUsuario: id } });
        if (!usuario) {
            throw new Error("Usuario no encontrado");
        }
        return usuario;
    }
    async create(data) {
        const nuevo = usuarioRepo.create(data);
        return await usuarioRepo.save(nuevo);
    }
    async update(id, data) {
        const usuario = await usuarioRepo.findOneBy({ idUsuario: id });
        if (!usuario) {
            throw new Error("Usuario no encontrado");
        }
        usuarioRepo.merge(usuario, data);
        return await usuarioRepo.save(usuario);
    }
    async delete(id) {
        const result = await usuarioRepo.delete(id);
        if (result.affected === 0) {
            throw new Error("Usuario no encontrado");
        }
        return result;
    }
}
exports.UsuarioService = UsuarioService;

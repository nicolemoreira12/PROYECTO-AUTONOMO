"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUsuario = exports.updateUsuario = exports.getUsuarioById = exports.getUsuarios = exports.createUsuario = void 0;
const usuario_service_1 = require("../services/usuario.service");
const usuarioService = new usuario_service_1.UsuarioService();
// Crear usuario
const createUsuario = async (req, res) => {
    try {
        const usuario = await usuarioService.create(req.body);
        res.status(201).json(usuario);
    }
    catch (error) {
        res.status(500).json({ message: "Error al crear usuario", error });
    }
};
exports.createUsuario = createUsuario;
// Obtener todos los usuarios
const getUsuarios = async (_req, res) => {
    try {
        const usuarios = await usuarioService.getAll();
        res.json(usuarios);
    }
    catch (error) {
        res.status(500).json({ message: "Error al obtener usuarios", error });
    }
};
exports.getUsuarios = getUsuarios;
// Obtener un usuario por ID
const getUsuarioById = async (req, res) => {
    try {
        const usuario = await usuarioService.getById(Number(req.params.id));
        res.json(usuario);
    }
    catch (error) {
        res.status(404).json({ message: error instanceof Error ? error.message : "Usuario no encontrado" });
    }
};
exports.getUsuarioById = getUsuarioById;
// Actualizar usuario
const updateUsuario = async (req, res) => {
    try {
        const usuario = await usuarioService.update(Number(req.params.id), req.body);
        res.json(usuario);
    }
    catch (error) {
        res.status(400).json({ message: error instanceof Error ? error.message : "Error al actualizar usuario" });
    }
};
exports.updateUsuario = updateUsuario;
// Eliminar usuario
const deleteUsuario = async (req, res) => {
    try {
        await usuarioService.delete(Number(req.params.id));
        res.json({ message: "Usuario eliminado correctamente" });
    }
    catch (error) {
        res.status(404).json({ message: error instanceof Error ? error.message : "Error al eliminar usuario" });
    }
};
exports.deleteUsuario = deleteUsuario;

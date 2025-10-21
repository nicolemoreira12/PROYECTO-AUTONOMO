import { Request, Response } from "express";
import { UsuarioService } from "../services/usuario.service";

const usuarioService = new UsuarioService();

// Crear usuario
export const createUsuario = async (req: Request, res: Response) => {
  try {
    const usuario = await usuarioService.create(req.body);
    res.status(201).json(usuario);
  } catch (error) {
    res.status(500).json({ message: "Error al crear usuario", error });
  }
};

// Obtener todos los usuarios
export const getUsuarios = async (_req: Request, res: Response) => {
  try {
    const usuarios = await usuarioService.getAll();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios", error });
  }
};

// Obtener un usuario por ID
export const getUsuarioById = async (req: Request, res: Response) => {
  try {
    const usuario = await usuarioService.getById(Number(req.params.id));
    res.json(usuario);
  } catch (error) {
    res.status(404).json({ message: error instanceof Error ? error.message : "Usuario no encontrado" });
  }
};

// Actualizar usuario
export const updateUsuario = async (req: Request, res: Response) => {
  try {
    const usuario = await usuarioService.update(Number(req.params.id), req.body);
    res.json(usuario);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Error al actualizar usuario" });
  }
};

// Eliminar usuario
export const deleteUsuario = async (req: Request, res: Response) => {
  try {
    await usuarioService.delete(Number(req.params.id));
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    res.status(404).json({ message: error instanceof Error ? error.message : "Error al eliminar usuario" });
  }
};

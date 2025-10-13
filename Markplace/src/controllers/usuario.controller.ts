import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Usuario } from "../entities/Usuario";

const usuarioRepo = AppDataSource.getRepository(Usuario);

// Crear usuario
export const createUsuario = async (req: Request, res: Response) => {
  try {
    const usuario = usuarioRepo.create(req.body);
    await usuarioRepo.save(usuario);
    res.status(201).json(usuario);
  } catch (error) {
    res.status(500).json({ message: "Error al crear usuario", error });
  }
};

// Obtener todos los usuarios
export const getUsuarios = async (_req: Request, res: Response) => {
  try {
    const usuarios = await usuarioRepo.find();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios", error });
  }
};

// Obtener un usuario por ID
export const getUsuarioById = async (req: Request, res: Response) => {
  try {
    const usuario = await usuarioRepo.findOneBy({ idUsuario: Number(req.params.id) });
    if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuario", error });
  }
};

// Actualizar usuario
export const updateUsuario = async (req: Request, res: Response) => {
  try {
    const usuario = await usuarioRepo.findOneBy({ idUsuario: Number(req.params.id) });
    if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });

    usuarioRepo.merge(usuario, req.body);
    const result = await usuarioRepo.save(usuario);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar usuario", error });
  }
};

// Eliminar usuario
export const deleteUsuario = async (req: Request, res: Response) => {
  try {
    const result = await usuarioRepo.delete(req.params.id);
    if (result.affected === 0) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar usuario", error });
  }
};

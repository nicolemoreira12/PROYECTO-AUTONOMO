import { Request, Response } from "express";
import { UsuarioService } from "../services/usuario.service";

const usuarioService = new UsuarioService();

// Crear usuario
export const createUsuario = async (req: Request, res: Response) => {
  try {
    console.log('📝 Datos recibidos para crear usuario:', JSON.stringify(req.body, null, 2));
    const usuario = await usuarioService.create(req.body);
    console.log('✅ Usuario creado exitosamente:', { id: usuario.id, email: usuario.email });
    res.status(201).json(usuario);
  } catch (error) {
    console.error('❌ Error al crear usuario:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Detectar error de duplicado
    const isDuplicate = error instanceof Error && 
      (error.message.includes('ya existe') || error.message.includes('duplicate'));
    
    res.status(isDuplicate ? 409 : 500).json({ 
      message: error instanceof Error ? error.message : "Error al crear usuario", 
      error: error instanceof Error ? error.message : String(error)
    });
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

// Obtener un usuario por email
export const getUsuarioByEmail = async (req: Request, res: Response) => {
  try {
    const email = req.params.email;
    console.log('📧 Buscando usuario por email:', email);
    
    const usuario = await usuarioService.getByEmail(email);
    console.log('📧 Resultado de búsqueda:', usuario ? `✅ Encontrado (id: ${usuario.id})` : '❌ No encontrado');
    
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Error al buscar usuario" });
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

import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

const authService = new AuthService();

// Login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email y contraseña son requeridos" });
    }

    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ 
      message: error instanceof Error ? error.message : "Error al iniciar sesión" 
    });
  }
};

// Registro
export const register = async (req: Request, res: Response) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ 
      message: error instanceof Error ? error.message : "Error al registrar usuario" 
    });
  }
};

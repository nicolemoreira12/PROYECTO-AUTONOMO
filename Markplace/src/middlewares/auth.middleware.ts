import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Misma clave secreta que en auth.service.ts
const JWT_SECRET = "mi_clave_secreta_2024";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ message: "Token requerido" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: "Token inválido o expirado" });
  }
};

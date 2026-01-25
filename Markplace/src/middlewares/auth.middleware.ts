import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Usar el mismo secreto que auth-service
const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'default-access-secret';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  
  if (!authHeader) {
    console.log("❌ No se proporcionó token de autorización");
    return res.status(401).json({ message: "Token requerido" });
  }

  const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
  
  if (!token) {
    console.log("❌ Token vacío");
    return res.status(401).json({ message: "Token requerido" });
  }

  try {
    // Verificar con issuer y audience como lo hace auth-service
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'auth-service',
      audience: 'marketplace-app'
    });
    (req as any).user = decoded;
    console.log("✅ Token validado correctamente para usuario:", (decoded as any).userId || (decoded as any).sub);
    next();
  } catch (error) {
    console.error("❌ Error al validar token:", error instanceof Error ? error.message : error);
    console.error("❌ Token recibido:", token.substring(0, 20) + "...");
    res.status(403).json({ message: "Token inválido o expirado" });
  }
};

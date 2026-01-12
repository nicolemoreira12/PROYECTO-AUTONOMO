/**
 * Módulo compartido para validación local de JWT
 * 
 * Este módulo permite a otros microservicios validar tokens localmente
 * sin necesidad de llamar al Auth Service en cada petición.
 * 
 * USO EN OTROS SERVICIOS:
 * 
 * 1. Copiar este archivo al proyecto destino
 * 2. Instalar dependencias: npm install jsonwebtoken
 * 3. Configurar la misma JWT_ACCESS_SECRET que el Auth Service
 * 4. Usar el middleware validateTokenLocally
 * 
 * EJEMPLO:
 * ```typescript
 * import { validateTokenLocally, authMiddlewareLocal } from './shared/jwt-validator';
 * 
 * // En tu app
 * app.get('/protected', authMiddlewareLocal, (req, res) => {
 *   res.json({ user: req.user });
 * });
 * ```
 */

import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// IMPORTANTE: Esta secret debe ser la MISMA que usa el Auth Service
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'mi-clave-secreta-access-super-segura-2024';
const JWT_ISSUER = 'auth-service';
const JWT_AUDIENCE = 'marketplace-app';

export interface TokenPayload extends JwtPayload {
  userId: string;
  email: string;
  role: string;
  jti?: string;
  type: 'access' | 'refresh';
}

/**
 * Valida un access token localmente sin llamar al Auth Service
 */
export const validateTokenLocally = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }) as TokenPayload;

    // Verificar que es un access token
    if (decoded.type !== 'access') {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Extrae el token del header Authorization
 */
export const extractToken = (authHeader: string | undefined): string | null => {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  return parts[1];
};

/**
 * Middleware de autenticación para otros servicios
 * Valida el token localmente sin llamar al Auth Service
 */
export const authMiddlewareLocal = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = extractToken(req.headers.authorization);

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Token de acceso no proporcionado',
    });
    return;
  }

  const decoded = validateTokenLocally(token);

  if (!decoded) {
    res.status(401).json({
      success: false,
      error: 'Token de acceso inválido o expirado',
    });
    return;
  }

  // Agregar usuario al request usando any para evitar conflictos
  (req as any).user = decoded;
  next();
};

/**
 * Middleware para verificar roles específicos
 */
export const requireRoleLocal = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado',
      });
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({
        success: false,
        error: 'No tienes permisos para acceder a este recurso',
      });
      return;
    }

    next();
  };
};

/**
 * Cliente HTTP para validar tokens contra el Auth Service
 * Usar solo cuando se necesita verificar blacklist o información actualizada
 */
export const validateTokenRemote = async (
  token: string,
  authServiceUrl: string = 'http://localhost:4000'
): Promise<{ valid: boolean; user?: any; error?: string }> => {
  try {
    const response = await fetch(`${authServiceUrl}/auth/validate`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return await response.json() as { valid: boolean; user?: any; error?: string };
  } catch (error) {
    console.error('Error validando token remotamente:', error);
    return { valid: false, error: 'Error de conexión con Auth Service' };
  }
};

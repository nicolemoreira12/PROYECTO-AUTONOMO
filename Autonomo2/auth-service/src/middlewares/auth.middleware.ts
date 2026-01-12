import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, extractTokenFromHeader, DecodedToken } from '../utils/jwt.utils';
import { isBlacklisted } from '../config/redis.config';
import { AppDataSource } from '../config/database';
import { RevokedToken } from '../entities/RevokedToken';

// Extender el tipo Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

/**
 * Middleware de autenticación
 * Valida el token localmente (sin llamar al auth service en cada request)
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'No autorizado',
        message: 'Token de acceso no proporcionado',
      });
      return;
    }

    // Verificar el token localmente (sin llamar a otro servicio)
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      res.status(401).json({
        success: false,
        error: 'No autorizado',
        message: 'Token de acceso inválido o expirado',
      });
      return;
    }

    // Verificar si el token está en la blacklist (Redis primero, luego DB)
    const isTokenBlacklisted = decoded.jti ? await checkTokenBlacklist(decoded.jti) : false;
    
    if (isTokenBlacklisted) {
      res.status(401).json({
        success: false,
        error: 'No autorizado',
        message: 'Token revocado',
      });
      return;
    }

    // Agregar usuario al request
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error en authMiddleware:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Verifica si un token está en la blacklist
 */
async function checkTokenBlacklist(jti: string): Promise<boolean> {
  // Primero intentar con Redis (más rápido)
  const redisResult = await isBlacklisted(jti);
  if (redisResult) {
    return true;
  }

  // Si Redis no está disponible o no encontró el token, verificar en BD
  try {
    const revokedTokenRepo = AppDataSource.getRepository(RevokedToken);
    const revokedToken = await revokedTokenRepo.findOne({
      where: { jti },
    });
    return revokedToken !== null;
  } catch (error) {
    console.error('Error verificando blacklist en BD:', error);
    return false;
  }
}

/**
 * Middleware para verificar roles específicos
 */
export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'No autorizado',
        message: 'Usuario no autenticado',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Prohibido',
        message: 'No tienes permisos para acceder a este recurso',
      });
      return;
    }

    next();
  };
};

/**
 * Middleware opcional de autenticación
 * No falla si no hay token, pero si hay uno válido, lo agrega al request
 */
export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (token) {
      const decoded = verifyAccessToken(token);
      if (decoded) {
        const isTokenBlacklisted = decoded.jti ? await checkTokenBlacklist(decoded.jti) : false;
        if (!isTokenBlacklisted) {
          req.user = decoded;
        }
      }
    }

    next();
  } catch (error) {
    next();
  }
};

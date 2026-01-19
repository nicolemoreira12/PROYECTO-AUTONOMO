import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Rate limiter para el endpoint de login
 * Limita los intentos de login para prevenir ataques de fuerza bruta
 */
export const loginRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos por defecto
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '5'), // 5 intentos por ventana
  message: {
    success: false,
    error: 'Demasiados intentos de inicio de sesión. Por favor, intente nuevamente en 15 minutos.',
    retryAfter: 900,
  },
  standardHeaders: true, // Incluir headers RateLimit-*
  legacyHeaders: false, // Deshabilitar headers X-RateLimit-*
  keyGenerator: (req: Request): string => {
    // Usar IP + email para el rate limiting
    const email = req.body?.email || 'unknown';
    return `${req.ip}-${email}`;
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: 'Demasiados intentos de inicio de sesión',
      message: 'Has excedido el límite de intentos. Por favor, espera 15 minutos.',
      retryAfter: 900,
    });
  },
});

/**
 * Rate limiter para el endpoint de registro
 */
export const registerRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos (reducido para desarrollo)
  max: 50, // 50 registros (aumentado para desarrollo)
  message: {
    success: false,
    error: 'Demasiados registros desde esta IP. Por favor, intente nuevamente más tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter general para la API
 */
export const generalRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100, // 100 peticiones por minuto
  message: {
    success: false,
    error: 'Demasiadas peticiones. Por favor, intente nuevamente más tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter para refresh token
 */
export const refreshRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // 10 refreshes por minuto
  message: {
    success: false,
    error: 'Demasiadas solicitudes de renovación de token.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

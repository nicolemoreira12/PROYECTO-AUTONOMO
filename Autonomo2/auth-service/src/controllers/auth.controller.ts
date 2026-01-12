import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { authService } from '../services/auth.service';
import { extractTokenFromHeader } from '../utils/jwt.utils';

export class AuthController {
  /**
   * POST /auth/register
   * Registrar un nuevo usuario
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      // Validar errores de express-validator
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors.array(),
        });
        return;
      }

      const { firstName, lastName, email, password, phone, role } = req.body;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await authService.register(
        { firstName, lastName, email, password, phone, role },
        ipAddress,
        userAgent
      );

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error en register controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  /**
   * POST /auth/login
   * Iniciar sesión
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors.array(),
        });
        return;
      }

      const { email, password } = req.body;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await authService.login(
        { email, password },
        ipAddress,
        userAgent
      );

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(401).json(result);
      }
    } catch (error) {
      console.error('Error en login controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  /**
   * POST /auth/logout
   * Cerrar sesión (revocar tokens)
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      const accessToken = extractTokenFromHeader(req.headers.authorization);
      const { refreshToken } = req.body;

      if (!accessToken) {
        res.status(400).json({
          success: false,
          message: 'Token de acceso requerido',
        });
        return;
      }

      const result = await authService.logout(accessToken, refreshToken);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error en logout controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  /**
   * POST /auth/refresh
   * Renovar tokens usando refresh token
   */
  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors.array(),
        });
        return;
      }

      const { refreshToken } = req.body;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await authService.refresh(refreshToken, ipAddress, userAgent);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(401).json(result);
      }
    } catch (error) {
      console.error('Error en refresh controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  /**
   * GET /auth/me
   * Obtener información del usuario autenticado
   */
  async getMe(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'No autorizado',
        });
        return;
      }

      const result = await authService.getMe(req.user.userId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error('Error en getMe controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  /**
   * GET /auth/validate
   * Endpoint interno para validar tokens desde otros servicios
   */
  async validate(req: Request, res: Response): Promise<void> {
    try {
      const token = extractTokenFromHeader(req.headers.authorization);

      if (!token) {
        res.status(400).json({
          valid: false,
          error: 'Token no proporcionado',
        });
        return;
      }

      const result = await authService.validateToken(token);
      
      if (result.valid) {
        res.status(200).json(result);
      } else {
        res.status(401).json(result);
      }
    } catch (error) {
      console.error('Error en validate controller:', error);
      res.status(500).json({
        valid: false,
        error: 'Error interno del servidor',
      });
    }
  }

  /**
   * POST /auth/revoke-all
   * Revocar todas las sesiones de un usuario (admin o el propio usuario)
   */
  async revokeAllSessions(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'No autorizado',
        });
        return;
      }

      // Solo puede revocar sus propias sesiones o un admin las de cualquiera
      const targetUserId = req.body.userId || req.user.userId;
      
      if (targetUserId !== req.user.userId && req.user.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para realizar esta acción',
        });
        return;
      }

      await authService.revokeAllUserTokens(targetUserId);

      res.status(200).json({
        success: true,
        message: 'Todas las sesiones han sido revocadas',
      });
    } catch (error) {
      console.error('Error en revokeAllSessions controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }
}

export const authController = new AuthController();

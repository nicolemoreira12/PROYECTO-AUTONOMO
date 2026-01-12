import { Repository, LessThan, MoreThan } from 'typeorm';
import { AppDataSource } from '../config/database';
import { addToBlacklist } from '../config/redis.config';
import { getExpirationInSeconds, jwtConfig } from '../config/jwt.config';
import { User, UserRole, UserStatus } from '../entities/User';
import { RefreshToken } from '../entities/RefreshToken';
import { RevokedToken, TokenType } from '../entities/RevokedToken';
import {
  generateTokenPair,
  verifyRefreshToken,
  hashPassword,
  comparePassword,
  validatePasswordStrength,
  TokenPair,
  getTokenRemainingTime,
  decodeToken,
} from '../utils';

// DTOs
export interface RegisterDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role?: UserRole;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: Partial<User>;
    tokens: {
      accessToken: string;
      refreshToken: string;
      accessExpiresAt: Date;
      refreshExpiresAt: Date;
    };
  };
  error?: string;
}

export interface RefreshResponse {
  success: boolean;
  message: string;
  data?: {
    accessToken: string;
    refreshToken: string;
    accessExpiresAt: Date;
    refreshExpiresAt: Date;
  };
  error?: string;
}

export class AuthService {
  private userRepository: Repository<User>;
  private refreshTokenRepository: Repository<RefreshToken>;
  private revokedTokenRepository: Repository<RevokedToken>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
    this.revokedTokenRepository = AppDataSource.getRepository(RevokedToken);
  }

  /**
   * Registrar un nuevo usuario
   */
  async register(data: RegisterDTO, ipAddress?: string, userAgent?: string): Promise<AuthResponse> {
    try {
      // Validar fortaleza de contraseña
      const passwordValidation = validatePasswordStrength(data.password);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          message: 'Contraseña débil',
          error: passwordValidation.errors.join('. '),
        };
      }

      // Verificar si el email ya existe
      const existingUser = await this.userRepository.findOne({
        where: { email: data.email.toLowerCase() },
      });

      if (existingUser) {
        return {
          success: false,
          message: 'Error de registro',
          error: 'El email ya está registrado',
        };
      }

      // Hashear contraseña
      const hashedPassword = await hashPassword(data.password);

      // Crear usuario
      const user = this.userRepository.create({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email.toLowerCase(),
        password: hashedPassword,
        phone: data.phone,
        role: data.role || UserRole.USER,
        status: UserStatus.ACTIVE,
      });

      await this.userRepository.save(user);

      // Generar tokens
      const tokenPair = generateTokenPair(user.id, user.email, user.role);

      // Guardar refresh token
      await this.saveRefreshToken(user.id, tokenPair, ipAddress, userAgent);

      // Retornar respuesta
      return {
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          user: this.sanitizeUser(user),
          tokens: {
            accessToken: tokenPair.accessToken,
            refreshToken: tokenPair.refreshToken,
            accessExpiresAt: tokenPair.accessExpiresAt,
            refreshExpiresAt: tokenPair.refreshExpiresAt,
          },
        },
      };
    } catch (error) {
      console.error('Error en registro:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'No se pudo completar el registro',
      };
    }
  }

  /**
   * Iniciar sesión
   */
  async login(data: LoginDTO, ipAddress?: string, userAgent?: string): Promise<AuthResponse> {
    try {
      // Buscar usuario
      const user = await this.userRepository.findOne({
        where: { email: data.email.toLowerCase() },
      });

      if (!user) {
        return {
          success: false,
          message: 'Credenciales inválidas',
          error: 'Email o contraseña incorrectos',
        };
      }

      // Verificar si la cuenta está bloqueada
      if (user.isLocked()) {
        const remainingTime = Math.ceil(
          (user.lockedUntil!.getTime() - Date.now()) / 60000
        );
        return {
          success: false,
          message: 'Cuenta bloqueada',
          error: `Tu cuenta está bloqueada. Intenta nuevamente en ${remainingTime} minutos.`,
        };
      }

      // Verificar si la cuenta está activa
      if (user.status !== UserStatus.ACTIVE) {
        return {
          success: false,
          message: 'Cuenta inactiva',
          error: 'Tu cuenta no está activa. Contacta al administrador.',
        };
      }

      // Verificar contraseña
      const isPasswordValid = await comparePassword(data.password, user.password);

      if (!isPasswordValid) {
        // Incrementar intentos fallidos
        await this.handleFailedLogin(user);
        return {
          success: false,
          message: 'Credenciales inválidas',
          error: 'Email o contraseña incorrectos',
        };
      }

      // Login exitoso - resetear intentos fallidos
      user.failedLoginAttempts = 0;
      user.lockedUntil = undefined;
      user.lastLoginAt = new Date();
      await this.userRepository.save(user);

      // Generar tokens
      const tokenPair = generateTokenPair(user.id, user.email, user.role);

      // Guardar refresh token
      await this.saveRefreshToken(user.id, tokenPair, ipAddress, userAgent);

      return {
        success: true,
        message: 'Inicio de sesión exitoso',
        data: {
          user: this.sanitizeUser(user),
          tokens: {
            accessToken: tokenPair.accessToken,
            refreshToken: tokenPair.refreshToken,
            accessExpiresAt: tokenPair.accessExpiresAt,
            refreshExpiresAt: tokenPair.refreshExpiresAt,
          },
        },
      };
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'No se pudo iniciar sesión',
      };
    }
  }

  /**
   * Cerrar sesión (revocar tokens)
   */
  async logout(accessToken: string, refreshToken?: string): Promise<{ success: boolean; message: string }> {
    try {
      // Decodificar access token para obtener jti
      const decodedAccess = decodeToken(accessToken);
      
      if (decodedAccess && decodedAccess.jti) {
        // Agregar access token a blacklist
        const remainingTime = getTokenRemainingTime(decodedAccess);
        if (remainingTime > 0) {
          await this.revokeToken(decodedAccess.jti, TokenType.ACCESS, remainingTime, decodedAccess.userId);
        }
      }

      // Revocar refresh token si se proporciona
      if (refreshToken) {
        const decodedRefresh = decodeToken(refreshToken);
        if (decodedRefresh && decodedRefresh.jti) {
          // Marcar como revocado en BD
          await this.refreshTokenRepository.update(
            { token: refreshToken },
            { isRevoked: true, revokedAt: new Date() }
          );

          const remainingTime = getTokenRemainingTime(decodedRefresh);
          if (remainingTime > 0) {
            await this.revokeToken(decodedRefresh.jti, TokenType.REFRESH, remainingTime, decodedRefresh.userId);
          }
        }
      }

      return {
        success: true,
        message: 'Sesión cerrada exitosamente',
      };
    } catch (error) {
      console.error('Error en logout:', error);
      return {
        success: false,
        message: 'Error al cerrar sesión',
      };
    }
  }

  /**
   * Renovar tokens usando refresh token
   */
  async refresh(refreshToken: string, ipAddress?: string, userAgent?: string): Promise<RefreshResponse> {
    try {
      // Verificar refresh token
      const decoded = verifyRefreshToken(refreshToken);

      if (!decoded) {
        return {
          success: false,
          message: 'Token inválido',
          error: 'El refresh token es inválido o ha expirado',
        };
      }

      // Buscar el refresh token en BD
      const storedToken = await this.refreshTokenRepository.findOne({
        where: { token: refreshToken },
        relations: ['user'],
      });

      if (!storedToken || !storedToken.isValid()) {
        return {
          success: false,
          message: 'Token inválido',
          error: 'El refresh token no es válido o ha sido revocado',
        };
      }

      // Verificar que el usuario existe y está activo
      const user = storedToken.user;
      if (!user || user.status !== UserStatus.ACTIVE) {
        return {
          success: false,
          message: 'Usuario no válido',
          error: 'El usuario no existe o no está activo',
        };
      }

      // Revocar el refresh token actual (rotación de tokens)
      storedToken.isRevoked = true;
      storedToken.revokedAt = new Date();
      await this.refreshTokenRepository.save(storedToken);

      // Generar nuevos tokens
      const newTokenPair = generateTokenPair(user.id, user.email, user.role);

      // Guardar nuevo refresh token
      await this.saveRefreshToken(user.id, newTokenPair, ipAddress, userAgent);

      return {
        success: true,
        message: 'Tokens renovados exitosamente',
        data: {
          accessToken: newTokenPair.accessToken,
          refreshToken: newTokenPair.refreshToken,
          accessExpiresAt: newTokenPair.accessExpiresAt,
          refreshExpiresAt: newTokenPair.refreshExpiresAt,
        },
      };
    } catch (error) {
      console.error('Error en refresh:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'No se pudieron renovar los tokens',
      };
    }
  }

  /**
   * Obtener información del usuario actual
   */
  async getMe(userId: string): Promise<{ success: boolean; data?: Partial<User>; error?: string }> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        return {
          success: false,
          error: 'Usuario no encontrado',
        };
      }

      return {
        success: true,
        data: this.sanitizeUser(user),
      };
    } catch (error) {
      console.error('Error en getMe:', error);
      return {
        success: false,
        error: 'Error al obtener información del usuario',
      };
    }
  }

  /**
   * Validar token (endpoint interno para otros servicios)
   */
  async validateToken(token: string): Promise<{
    valid: boolean;
    user?: {
      id: string;
      email: string;
      role: string;
    };
    error?: string;
  }> {
    try {
      const decoded = decodeToken(token);
      
      if (!decoded || !decoded.jti) {
        return { valid: false, error: 'Token inválido' };
      }

      // Verificar blacklist
      const isRevoked = await this.isTokenRevoked(decoded.jti);
      if (isRevoked) {
        return { valid: false, error: 'Token revocado' };
      }

      return {
        valid: true,
        user: {
          id: decoded.userId,
          email: decoded.email,
          role: decoded.role,
        },
      };
    } catch (error) {
      return { valid: false, error: 'Error de validación' };
    }
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Guardar refresh token en BD
   */
  private async saveRefreshToken(
    userId: string,
    tokenPair: TokenPair,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const refreshTokenEntity = this.refreshTokenRepository.create({
      token: tokenPair.refreshToken,
      userId,
      expiresAt: tokenPair.refreshExpiresAt,
      ipAddress,
      userAgent,
    });

    await this.refreshTokenRepository.save(refreshTokenEntity);
  }

  /**
   * Revocar un token (agregar a blacklist)
   */
  private async revokeToken(
    jti: string,
    type: TokenType,
    expiresInSeconds: number,
    userId?: string
  ): Promise<void> {
    // Agregar a Redis
    await addToBlacklist(jti, expiresInSeconds);

    // También guardar en BD como respaldo
    const revokedToken = this.revokedTokenRepository.create({
      jti,
      tokenType: type,
      userId,
      expiresAt: new Date(Date.now() + expiresInSeconds * 1000),
    });

    await this.revokedTokenRepository.save(revokedToken);
  }

  /**
   * Verificar si un token está revocado
   */
  private async isTokenRevoked(jti: string): Promise<boolean> {
    const revokedToken = await this.revokedTokenRepository.findOne({
      where: { jti },
    });
    return revokedToken !== null;
  }

  /**
   * Manejar intento de login fallido
   */
  private async handleFailedLogin(user: User): Promise<void> {
    user.failedLoginAttempts += 1;

    // Bloquear cuenta después de 5 intentos fallidos
    if (user.failedLoginAttempts >= 5) {
      user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
    }

    await this.userRepository.save(user);
  }

  /**
   * Sanitizar datos del usuario (remover información sensible)
   */
  private sanitizeUser(user: User): Partial<User> {
    const { password, failedLoginAttempts, lockedUntil, ...sanitized } = user;
    return sanitized;
  }

  /**
   * Limpiar tokens expirados (para ejecutar periódicamente)
   */
  async cleanupExpiredTokens(): Promise<void> {
    const now = new Date();

    // Limpiar refresh tokens expirados
    await this.refreshTokenRepository.delete({
      expiresAt: LessThan(now),
    });

    // Limpiar tokens revocados expirados
    await this.revokedTokenRepository.delete({
      expiresAt: LessThan(now),
    });

    console.log('✅ Tokens expirados limpiados');
  }

  /**
   * Revocar todos los tokens de un usuario (logout de todas las sesiones)
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true, revokedAt: new Date() }
    );
  }
}

export const authService = new AuthService();

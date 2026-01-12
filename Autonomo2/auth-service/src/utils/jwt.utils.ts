import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { jwtConfig, getExpirationInSeconds } from '../config/jwt.config';
import { UserRole } from '../entities/User';

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  jti?: string; // JWT ID único para revocación
  type: 'access' | 'refresh';
}

export interface DecodedToken extends JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  jti?: string;
  type: 'access' | 'refresh';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenJti: string;
  refreshTokenJti: string;
  accessExpiresAt: Date;
  refreshExpiresAt: Date;
}

/**
 * Genera un par de tokens (access + refresh)
 */
export const generateTokenPair = (
  userId: string,
  email: string,
  role: UserRole
): TokenPair => {
  const accessJti = uuidv4();
  const refreshJti = uuidv4();

  const accessExpiresInSeconds = getExpirationInSeconds(jwtConfig.accessExpiration);
  const refreshExpiresInSeconds = getExpirationInSeconds(jwtConfig.refreshExpiration);

  const accessPayload: TokenPayload = {
    userId,
    email,
    role,
    jti: accessJti,
    type: 'access',
  };

  const refreshPayload: TokenPayload = {
    userId,
    email,
    role,
    jti: refreshJti,
    type: 'refresh',
  };

  const accessOptions: SignOptions = {
    expiresIn: accessExpiresInSeconds,
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
  };

  const refreshOptions: SignOptions = {
    expiresIn: refreshExpiresInSeconds,
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
  };

  const accessToken = jwt.sign(accessPayload, jwtConfig.accessSecret, accessOptions);
  const refreshToken = jwt.sign(refreshPayload, jwtConfig.refreshSecret, refreshOptions);

  return {
    accessToken,
    refreshToken,
    accessTokenJti: accessJti,
    refreshTokenJti: refreshJti,
    accessExpiresAt: new Date(Date.now() + accessExpiresInSeconds * 1000),
    refreshExpiresAt: new Date(Date.now() + refreshExpiresInSeconds * 1000),
  };
};

/**
 * Verifica y decodifica un access token
 */
export const verifyAccessToken = (token: string): DecodedToken | null => {
  try {
    const decoded = jwt.verify(token, jwtConfig.accessSecret, {
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
    }) as DecodedToken;

    if (decoded.type !== 'access') {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Verifica y decodifica un refresh token
 */
export const verifyRefreshToken = (token: string): DecodedToken | null => {
  try {
    const decoded = jwt.verify(token, jwtConfig.refreshSecret, {
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
    }) as DecodedToken;

    if (decoded.type !== 'refresh') {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Decodifica un token sin verificar (útil para extraer jti de tokens expirados)
 */
export const decodeToken = (token: string): DecodedToken | null => {
  try {
    return jwt.decode(token) as DecodedToken;
  } catch (error) {
    return null;
  }
};

/**
 * Extrae el token del header Authorization
 */
export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

/**
 * Calcula el tiempo restante de expiración en segundos
 */
export const getTokenRemainingTime = (decoded: DecodedToken): number => {
  if (!decoded.exp) {
    return 0;
  }
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, decoded.exp - now);
};

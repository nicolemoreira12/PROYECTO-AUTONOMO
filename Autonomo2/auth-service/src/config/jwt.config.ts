import dotenv from 'dotenv';

dotenv.config();

export interface JWTConfig {
  accessSecret: string;
  refreshSecret: string;
  accessExpiration: string;
  refreshExpiration: string;
  issuer: string;
  audience: string;
}

export const jwtConfig: JWTConfig = {
  accessSecret: process.env.JWT_ACCESS_SECRET || 'default-access-secret',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
  accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
  refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  issuer: 'auth-service',
  audience: 'marketplace-app',
};

// Función para parsear tiempo de expiración a milisegundos
export const parseExpiration = (expiration: string): number => {
  const match = expiration.match(/^(\d+)([smhd])$/);
  if (!match) {
    return 15 * 60 * 1000; // Default: 15 minutos
  }

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      return 15 * 60 * 1000;
  }
};

// Obtener tiempo de expiración en segundos (para JWT)
export const getExpirationInSeconds = (expiration: string): number => {
  return Math.floor(parseExpiration(expiration) / 1000);
};

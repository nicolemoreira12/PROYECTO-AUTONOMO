import * as crypto from 'crypto';

/**
 * Genera una firma HMAC-SHA256 para un payload.
 * @param secret El secreto compartido para la firma.
 * @param payload El cuerpo de la solicitud (como string).
 * @returns La firma generada en formato hexadecimal.
 */
export function generateHmacSignature(secret: string, payload: string): string {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload, 'utf8');
  return hmac.digest('hex');
}

/**
 * Verifica si una firma HMAC-SHA256 es válida.
 * @param secret El secreto compartido.
 * @param payload El cuerpo de la solicitud (como string).
 * @param signature La firma recibida (ej. de un header).
 * @returns `true` si la firma es válida, `false` en caso contrario.
 */
export function verifyHmacSignature(secret: string, payload: string, signature: string): boolean {
  if (!signature) {
    return false;
  }

  const expectedSignature = generateHmacSignature(secret, payload);
  
  // Comparación segura para prevenir ataques de temporización
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  } catch {
    return false;
  }
}

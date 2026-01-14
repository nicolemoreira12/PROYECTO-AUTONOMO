import { Request, Response, NextFunction } from 'express';
import { PartnerService } from '../core/services/partner.service';
import { verifyHmacSignature } from '../utils/security.util';

// Extender el tipo Request para incluir rawBody
interface RequestWithRawBody extends Request {
  rawBody?: string;
}

export const createHmacVerificationMiddleware = (partnerService: PartnerService) => {
  return async (req: RequestWithRawBody, res: Response, next: NextFunction) => {
    try {
      const signature = req.header('X-Webhook-Signature');
      const partnerId = req.params.partnerId;

      if (!signature) {
        return res.status(401).json({ success: false, message: 'Firma del webhook no proporcionada.' });
      }

      if (!partnerId) {
        return res.status(400).json({ success: false, message: 'ID del partner no proporcionado en la URL.' });
      }
      
      const partner = await partnerService.getPartnerById(partnerId);

      if (!partner) {
        return res.status(404).json({ success: false, message: 'Partner no encontrado.' });
      }

      const { hmacSecret } = partner;
      const payload = req.rawBody;

      if (!payload) {
        return res.status(400).json({ success: false, message: 'Cuerpo de la solicitud no disponible para verificación.' });
      }

      const isValid = verifyHmacSignature(hmacSecret, payload, signature);

      if (!isValid) {
        return res.status(401).json({ success: false, message: 'Firma del webhook inválida.' });
      }

      // La firma es válida, continuar con el siguiente manejador
      next();
    } catch (error) {
      console.error('[HmacMiddleware] Error al verificar la firma:', error);
      res.status(500).json({ success: false, message: 'Error interno al verificar la firma del webhook.' });
    }
  };
};

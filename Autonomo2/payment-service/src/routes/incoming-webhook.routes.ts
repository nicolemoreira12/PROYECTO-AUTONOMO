import { Router } from 'express';
import { IncomingWebhookController } from '../controllers/incoming-webhook.controller';
import { createHmacVerificationMiddleware } from '../middlewares/hmac.middleware';
import { PartnerService } from '../core/services/partner.service';

export const createIncomingWebhookRoutes = (partnerService: PartnerService): Router => {
  const router = Router();
  const incomingWebhookController = new IncomingWebhookController();
  const hmacMiddleware = createHmacVerificationMiddleware(partnerService);

  // Aplicar el middleware HMAC solo a esta ruta
  router.post('/incoming/:partnerId', hmacMiddleware, incomingWebhookController.processWebhook.bind(incomingWebhookController));

  return router;
};

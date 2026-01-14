import { Request, Response } from 'express';

export class IncomingWebhookController {
  /**
   * POST /webhooks/incoming/:partnerId
   * Procesa un webhook entrante verificado de un partner.
   */
  async processWebhook(req: Request, res: Response): Promise<void> {
    try {
      const event = req.body;
      const partnerId = req.params.partnerId;

      console.log(`[IncomingWebhookController] Webhook verificado recibido del partner ${partnerId}:`);
      console.log(`  - Tipo de Evento: ${event.eventType}`);
      console.log(`  - Payload:`, event.payload);

      // Aquí se implementaría la lógica de negocio para reaccionar al evento.
      // Por ejemplo, si es un 'tour.purchased', se podría actualizar una orden.

      res.status(200).json({ success: true, message: 'Webhook procesado exitosamente.' });
    } catch (error) {
      console.error('[IncomingWebhookController] Error al procesar el webhook:', error);
      res.status(500).json({ success: false, message: 'Error interno al procesar el webhook.' });
    }
  }
}

import axios from 'axios';
import { generateHmacSignature } from '../../utils/security.util';
import { PartnerService } from './partner.service';

export interface WebhookEvent {
  eventId: string;
  eventType: string; // ej. 'payment.succeeded'
  timestamp: Date;
  payload: any;
}

export class WebhookService {
  constructor(private partnerService: PartnerService) {}

  /**
   * Envía un evento a todos los partners suscritos.
   * @param eventType El tipo de evento (ej. 'payment.succeeded').
   * @param data El payload del evento.
   */
  async dispatchEvent(eventType: string, data: any): Promise<void> {
    const partners = await this.partnerService.getSubscribedPartners(eventType);

    if (partners.length === 0) {
      console.log(`[WebhookService] No hay partners suscritos al evento '${eventType}'.`);
      return;
    }

    console.log(`[WebhookService] Enviando evento '${eventType}' a ${partners.length} partner(s).`);

    const event: WebhookEvent = {
      eventId: `evt_${Date.now()}`,
      eventType,
      timestamp: new Date(),
      payload: data,
    };

    const payloadString = JSON.stringify(event);

    for (const partner of partners) {
      const signature = generateHmacSignature(partner.hmacSecret, payloadString);

      try {
        await axios.post(partner.webhookUrl, payloadString, {
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature,
          },
          timeout: 5000, // 5 segundos de timeout
        });
        console.log(`[WebhookService] Evento enviado exitosamente a ${partner.name}.`);
      } catch (error) {
        console.error(`[WebhookService] Error al enviar evento a ${partner.name}:`, error);
        // Aquí se podría implementar una lógica de reintentos
      }
    }
  }
}

import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { RegisterPartnerDTO, PartnerResponseDTO } from '../dtos/partner.dto';

interface Partner extends PartnerResponseDTO {}

export class PartnerService {
  // Usar una base de datos en un entorno de producción
  private partners: Map<string, Partner> = new Map();

  /**
   * Registra un nuevo partner y genera un secreto HMAC.
   */
  async registerPartner(data: RegisterPartnerDTO): Promise<PartnerResponseDTO> {
    if (!data.partnerName || !data.webhookUrl || !data.subscribedEvents) {
      throw new Error('Faltan datos requeridos para registrar el partner.');
    }

    const partnerId = uuidv4();
    const hmacSecret = crypto.randomBytes(32).toString('hex');

    const newPartner: Partner = {
      partnerId,
      partnerName: data.partnerName,
      webhookUrl: data.webhookUrl,
      subscribedEvents: data.subscribedEvents,
      hmacSecret, // Este secreto solo se debe mostrar una vez
      createdAt: new Date(),
    };

    this.partners.set(partnerId, newPartner);

    console.log(`[PartnerService] Nuevo partner registrado: ${newPartner.partnerName} (ID: ${partnerId})`);

    return newPartner;
  }

  /**
   * Obtiene todos los partners suscritos a un evento específico.
   */
  async getSubscribedPartners(eventType: string): Promise<Partner[]> {
    const subscribed: Partner[] = [];
    for (const partner of this.partners.values()) {
      if (partner.subscribedEvents.includes(eventType)) {
        subscribed.push(partner);
      }
    }
    return subscribed;
  }

  /**
   * Obtiene la información de un partner por su ID.
   */
  async getPartnerById(partnerId: string): Promise<Partner | undefined> {
    return this.partners.get(partnerId);
  }
}

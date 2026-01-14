import { Repository, ArrayContains } from 'typeorm';
import crypto from 'crypto';
import { AppDataSource } from '../../config/database';
import { Partner } from '../../entities/partner.entity';
import { RegisterPartnerDTO, PartnerResponseDTO } from '../dtos/partner.dto';

export class PartnerService {
  private partnerRepository: Repository<Partner>;

  constructor() {
    this.partnerRepository = AppDataSource.getRepository(Partner);
  }

  /**
   * Registra un nuevo partner y genera un secreto HMAC.
   */
  async registerPartner(data: RegisterPartnerDTO): Promise<PartnerResponseDTO> {
    if (!data.partnerName || !data.webhookUrl || !data.subscribedEvents) {
      throw new Error('Faltan datos requeridos para registrar el partner.');
    }

    const hmacSecret = crypto.randomBytes(32).toString('hex');

    const newPartner = this.partnerRepository.create({
      name: data.partnerName,
      webhookUrl: data.webhookUrl,
      subscribedEvents: data.subscribedEvents,
      hmacSecret,
    });

    await this.partnerRepository.save(newPartner);

    console.log(`[PartnerService] Nuevo partner registrado: ${newPartner.name} (ID: ${newPartner.id})`);

    return {
      partnerId: newPartner.id,
      partnerName: newPartner.name,
      webhookUrl: newPartner.webhookUrl,
      subscribedEvents: newPartner.subscribedEvents,
      hmacSecret: newPartner.hmacSecret, // Este secreto solo se debe mostrar una vez
      createdAt: newPartner.createdAt,
    };
  }

  /**
   * Obtiene todos los partners suscritos a un evento específico.
   */
  async getSubscribedPartners(eventType: string): Promise<Partner[]> {
    return this.partnerRepository.find({
      where: {
        subscribedEvents: ArrayContains([eventType]),
      },
    });
  }

  /**
   * Obtiene la información de un partner por su ID.
   */
  async getPartnerById(partnerId: string): Promise<Partner | null> {
    return this.partnerRepository.findOneBy({ id: partnerId });
  }
}

import { Request, Response } from 'express';
import { PartnerService } from '../core/services/partner.service';

export class PartnerController {
  constructor(private partnerService: PartnerService) {}

  /**
   * POST /partners/register
   * Registra un nuevo partner.
   */
  async registerPartner(req: Request, res: Response): Promise<void> {
    try {
      const partnerData = req.body;

      if (!partnerData.partnerName || !partnerData.webhookUrl || !partnerData.subscribedEvents) {
        res.status(400).json({ success: false, message: 'Faltan datos requeridos para el registro.' });
        return;
      }

      const result = await this.partnerService.registerPartner(partnerData);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      console.error('[PartnerController] Error al registrar el partner:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ success: false, message: 'Error interno al registrar el partner.', error: errorMessage });
    }
  }
}

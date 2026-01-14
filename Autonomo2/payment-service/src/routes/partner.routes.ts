import { Router } from 'express';
import { PartnerController } from '../controllers/partner.controller';
import { PartnerService } from '../core/services/partner.service';

export const createPartnerRoutes = (partnerService: PartnerService): Router => {
  const router = Router();
  const partnerController = new PartnerController(partnerService);

  router.post('/register', partnerController.registerPartner.bind(partnerController));

  return router;
};

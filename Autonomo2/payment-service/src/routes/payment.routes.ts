import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { PaymentService } from '../core/services/payment.service';

export const createPaymentRoutes = (paymentService: PaymentService): Router => {
  const router = Router();
  const paymentController = new PaymentController(paymentService);

  router.post('/create', paymentController.createPayment.bind(paymentController));
  router.post('/webhooks/:provider', paymentController.handleWebhook.bind(paymentController));

  return router;
};

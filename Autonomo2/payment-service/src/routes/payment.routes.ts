import { Router, Request, Response } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { PaymentService } from '../core/services/payment.service';

export const createPaymentRoutes = (paymentService: PaymentService): Router => {
  const router = Router();
  const paymentController = new PaymentController(paymentService);

  // Health check endpoint
  router.get('/health', (req: Request, res: Response) => {
    const stripeConfigured = !!process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_SECRET_KEY !== 'sk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

    res.status(200).json({
      status: 'ok',
      service: 'payment-service',
      stripe: stripeConfigured ? 'configured' : 'not configured',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ? 'configured' : 'not configured',
      timestamp: new Date().toISOString()
    });
  });

  // Crear pago (Checkout Session o mock)
  router.post('/create', paymentController.createPayment.bind(paymentController));

  // Crear PaymentIntent (para Stripe Elements)
  router.post('/create-intent', paymentController.createPaymentIntent.bind(paymentController));

  // Obtener estado de un pago
  router.get('/:paymentId/status', paymentController.getPaymentStatus.bind(paymentController));

  // Crear reembolso
  router.post('/refund', paymentController.createRefund.bind(paymentController));

  // Webhooks de las pasarelas de pago
  router.post('/webhooks/:provider', paymentController.handleWebhook.bind(paymentController));

  return router;
};

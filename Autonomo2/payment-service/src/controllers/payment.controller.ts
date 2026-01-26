import { Request, Response } from 'express';
import { PaymentService } from '../core/services/payment.service';

// Extender el tipo Request para incluir rawBody
interface RequestWithRawBody extends Request {
  rawBody?: string;
}

export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  /**
   * POST /payments/create
   * Crea una nueva solicitud de pago.
   */
  async createPayment(req: Request, res: Response): Promise<void> {
    try {
      const { provider, ...paymentData } = req.body;
      
      if (!paymentData.amount || !paymentData.currency || !paymentData.orderId) {
        res.status(400).json({ success: false, message: 'Faltan datos requeridos para el pago.' });
        return;
      }

      const result = await this.paymentService.createPayment(paymentData, provider);
      res.status(201).json(result);
    } catch (error) {
      console.error('[PaymentController] Error al crear el pago:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ success: false, message: 'Error interno al procesar el pago.', error: errorMessage });
    }
  }

  /**
   * POST /payments/create-intent
   * Crea un PaymentIntent de Stripe (para usar con Stripe Elements)
   */
  async createPaymentIntent(req: Request, res: Response): Promise<void> {
    try {
      const { ...paymentData } = req.body;
      
      if (!paymentData.amount || !paymentData.currency || !paymentData.orderId) {
        res.status(400).json({ success: false, message: 'Faltan datos requeridos para el pago.' });
        return;
      }

      const stripeAdapter = this.paymentService.getStripeAdapter();
      if (!stripeAdapter) {
        res.status(503).json({ success: false, message: 'Stripe no está configurado.' });
        return;
      }

      const result = await stripeAdapter.createPaymentIntent(paymentData);
      res.status(201).json(result);
    } catch (error) {
      console.error('[PaymentController] Error al crear PaymentIntent:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ success: false, message: 'Error interno al crear PaymentIntent.', error: errorMessage });
    }
  }

  /**
   * GET /payments/:paymentId/status
   * Obtiene el estado de un pago
   */
  async getPaymentStatus(req: Request, res: Response): Promise<void> {
    try {
      const { paymentId } = req.params;
      const { provider } = req.query;

      const result = await this.paymentService.getPaymentStatus(paymentId, provider as string);
      res.status(200).json(result);
    } catch (error) {
      console.error('[PaymentController] Error al obtener estado del pago:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ success: false, message: 'Error al obtener estado del pago.', error: errorMessage });
    }
  }

  /**
   * POST /payments/refund
   * Crea un reembolso para un pago de Stripe
   */
  async createRefund(req: Request, res: Response): Promise<void> {
    try {
      const { paymentIntentId, amount } = req.body;

      if (!paymentIntentId) {
        res.status(400).json({ success: false, message: 'Se requiere el paymentIntentId.' });
        return;
      }

      const stripeAdapter = this.paymentService.getStripeAdapter();
      if (!stripeAdapter) {
        res.status(503).json({ success: false, message: 'Stripe no está configurado.' });
        return;
      }

      const result = await stripeAdapter.createRefund(paymentIntentId, amount);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('[PaymentController] Error al crear reembolso:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ success: false, message: 'Error al procesar el reembolso.', error: errorMessage });
    }
  }

  /**
   * POST /webhooks/:provider
   * Maneja los webhooks entrantes de las pasarelas de pago.
   * IMPORTANTE: Para Stripe, requiere el cuerpo sin procesar (rawBody)
   */
  async handleWebhook(req: RequestWithRawBody, res: Response): Promise<void> {
    try {
      const provider = req.params.provider;
      const signature = req.headers['stripe-signature'] as string | undefined;

      // Para Stripe, usar el rawBody para verificar la firma
      let payload: any;
      if (provider === 'stripe' && req.rawBody) {
        payload = req.rawBody;
      } else {
        payload = req.body;
      }

      const result = await this.paymentService.handleWebhook(provider, payload, signature);
      
      if (result.received) {
        res.status(200).json({ status: 'received' });
      } else {
        res.status(400).json({ status: 'failed', message: result.error });
      }
    } catch (error) {
      console.error('[PaymentController] Error al manejar el webhook:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ success: false, message: 'Error interno al procesar el webhook.', error: errorMessage });
    }
  }
}

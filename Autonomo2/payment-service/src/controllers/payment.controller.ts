import { Request, Response } from 'express';
import { PaymentService } from '../core/services/payment.service';

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
   * POST /webhooks/:provider
   * Maneja los webhooks entrantes de las pasarelas de pago.
   */
  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const provider = req.params.provider;
      const signature = req.headers['stripe-signature'] as string | undefined; // Específico para Stripe, adaptar si es necesario

      const result = await this.paymentService.handleWebhook(provider, req.body, signature);
      
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

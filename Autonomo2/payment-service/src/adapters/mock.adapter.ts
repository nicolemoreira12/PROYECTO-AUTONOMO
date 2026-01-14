import { v4 as uuidv4 } from 'uuid';
import { CreatePaymentDTO, PaymentResponseDTO, PaymentStatus, PaymentStatusDTO } from "../core/dtos/payment.dto";
import { PaymentProvider } from "../core/ports/payment-provider.interface";

/**
 * MockAdapter simula una pasarela de pago para desarrollo y pruebas.
 */
export class MockAdapter implements PaymentProvider {
  readonly name = 'mock';

  private mockDatabase = new Map<string, any>();

  async createPayment(paymentData: CreatePaymentDTO): Promise<PaymentResponseDTO> {
    console.log(`[MockAdapter] Creando pago para la orden: ${paymentData.orderId}`);

    const providerPaymentId = `mock_pi_${uuidv4()}`;
    const paymentId = uuidv4();

    const paymentInfo = {
      ...paymentData,
      paymentId,
      providerPaymentId,
      status: PaymentStatus.SUCCEEDED, // Simula un pago exitoso inmediatamente
      createdAt: new Date(),
    };

    this.mockDatabase.set(paymentId, paymentInfo);

    // En un caso real, aquí se generaría una URL de pago o un client secret.
    // Para el mock, simplemente retornamos éxito.
    return Promise.resolve({
      success: true,
      paymentId,
      providerPaymentId,
      status: PaymentStatus.SUCCEEDED,
      message: 'Pago simulado creado exitosamente.',
      redirectUrl: `http://localhost:3000/payment/success?orderId=${paymentData.orderId}`,
    });
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatusDTO> {
    const paymentInfo = this.mockDatabase.get(paymentId);

    if (!paymentInfo) {
      throw new Error('Pago no encontrado en el MockAdapter');
    }

    return Promise.resolve({
      paymentId: paymentInfo.paymentId,
      status: paymentInfo.status,
      provider: this.name,
      amount: paymentInfo.amount,
      currency: paymentInfo.currency,
      createdAt: paymentInfo.createdAt,
    });
  }

  async handleWebhook(payload: any, signature: string | undefined): Promise<{ received: boolean; status?: string; data?: any; error?: string; }> {
    console.log('[MockAdapter] Webhook simulado recibido:');
    console.log(payload);

    // En el mock, asumimos que el webhook es válido y lo procesamos.
    // En un adaptador real, aquí se verificaría la firma (signature).
    if (payload.type === 'payment.succeeded') {
      return Promise.resolve({
        received: true,
        status: 'processed',
        data: { 
          providerPaymentId: payload.data.id,
          status: PaymentStatus.SUCCEEDED,
        },
      });
    }

    return Promise.resolve({ 
      received: true, 
      status: 'ignored', 
      data: { message: 'Tipo de evento no manejado por el mock' }
    });
  }
}

import { MockAdapter } from "../../adapters/mock.adapter";
import { StripeAdapter } from "../../adapters/stripe.adapter";
import { CreatePaymentDTO, PaymentResponseDTO, PaymentStatus, PaymentStatusDTO } from "../dtos/payment.dto";
import { PaymentProvider } from "../ports/payment-provider.interface";
import { WebhookService } from "./webhook.service";

export class PaymentService {
  private providers: Map<string, PaymentProvider> = new Map();
  private stripeAdapter: StripeAdapter | null = null;

  constructor(private webhookService: WebhookService) {
    // Registrar siempre el mock para desarrollo/testing
    this.registerProvider(new MockAdapter());
    
    // Registrar Stripe solo si está configurado
    this.initializeStripe();
  }

  private initializeStripe(): void {
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        this.stripeAdapter = new StripeAdapter();
        this.registerProvider(this.stripeAdapter);
        console.log('[PaymentService] ✅ Stripe configurado correctamente.');
      } catch (error) {
        console.error('[PaymentService] ⚠️ Error al inicializar Stripe:', error);
        console.log('[PaymentService] Stripe no estará disponible. Usando mock como fallback.');
      }
    } else {
      console.log('[PaymentService] ⚠️ STRIPE_SECRET_KEY no configurada. Stripe no disponible.');
    }
  }

  /**
   * Obtiene el adaptador de Stripe si está disponible
   */
  getStripeAdapter(): StripeAdapter | null {
    return this.stripeAdapter;
  }

  private registerProvider(provider: PaymentProvider) {
    this.providers.set(provider.name, provider);
    console.log(`[PaymentService] Proveedor '${provider.name}' registrado.`);
  }

  private getProvider(providerName?: string): PaymentProvider {
    const provider = this.providers.get(providerName || 'mock');
    if (!provider) {
      throw new Error(`El proveedor de pago '${providerName}' no está disponible.`);
    }
    return provider;
  }

  async createPayment(paymentData: CreatePaymentDTO, providerName?: string): Promise<PaymentResponseDTO> {
    const provider = this.getProvider(providerName);
    console.log(`[PaymentService] Usando proveedor '${provider.name}' para crear el pago.`);
    const result = await provider.createPayment(paymentData);

    if (result.success && result.status === PaymentStatus.SUCCEEDED) {
      // Despachar evento de pago exitoso
      this.webhookService.dispatchEvent('payment.succeeded', {
        paymentId: result.paymentId,
        orderId: paymentData.orderId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        customer: paymentData.customer,
      });
    }

    return result;
  }

  async getPaymentStatus(paymentId: string, providerName?: string): Promise<PaymentStatusDTO> {
    const provider = this.getProvider(providerName);
    return provider.getPaymentStatus(paymentId);
  }

  async handleWebhook(providerName: string, payload: any, signature: string | undefined): Promise<any> {
    const provider = this.getProvider(providerName);
    console.log(`[PaymentService] Procesando webhook para el proveedor '${provider.name}'.`);
    const result = await provider.handleWebhook(payload, signature);

    if (result.received && result.status === 'processed' && result.data.status === PaymentStatus.SUCCEEDED) {
      // Despachar evento de pago exitoso recibido desde un webhook de la pasarela
      this.webhookService.dispatchEvent('payment.succeeded', {
        providerPaymentId: result.data.providerPaymentId,
        status: result.data.status,
      });
    }

    return result;
  }
}

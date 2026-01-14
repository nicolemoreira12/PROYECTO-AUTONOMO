import { CreatePaymentDTO, PaymentResponseDTO, PaymentStatusDTO } from "../dtos/payment.dto";

export interface PaymentProvider {
  /**
   * El nombre del proveedor (ej. 'stripe', 'mock')
   */
  readonly name: string;

  /**
   * Crea una intención de pago o una sesión de checkout.
   * @param paymentData Los datos para crear el pago.
   * @returns Una promesa que se resuelve con la respuesta del pago.
   */
  createPayment(paymentData: CreatePaymentDTO): Promise<PaymentResponseDTO>;

  /**
   * Obtiene el estado de un pago existente.
   * @param paymentId El ID del pago a consultar.
   * @returns Una promesa que se resuelve con el estado del pago.
   */
  getPaymentStatus(paymentId: string): Promise<PaymentStatusDTO>;

  /**
   * Maneja los webhooks entrantes de la pasarela de pago.
   * Normaliza el payload del webhook a un formato común.
   * @param payload El cuerpo de la solicitud del webhook.
   * @param signature La firma del webhook (ej. de los headers).
   * @returns Un objeto normalizado con el evento y los datos.
   */
  handleWebhook(payload: any, signature: string | undefined): Promise<{
    received: boolean;
    status?: string;
    data?: any;
    error?: string;
  }>;
}

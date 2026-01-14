export interface CreatePaymentDTO {
  amount: number; // En la unidad más pequeña (ej. centavos)
  currency: string; // ej. 'usd', 'eur'
  description: string;
  orderId: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  metadata?: Record<string, any>;
}

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELED = 'canceled',
}

export interface PaymentResponseDTO {
  success: boolean;
  paymentId: string; // ID de la transacción en nuestra BD
  providerPaymentId: string; // ID de la transacción en la pasarela
  status: PaymentStatus;
  message: string;
  redirectUrl?: string;
  clientSecret?: string;
  metadata?: Record<string, any>;
}

export interface PaymentStatusDTO {
  paymentId: string;
  status: PaymentStatus;
  provider: string;
  amount: number;
  currency: string;
  createdAt: Date;
}

export interface RegisterPartnerDTO {
  partnerName: string;
  webhookUrl: string;
  subscribedEvents: string[]; // ej. ['payment.succeeded', 'order.created']
}

export interface PartnerResponseDTO {
  partnerId: string;
  partnerName: string;
  webhookUrl: string;
  subscribedEvents: string[];
  hmacSecret: string; // El secreto compartido para la firma HMAC
  createdAt: Date;
}

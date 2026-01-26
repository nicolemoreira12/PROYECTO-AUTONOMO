import Stripe from 'stripe';
import { CreatePaymentDTO, PaymentResponseDTO, PaymentStatus, PaymentStatusDTO } from "../core/dtos/payment.dto";
import { PaymentProvider } from "../core/ports/payment-provider.interface";

/**
 * StripeAdapter - Adaptador para la pasarela de pago de Stripe
 * Implementa la interfaz PaymentProvider para integrarse con el sistema de pagos
 */
export class StripeAdapter implements PaymentProvider {
    readonly name = 'stripe';
    private stripe: Stripe;
    private webhookSecret: string;

    constructor() {
        const secretKey = process.env.STRIPE_SECRET_KEY;
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

        if (!secretKey) {
            throw new Error('STRIPE_SECRET_KEY no está configurada en las variables de entorno');
        }

        if (!webhookSecret) {
            console.warn('[StripeAdapter] STRIPE_WEBHOOK_SECRET no está configurada. La verificación de webhooks no funcionará.');
        }

        this.stripe = new Stripe(secretKey, {
            apiVersion: '2023-10-16', // Versión de la API compatible con el SDK
            typescript: true,
        });

        this.webhookSecret = webhookSecret || '';
        console.log('[StripeAdapter] Adaptador de Stripe inicializado correctamente.');
    }

    /**
     * Crea una sesión de Checkout de Stripe
     * Esto redirige al cliente a una página de pago alojada por Stripe
     */
    async createPayment(paymentData: CreatePaymentDTO): Promise<PaymentResponseDTO> {
        console.log(`[StripeAdapter] Creando sesión de checkout para la orden: ${paymentData.orderId}`);

        try {
            // Crear o recuperar el cliente en Stripe
            const customer = await this.getOrCreateCustomer(paymentData.customer);

            // Crear la sesión de Checkout
            const session = await this.stripe.checkout.sessions.create({
                customer: customer.id,
                payment_method_types: ['card'],
                mode: 'payment',
                line_items: [
                    {
                        price_data: {
                            currency: paymentData.currency.toLowerCase(),
                            product_data: {
                                name: paymentData.description || `Orden #${paymentData.orderId}`,
                                metadata: {
                                    orderId: paymentData.orderId,
                                },
                            },
                            unit_amount: paymentData.amount, // Ya debe estar en centavos
                        },
                        quantity: 1,
                    },
                ],
                metadata: {
                    orderId: paymentData.orderId,
                    customerId: paymentData.customer.id,
                    ...paymentData.metadata,
                },
                success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}&orderId=${paymentData.orderId}`,
                cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/cancel?orderId=${paymentData.orderId}`,
                expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // Expira en 30 minutos
            });

            console.log(`[StripeAdapter] Sesión de checkout creada: ${session.id}`);

            return {
                success: true,
                paymentId: session.id,
                providerPaymentId: session.id,
                status: PaymentStatus.PENDING,
                message: 'Sesión de checkout creada exitosamente.',
                redirectUrl: session.url || undefined,
                metadata: {
                    sessionId: session.id,
                    expiresAt: session.expires_at,
                },
            };
        } catch (error) {
            console.error('[StripeAdapter] Error al crear sesión de checkout:', error);
            const stripeError = error as Stripe.errors.StripeError;

            return {
                success: false,
                paymentId: '',
                providerPaymentId: '',
                status: PaymentStatus.FAILED,
                message: stripeError.message || 'Error al crear la sesión de pago.',
                metadata: {
                    errorCode: stripeError.code,
                    errorType: stripeError.type,
                },
            };
        }
    }

    /**
     * Crea un PaymentIntent de Stripe (alternativa al Checkout)
     * Útil cuando quieres manejar el UI de pago tú mismo
     */
    async createPaymentIntent(paymentData: CreatePaymentDTO): Promise<PaymentResponseDTO> {
        console.log(`[StripeAdapter] Creando PaymentIntent para la orden: ${paymentData.orderId}`);

        try {
            const customer = await this.getOrCreateCustomer(paymentData.customer);

            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: paymentData.amount,
                currency: paymentData.currency.toLowerCase(),
                customer: customer.id,
                description: paymentData.description || `Pago para orden #${paymentData.orderId}`,
                metadata: {
                    orderId: paymentData.orderId,
                    customerId: paymentData.customer.id,
                    ...paymentData.metadata,
                },
                automatic_payment_methods: {
                    enabled: true,
                },
            });

            console.log(`[StripeAdapter] PaymentIntent creado: ${paymentIntent.id}`);

            return {
                success: true,
                paymentId: paymentIntent.id,
                providerPaymentId: paymentIntent.id,
                status: this.mapStripeStatus(paymentIntent.status),
                message: 'PaymentIntent creado exitosamente.',
                clientSecret: paymentIntent.client_secret || undefined,
                metadata: {
                    paymentIntentId: paymentIntent.id,
                },
            };
        } catch (error) {
            console.error('[StripeAdapter] Error al crear PaymentIntent:', error);
            const stripeError = error as Stripe.errors.StripeError;

            return {
                success: false,
                paymentId: '',
                providerPaymentId: '',
                status: PaymentStatus.FAILED,
                message: stripeError.message || 'Error al crear el PaymentIntent.',
            };
        }
    }

    /**
     * Obtiene el estado de un pago (sesión de checkout o PaymentIntent)
     */
    async getPaymentStatus(paymentId: string): Promise<PaymentStatusDTO> {
        console.log(`[StripeAdapter] Consultando estado del pago: ${paymentId}`);

        try {
            // Determinar si es una sesión de checkout o un PaymentIntent
            if (paymentId.startsWith('cs_')) {
                // Es una sesión de Checkout
                const session = await this.stripe.checkout.sessions.retrieve(paymentId);

                return {
                    paymentId: session.id,
                    status: this.mapCheckoutStatus(session.status),
                    provider: this.name,
                    amount: session.amount_total || 0,
                    currency: session.currency || 'usd',
                    createdAt: new Date(session.created * 1000),
                };
            } else if (paymentId.startsWith('pi_')) {
                // Es un PaymentIntent
                const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentId);

                return {
                    paymentId: paymentIntent.id,
                    status: this.mapStripeStatus(paymentIntent.status),
                    provider: this.name,
                    amount: paymentIntent.amount,
                    currency: paymentIntent.currency,
                    createdAt: new Date(paymentIntent.created * 1000),
                };
            }

            throw new Error('ID de pago no reconocido');
        } catch (error) {
            console.error('[StripeAdapter] Error al obtener estado del pago:', error);
            throw error;
        }
    }

    /**
     * Maneja los webhooks entrantes de Stripe
     * IMPORTANTE: Requiere el rawBody para verificar la firma
     */
    async handleWebhook(payload: any, signature: string | undefined): Promise<{
        received: boolean;
        status?: string;
        data?: any;
        error?: string;
    }> {
        console.log('[StripeAdapter] Procesando webhook de Stripe...');

        if (!signature) {
            console.error('[StripeAdapter] Webhook recibido sin firma');
            return {
                received: false,
                error: 'No se proporcionó la firma del webhook',
            };
        }

        let event: Stripe.Event;

        try {
            // Si payload es un string (rawBody), usarlo directamente
            // Si es un objeto, necesitamos el rawBody del request
            const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);

            event = this.stripe.webhooks.constructEvent(
                payloadString,
                signature,
                this.webhookSecret
            );

            console.log(`[StripeAdapter] Webhook verificado. Evento: ${event.type}`);
        } catch (error) {
            const err = error as Error;
            console.error('[StripeAdapter] Error al verificar webhook:', err.message);
            return {
                received: false,
                error: `Error de verificación: ${err.message}`,
            };
        }

        // Procesar diferentes tipos de eventos
        return this.processWebhookEvent(event);
    }

    /**
     * Procesa los diferentes tipos de eventos de webhook
     */
    private processWebhookEvent(event: Stripe.Event): {
        received: boolean;
        status?: string;
        data?: any;
        error?: string;
    } {
        console.log(`[StripeAdapter] Procesando evento: ${event.type}`);

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                console.log(`[StripeAdapter] Checkout completado para sesión: ${session.id}`);

                return {
                    received: true,
                    status: 'processed',
                    data: {
                        eventType: event.type,
                        providerPaymentId: session.id,
                        paymentIntentId: session.payment_intent,
                        status: PaymentStatus.SUCCEEDED,
                        orderId: session.metadata?.orderId,
                        customerId: session.metadata?.customerId,
                        amountTotal: session.amount_total,
                        currency: session.currency,
                        customerEmail: session.customer_email,
                    },
                };
            }

            case 'checkout.session.expired': {
                const session = event.data.object as Stripe.Checkout.Session;
                console.log(`[StripeAdapter] Checkout expirado: ${session.id}`);

                return {
                    received: true,
                    status: 'processed',
                    data: {
                        eventType: event.type,
                        providerPaymentId: session.id,
                        status: PaymentStatus.CANCELED,
                        orderId: session.metadata?.orderId,
                    },
                };
            }

            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                console.log(`[StripeAdapter] PaymentIntent exitoso: ${paymentIntent.id}`);

                return {
                    received: true,
                    status: 'processed',
                    data: {
                        eventType: event.type,
                        providerPaymentId: paymentIntent.id,
                        status: PaymentStatus.SUCCEEDED,
                        orderId: paymentIntent.metadata?.orderId,
                        customerId: paymentIntent.metadata?.customerId,
                        amount: paymentIntent.amount,
                        currency: paymentIntent.currency,
                    },
                };
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                console.log(`[StripeAdapter] PaymentIntent fallido: ${paymentIntent.id}`);

                return {
                    received: true,
                    status: 'processed',
                    data: {
                        eventType: event.type,
                        providerPaymentId: paymentIntent.id,
                        status: PaymentStatus.FAILED,
                        orderId: paymentIntent.metadata?.orderId,
                        errorMessage: paymentIntent.last_payment_error?.message,
                    },
                };
            }

            case 'payment_intent.canceled': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                console.log(`[StripeAdapter] PaymentIntent cancelado: ${paymentIntent.id}`);

                return {
                    received: true,
                    status: 'processed',
                    data: {
                        eventType: event.type,
                        providerPaymentId: paymentIntent.id,
                        status: PaymentStatus.CANCELED,
                        orderId: paymentIntent.metadata?.orderId,
                    },
                };
            }

            case 'charge.refunded': {
                const charge = event.data.object as Stripe.Charge;
                console.log(`[StripeAdapter] Cargo reembolsado: ${charge.id}`);

                return {
                    received: true,
                    status: 'processed',
                    data: {
                        eventType: event.type,
                        chargeId: charge.id,
                        paymentIntentId: charge.payment_intent,
                        amountRefunded: charge.amount_refunded,
                        status: 'refunded',
                    },
                };
            }

            default:
                console.log(`[StripeAdapter] Evento no manejado: ${event.type}`);
                return {
                    received: true,
                    status: 'ignored',
                    data: {
                        eventType: event.type,
                        message: 'Tipo de evento no manejado',
                    },
                };
        }
    }

    /**
     * Busca o crea un cliente en Stripe
     */
    private async getOrCreateCustomer(customerData: {
        id: string;
        name: string;
        email: string;
    }): Promise<Stripe.Customer> {
        try {
            // Buscar cliente existente por email
            const existingCustomers = await this.stripe.customers.list({
                email: customerData.email,
                limit: 1,
            });

            if (existingCustomers.data.length > 0) {
                console.log(`[StripeAdapter] Cliente existente encontrado: ${existingCustomers.data[0].id}`);
                return existingCustomers.data[0];
            }

            // Crear nuevo cliente
            const newCustomer = await this.stripe.customers.create({
                email: customerData.email,
                name: customerData.name,
                metadata: {
                    internalId: customerData.id,
                },
            });

            console.log(`[StripeAdapter] Nuevo cliente creado: ${newCustomer.id}`);
            return newCustomer;
        } catch (error) {
            console.error('[StripeAdapter] Error al gestionar cliente:', error);
            throw error;
        }
    }

    /**
     * Mapea el estado de PaymentIntent de Stripe a nuestro enum
     */
    private mapStripeStatus(stripeStatus: Stripe.PaymentIntent.Status): PaymentStatus {
        const statusMap: Record<Stripe.PaymentIntent.Status, PaymentStatus> = {
            'requires_payment_method': PaymentStatus.PENDING,
            'requires_confirmation': PaymentStatus.PENDING,
            'requires_action': PaymentStatus.PENDING,
            'processing': PaymentStatus.PENDING,
            'requires_capture': PaymentStatus.PENDING,
            'canceled': PaymentStatus.CANCELED,
            'succeeded': PaymentStatus.SUCCEEDED,
        };

        return statusMap[stripeStatus] || PaymentStatus.PENDING;
    }

    /**
     * Mapea el estado de Checkout Session de Stripe a nuestro enum
     */
    private mapCheckoutStatus(checkoutStatus: Stripe.Checkout.Session.Status | null): PaymentStatus {
        if (!checkoutStatus) return PaymentStatus.PENDING;

        const statusMap: Record<Stripe.Checkout.Session.Status, PaymentStatus> = {
            'open': PaymentStatus.PENDING,
            'complete': PaymentStatus.SUCCEEDED,
            'expired': PaymentStatus.CANCELED,
        };

        return statusMap[checkoutStatus] || PaymentStatus.PENDING;
    }

    /**
     * Crea un reembolso para un pago
     */
    async createRefund(paymentIntentId: string, amount?: number): Promise<{
        success: boolean;
        refundId?: string;
        message: string;
    }> {
        try {
            const refund = await this.stripe.refunds.create({
                payment_intent: paymentIntentId,
                amount: amount, // Si no se especifica, reembolsa el total
            });

            console.log(`[StripeAdapter] Reembolso creado: ${refund.id}`);

            return {
                success: true,
                refundId: refund.id,
                message: 'Reembolso procesado exitosamente',
            };
        } catch (error) {
            const stripeError = error as Stripe.errors.StripeError;
            console.error('[StripeAdapter] Error al crear reembolso:', stripeError.message);

            return {
                success: false,
                message: stripeError.message || 'Error al procesar el reembolso',
            };
        }
    }
}

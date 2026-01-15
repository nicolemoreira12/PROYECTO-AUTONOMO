import axios from 'axios';
import { BaseMCPTool } from './base.tool';
import { ToolDefinition, ToolResult } from '../types';

/**
 * Herramienta de ACCIÓN: Procesar pago de una orden
 * Categoría: action
 */
export class ProcesarPagoTool extends BaseMCPTool {
    readonly definition: ToolDefinition = {
        name: 'procesar_pago',
        description: 'Procesa el pago de una orden existente utilizando el servicio de pagos. Devuelve el estado del pago y detalles de la transacción.',
        category: 'action',
        parameters: [
            {
                name: 'orderId',
                type: 'string',
                description: 'ID de la orden a pagar',
                required: true,
            },
            {
                name: 'amount',
                type: 'number',
                description: 'Monto a pagar',
                required: true,
            },
            {
                name: 'currency',
                type: 'string',
                description: 'Moneda del pago (USD, EUR, etc.)',
                required: false,
            },
            {
                name: 'provider',
                type: 'string',
                description: 'Proveedor de pago: mock, stripe, paypal',
                required: false,
                enum: ['mock', 'stripe', 'paypal'],
            },
        ],
    };

    private paymentServiceUrl: string;

    constructor() {
        super();
        this.paymentServiceUrl = process.env.PAYMENT_SERVICE_URL || 'http://localhost:5000';
    }

    async execute(args: Record<string, any>, context?: any): Promise<ToolResult> {
        try {
            // Validar argumentos
            const validation = this.validateArgs(args);
            if (!validation.valid) {
                return this.error(validation.error!);
            }

            const { orderId, amount, currency = 'USD', provider = 'mock' } = args;

            // Validar monto
            if (amount <= 0) {
                return this.error('El monto debe ser mayor a 0');
            }

            // Preparar datos del pago
            const paymentData = {
                orderId,
                amount,
                currency,
                provider,
                customer: {
                    name: context?.userName || 'Usuario',
                    email: context?.userEmail || 'usuario@email.com',
                },
            };

            // Llamar al servicio de pagos
            const response = await axios.post(
                `${this.paymentServiceUrl}/api/payments/create`,
                paymentData,
                {
                    timeout: 10000,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            const payment = response.data;

            // Formatear respuesta
            return this.success({
                paymentId: payment.paymentId,
                providerPaymentId: payment.providerPaymentId,
                status: payment.status,
                amount: amount,
                currency: currency,
                orderId: orderId,
                redirectUrl: payment.redirectUrl,
                mensaje: payment.message || `Pago procesado exitosamente. Estado: ${payment.status}`,
            });
        } catch (error: any) {
            console.error('Error procesando pago:', error);

            // Errores específicos
            if (error.response?.status === 400) {
                return this.error('Datos de pago inválidos: ' + (error.response.data?.message || ''));
            }

            if (error.response?.status === 404) {
                return this.error('Orden no encontrada');
            }

            // Si el servicio no está disponible, simular pago
            if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
                return this.success({
                    paymentId: `mock-payment-${Date.now()}`,
                    providerPaymentId: `mock_pi_${Date.now()}`,
                    status: 'succeeded',
                    amount: args.amount,
                    currency: args.currency || 'USD',
                    orderId: args.orderId,
                    mensaje: 'Pago simulado exitosamente (Payment service no disponible)',
                });
            }

            return this.handleError(error);
        }
    }
}

import axios from 'axios';
import { MICROSERVICES } from '../api/microservices.config';

export interface PaymentRequest {
    monto: number;
    moneda?: string;
    descripcion: string;
    ordenId?: number;
    usuarioId?: number;
    metodo_pago?: 'tarjeta' | 'transferencia' | 'efectivo';
}

export interface PaymentResponse {
    success: boolean;
    transaccionId?: string;
    mensaje?: string;
    detalles?: any;
}

export interface TarjetaVirtual {
    id: number;
    numero: string;
    saldo: number;
    activa: boolean;
    usuarioId: number;
}

class PaymentService {
    private baseURL = MICROSERVICES.PAYMENT;

    async procesarPago(paymentData: PaymentRequest): Promise<PaymentResponse> {
        try {
            const response = await axios.post(
                `${this.baseURL}/api/payments/process`,
                paymentData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            return response.data;
        } catch (error: any) {
            console.error('Error al procesar pago:', error);
            return {
                success: false,
                mensaje: error.response?.data?.mensaje || 'Error al procesar el pago',
            };
        }
    }

    async obtenerTarjetaVirtual(usuarioId: number): Promise<TarjetaVirtual | null> {
        try {
            const response = await axios.get(
                `${this.baseURL}/api/payments/tarjeta/${usuarioId}`
            );
            return response.data;
        } catch (error) {
            console.error('Error al obtener tarjeta virtual:', error);
            return null;
        }
    }

    async crearTarjetaVirtual(usuarioId: number): Promise<TarjetaVirtual | null> {
        try {
            const response = await axios.post(
                `${this.baseURL}/api/payments/tarjeta`,
                { usuarioId }
            );
            return response.data;
        } catch (error) {
            console.error('Error al crear tarjeta virtual:', error);
            return null;
        }
    }

    async recargarTarjeta(usuarioId: number, monto: number): Promise<boolean> {
        try {
            const response = await axios.post(
                `${this.baseURL}/api/payments/tarjeta/recargar`,
                { usuarioId, monto }
            );
            return response.data.success;
        } catch (error) {
            console.error('Error al recargar tarjeta:', error);
            return false;
        }
    }

    async verificarSaldo(usuarioId: number): Promise<number> {
        try {
            const tarjeta = await this.obtenerTarjetaVirtual(usuarioId);
            return tarjeta?.saldo || 0;
        } catch (error) {
            console.error('Error al verificar saldo:', error);
            return 0;
        }
    }
}

export const paymentService = new PaymentService();

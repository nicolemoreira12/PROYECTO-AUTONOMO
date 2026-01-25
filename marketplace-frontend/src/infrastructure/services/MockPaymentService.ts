/**
 * MockPaymentService - Simulación de procesamiento de pagos
 * 
 * Proporciona una experiencia realista de procesamiento de pagos
 * con datos ficticios, delays y diferentes escenarios (éxito/fallo)
 */

export interface PaymentRequest {
    monto: number;
    moneda?: string;
    descripcion: string;
    ordenId?: number;
    usuarioId?: number;
    metodo_pago: 'tarjeta' | 'wallet' | 'crypto' | 'transferencia' | 'efectivo';
    // Datos adicionales según método
    datosPago?: {
        // Para tarjeta
        numeroTarjeta?: string;
        nombreTitular?: string;
        fechaExpiracion?: string;
        cvv?: string;
        // Para wallet/crypto
        walletAddress?: string;
        cryptoMoneda?: 'USDT' | 'USDC' | 'BTC' | 'ETH';
        // Para transferencia
        bancoOrigen?: string;
        cuentaOrigen?: string;
    };
}

export interface PaymentResponse {
    success: boolean;
    transaccionId?: string;
    hashTransaccion?: string;
    mensaje?: string;
    detalles?: {
        monto: number;
        moneda: string;
        metodoPago: string;
        fechaProcesamiento: string;
        numeroAutorizacion?: string;
        estado: 'aprobado' | 'rechazado' | 'pendiente';
        motivoRechazo?: string;
    };
}

export interface TarjetaVirtual {
    id: number;
    numero: string;
    saldo: number;
    activa: boolean;
    usuarioId: number;
    fechaExpiracion: string;
}

class MockPaymentService {
    private readonly DELAY = parseInt(import.meta.env.VITE_MOCK_PAYMENT_DELAY || '2500');
    private readonly SUCCESS_RATE = parseInt(import.meta.env.VITE_MOCK_PAYMENT_SUCCESS_RATE || '95');

    /**
     * Simula el procesamiento de un pago
     */
    async procesarPago(paymentData: PaymentRequest): Promise<PaymentResponse> {
        // Simular delay de procesamiento
        await this.delay(this.DELAY);

        // Determinar si el pago es exitoso basado en la tasa de éxito
        const isSuccessful = Math.random() * 100 < this.SUCCESS_RATE;

        if (isSuccessful) {
            return this.generarPagoExitoso(paymentData);
        } else {
            return this.generarPagoRechazado(paymentData);
        }
    }

    /**
     * Valida un número de tarjeta usando el algoritmo de Luhn
     */
    validarNumeroTarjeta(numero: string): boolean {
        const sanitized = numero.replace(/\s/g, '');
        
        if (!/^\d+$/.test(sanitized) || sanitized.length < 13 || sanitized.length > 19) {
            return false;
        }

        let sum = 0;
        let isEven = false;

        for (let i = sanitized.length - 1; i >= 0; i--) {
            let digit = parseInt(sanitized[i], 10);

            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }

            sum += digit;
            isEven = !isEven;
        }

        return sum % 10 === 0;
    }

    /**
     * Valida la fecha de expiración de una tarjeta
     */
    validarFechaExpiracion(fecha: string): boolean {
        const [mes, anio] = fecha.split('/').map(v => parseInt(v, 10));
        
        if (!mes || !anio || mes < 1 || mes > 12) {
            return false;
        }

        const now = new Date();
        const currentYear = now.getFullYear() % 100;
        const currentMonth = now.getMonth() + 1;

        if (anio < currentYear) {
            return false;
        }

        if (anio === currentYear && mes < currentMonth) {
            return false;
        }

        return true;
    }

    /**
     * Valida CVV
     */
    validarCVV(cvv: string): boolean {
        return /^\d{3,4}$/.test(cvv);
    }

    /**
     * Obtiene información de una tarjeta virtual (simulado)
     */
    async obtenerTarjetaVirtual(idUsuario: number): Promise<TarjetaVirtual | null> {
        await this.delay(500);

        // Simular tarjeta virtual
        return {
            id: Math.floor(Math.random() * 10000),
            numero: this.generarNumeroTarjeta(),
            saldo: Math.random() * 5000 + 1000,
            activa: true,
            usuarioId: idUsuario,
            fechaExpiracion: this.generarFechaExpiracion(),
        };
    }

    /**
     * Recarga el saldo de una tarjeta virtual (simulado)
     */
    async recargarTarjeta(idTarjeta: number, monto: number): Promise<PaymentResponse> {
        await this.delay(1500);

        return {
            success: true,
            transaccionId: this.generarTransaccionId(),
            mensaje: `Recarga exitosa para tarjeta ${idTarjeta}`,
            detalles: {
                monto,
                moneda: 'USD',
                metodoPago: 'recarga_wallet',
                fechaProcesamiento: new Date().toISOString(),
                numeroAutorizacion: this.generarNumeroAutorizacion(),
                estado: 'aprobado',
            },
        };
    }

    /**
     * Consulta el estado de una transacción (simulado)
     */
    async consultarEstadoTransaccion(transaccionId: string): Promise<{
        estado: 'aprobado' | 'rechazado' | 'pendiente' | 'cancelado';
        detalles: string;
    }> {
        await this.delay(800);

        return {
            estado: 'aprobado',
            detalles: `Transacción ${transaccionId} procesada exitosamente`,
        };
    }

    // ========== Métodos privados auxiliares ==========

    private generarPagoExitoso(paymentData: PaymentRequest): PaymentResponse {
        return {
            success: true,
            transaccionId: this.generarTransaccionId(),
            hashTransaccion: this.generarHash(),
            mensaje: 'Pago procesado exitosamente',
            detalles: {
                monto: paymentData.monto,
                moneda: paymentData.moneda || 'USD',
                metodoPago: this.getNombreMetodoPago(paymentData.metodo_pago),
                fechaProcesamiento: new Date().toISOString(),
                numeroAutorizacion: this.generarNumeroAutorizacion(),
                estado: 'aprobado',
            },
        };
    }

    private generarPagoRechazado(paymentData: PaymentRequest): PaymentResponse {
        const motivosRechazo = [
            'Fondos insuficientes',
            'Tarjeta bloqueada',
            'Límite de transacción excedido',
            'Error de validación',
            'Transacción sospechosa',
        ];

        return {
            success: false,
            mensaje: 'Pago rechazado',
            detalles: {
                monto: paymentData.monto,
                moneda: paymentData.moneda || 'USD',
                metodoPago: this.getNombreMetodoPago(paymentData.metodo_pago),
                fechaProcesamiento: new Date().toISOString(),
                estado: 'rechazado',
                motivoRechazo: motivosRechazo[Math.floor(Math.random() * motivosRechazo.length)],
            },
        };
    }

    private generarTransaccionId(): string {
        const prefix = 'TXN';
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `${prefix}-${timestamp}-${random}`;
    }

    private generarHash(): string {
        const chars = '0123456789abcdef';
        let hash = '0x';
        for (let i = 0; i < 64; i++) {
            hash += chars[Math.floor(Math.random() * chars.length)];
        }
        return hash;
    }

    private generarNumeroAutorizacion(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    private generarNumeroTarjeta(): string {
        // Genera un número de tarjeta válido usando Luhn
        const prefix = '4532'; // Visa
        let number = prefix;
        
        for (let i = 0; i < 12; i++) {
            number += Math.floor(Math.random() * 10);
        }

        return this.formatearNumeroTarjeta(number);
    }

    private formatearNumeroTarjeta(numero: string): string {
        return numero.replace(/(\d{4})/g, '$1 ').trim();
    }

    private generarFechaExpiracion(): string {
        const mes = Math.floor(Math.random() * 12) + 1;
        const anio = new Date().getFullYear() % 100 + Math.floor(Math.random() * 5) + 1;
        return `${mes.toString().padStart(2, '0')}/${anio}`;
    }

    private getNombreMetodoPago(metodo: string): string {
        const nombres: Record<string, string> = {
            tarjeta: 'Tarjeta de Crédito/Débito',
            wallet: 'Wallet Virtual',
            crypto: 'Criptomoneda',
            transferencia: 'Transferencia Bancaria',
            efectivo: 'Efectivo',
        };
        return nombres[metodo] || metodo;
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export const mockPaymentService = new MockPaymentService();

/**
 * Casos de uso para el flujo completo de pagos
 * Gestiona el proceso: Crear Orden → Procesar Pago → Actualizar Estado → Confirmar
 */

import { mockPaymentService, type PaymentRequest, type PaymentResponse } from '@infrastructure/services/MockPaymentService';
import { httpClient } from '@infrastructure/api/http-client';
import { FEATURES } from '@infrastructure/api/microservices.config';

export interface ItemCarrito {
    productoId: number;
    cantidad: number;
    precio: number;
    nombreProducto?: string;
}

export interface OrdenCreada {
    idOrden: number;
    total: number;
    estado: string;
    fechaOrden: string;
}

export interface ResultadoPago {
    success: boolean;
    ordenId: number;
    transaccionId?: string;
    mensaje: string;
    detalles?: any;
}

class PaymentUseCases {
    /**
     * Flujo completo de checkout: Crear orden y procesar pago
     */
    async procesarCheckout(
        items: ItemCarrito[],
        metodoPago: 'tarjeta' | 'wallet' | 'crypto' | 'transferencia' | 'efectivo',
        datosPago?: any
    ): Promise<ResultadoPago> {
        try {
            // Paso 1: Crear la orden en el sistema
            const orden = await this.crearOrden(items, metodoPago);

            if (!orden) {
                return {
                    success: false,
                    ordenId: 0,
                    mensaje: 'Error al crear la orden',
                };
            }

            // Paso 2: Procesar el pago
            const resultadoPago = await this.procesarPago({
                monto: orden.total,
                moneda: 'USD',
                descripcion: `Pago de orden #${orden.idOrden}`,
                ordenId: orden.idOrden,
                metodo_pago: metodoPago,
                datosPago,
            });

            // Paso 3: Actualizar estado de la orden según resultado del pago
            if (resultadoPago.success) {
                await this.actualizarEstadoOrden(orden.idOrden, 'completado', resultadoPago.transaccionId);

                // Paso 4: Limpiar el carrito
                await this.limpiarCarrito();

                return {
                    success: true,
                    ordenId: orden.idOrden,
                    transaccionId: resultadoPago.transaccionId,
                    mensaje: 'Pago procesado exitosamente',
                    detalles: resultadoPago.detalles,
                };
            } else {
                // Si el pago falla, marcar la orden como cancelada
                await this.actualizarEstadoOrden(orden.idOrden, 'cancelado');

                return {
                    success: false,
                    ordenId: orden.idOrden,
                    mensaje: resultadoPago.mensaje || 'Error al procesar el pago',
                    detalles: resultadoPago.detalles,
                };
            }
        } catch (error: any) {
            console.error('Error en procesarCheckout:', error);
            return {
                success: false,
                ordenId: 0,
                mensaje: error.message || 'Error inesperado al procesar el checkout',
            };
        }
    }

    /**
     * Crea una orden en el backend
     */
    private async crearOrden(
        items: ItemCarrito[],
        metodoPago: string
    ): Promise<OrdenCreada | null> {
        try {
            const total = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

            const ordenData = {
                total,
                estado: 'pendiente',
                metodoPago,
                detalles: items.map((item) => ({
                    productoId: item.productoId,
                    cantidad: item.cantidad,
                    precioUnitario: item.precio,
                    subtotal: item.precio * item.cantidad,
                })),
            };

            const response = await httpClient.post<OrdenCreada>('/orden', ordenData);
            return response;
        } catch (error) {
            console.error('Error al crear orden:', error);
            return null;
        }
    }

    /**
     * Procesa el pago usando el servicio correspondiente (real o simulado)
     */
    private async procesarPago(paymentData: PaymentRequest): Promise<PaymentResponse> {
        try {
            if (FEATURES.REAL_PAYMENTS) {
                // TODO: Integrar con Payment Service real cuando esté disponible
                // const response = await axios.post(`${MICROSERVICES.PAYMENT}/api/payments/process`, paymentData);
                // return response.data;
                throw new Error('Pago real aún no implementado');
            } else {
                // Usar servicio de pago simulado
                return await mockPaymentService.procesarPago(paymentData);
            }
        } catch (error: any) {
            console.error('Error al procesar pago:', error);
            return {
                success: false,
                mensaje: error.message || 'Error al procesar el pago',
            };
        }
    }

    /**
     * Actualiza el estado de una orden
     */
    private async actualizarEstadoOrden(
        ordenId: number,
        estado: 'pendiente' | 'completado' | 'cancelado' | 'procesando',
        transaccionId?: string
    ): Promise<void> {
        try {
            await httpClient.put(`/orden/${ordenId}`, {
                estado,
                ...(transaccionId && { transaccionId }),
            });
        } catch (error) {
            console.error('Error al actualizar estado de orden:', error);
            // No lanzar error para no interrumpir el flujo si el pago fue exitoso
        }
    }

    /**
     * Limpia el carrito del usuario después de un pago exitoso
     */
    private async limpiarCarrito(): Promise<void> {
        try {
            // Limpiar el carrito en el backend
            await httpClient.delete('/carrito');
            console.log('✅ Carrito limpiado en el backend');

            // Limpiar el carrito local (localStorage)
            localStorage.removeItem('carrito-storage');
            console.log('✅ Carrito local limpiado');
        } catch (error) {
            console.error('Error al limpiar carrito en backend:', error);
            // Aún así limpiar el carrito local
            localStorage.removeItem('carrito-storage');
        }
    }

    /**
     * Consulta el estado de una transacción
     */
    async consultarEstadoTransaccion(transaccionId: string): Promise<{
        estado: 'aprobado' | 'rechazado' | 'pendiente' | 'cancelado';
        detalles: string;
    }> {
        try {
            if (FEATURES.REAL_PAYMENTS) {
                // TODO: Consultar estado real
                throw new Error('Consulta de estado real no implementada');
            } else {
                return await mockPaymentService.consultarEstadoTransaccion(transaccionId);
            }
        } catch (error: any) {
            console.error('Error al consultar estado:', error);
            return {
                estado: 'pendiente',
                detalles: error.message || 'Error al consultar estado',
            };
        }
    }

    /**
     * Obtiene el detalle de una orden por ID
     */
    async obtenerDetalleOrden(ordenId: number): Promise<any> {
        try {
            return await httpClient.get(`/orden/${ordenId}`);
        } catch (error) {
            console.error('Error al obtener detalle de orden:', error);
            throw error;
        }
    }

    /**
     * Valida datos de pago antes de procesarlos
     */
    validarDatosPago(
        metodoPago: string,
        datosPago: any
    ): { valido: boolean; error?: string } {
        if (metodoPago === 'tarjeta') {
            if (!datosPago.numeroTarjeta) {
                return { valido: false, error: 'Número de tarjeta requerido' };
            }
            if (!mockPaymentService.validarNumeroTarjeta(datosPago.numeroTarjeta)) {
                return { valido: false, error: 'Número de tarjeta inválido' };
            }
            if (!datosPago.nombreTitular) {
                return { valido: false, error: 'Nombre del titular requerido' };
            }
            if (!mockPaymentService.validarFechaExpiracion(datosPago.fechaExpiracion)) {
                return { valido: false, error: 'Fecha de expiración inválida' };
            }
            if (!mockPaymentService.validarCVV(datosPago.cvv)) {
                return { valido: false, error: 'CVV inválido' };
            }
        } else if (metodoPago === 'wallet' || metodoPago === 'crypto') {
            if (!datosPago.walletAddress) {
                return { valido: false, error: 'Dirección de wallet requerida' };
            }
        } else if (metodoPago === 'transferencia') {
            if (!datosPago.bancoOrigen || !datosPago.cuentaOrigen) {
                return { valido: false, error: 'Datos bancarios requeridos' };
            }
        }

        return { valido: true };
    }

    /**
     * Simula una recarga de wallet/tarjeta virtual
     */
    async recargarTarjetaVirtual(idTarjeta: number, monto: number): Promise<PaymentResponse> {
        try {
            if (FEATURES.REAL_PAYMENTS) {
                // TODO: Implementar recarga real
                throw new Error('Recarga real no implementada');
            } else {
                return await mockPaymentService.recargarTarjeta(idTarjeta, monto);
            }
        } catch (error: any) {
            return {
                success: false,
                mensaje: error.message || 'Error al recargar tarjeta',
            };
        }
    }

    /**
     * Obtiene información de tarjeta virtual del usuario
     */
    async obtenerTarjetaVirtual(idUsuario: number): Promise<any> {
        try {
            if (FEATURES.REAL_PAYMENTS) {
                // TODO: Obtener de Payment Service real
                return await httpClient.get(`/tarjetas/usuario/${idUsuario}`);
            } else {
                return await mockPaymentService.obtenerTarjetaVirtual(idUsuario);
            }
        } catch (error) {
            console.error('Error al obtener tarjeta virtual:', error);
            return null;
        }
    }
}

export const paymentUseCases = new PaymentUseCases();

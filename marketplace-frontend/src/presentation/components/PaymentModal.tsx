import React, { useState } from 'react';
import { paymentService, type PaymentRequest } from '@infrastructure/services';
import './PaymentModal.css';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    total: number;
    onSuccess: (transaccionId: string) => void;
    ordenId?: number;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
    isOpen,
    onClose,
    total,
    onSuccess,
    ordenId,
}) => {
    const [metodoPago, setMetodoPago] = useState<'tarjeta' | 'transferencia' | 'efectivo'>('tarjeta');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePago = async () => {
        setIsProcessing(true);
        setError(null);

        const paymentData: PaymentRequest = {
            monto: total,
            moneda: 'USD',
            descripcion: `Pago de orden ${ordenId || 'nueva'}`,
            ordenId,
            metodo_pago: metodoPago,
        };

        try {
            const response = await paymentService.procesarPago(paymentData);
            
            if (response.success && response.transaccionId) {
                onSuccess(response.transaccionId);
                onClose();
            } else {
                setError(response.mensaje || 'Error al procesar el pago');
            }
        } catch (error) {
            setError('Error al conectar con el servicio de pagos');
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="payment-modal" onClick={e => e.stopPropagation()}>
                <div className="payment-modal-header">
                    <h2>Procesar Pago</h2>
                    <button className="close-button" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="payment-modal-content">
                    <div className="payment-summary">
                        <div className="summary-item">
                            <span>Total a pagar:</span>
                            <strong>${total.toFixed(2)}</strong>
                        </div>
                    </div>

                    <div className="payment-methods">
                        <h3>Método de Pago</h3>
                        <div className="payment-options">
                            <label className={`payment-option ${metodoPago === 'tarjeta' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="metodoPago"
                                    value="tarjeta"
                                    checked={metodoPago === 'tarjeta'}
                                    onChange={() => setMetodoPago('tarjeta')}
                                />
                                <div className="option-content">
                                    <i className="fas fa-credit-card"></i>
                                    <span>Tarjeta Virtual</span>
                                </div>
                            </label>

                            <label className={`payment-option ${metodoPago === 'transferencia' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="metodoPago"
                                    value="transferencia"
                                    checked={metodoPago === 'transferencia'}
                                    onChange={() => setMetodoPago('transferencia')}
                                />
                                <div className="option-content">
                                    <i className="fas fa-exchange-alt"></i>
                                    <span>Transferencia</span>
                                </div>
                            </label>

                            <label className={`payment-option ${metodoPago === 'efectivo' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="metodoPago"
                                    value="efectivo"
                                    checked={metodoPago === 'efectivo'}
                                    onChange={() => setMetodoPago('efectivo')}
                                />
                                <div className="option-content">
                                    <i className="fas fa-money-bill-wave"></i>
                                    <span>Efectivo</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {error && (
                        <div className="payment-error">
                            <i className="fas fa-exclamation-circle"></i>
                            {error}
                        </div>
                    )}

                    <button
                        className="btn-pay"
                        onClick={handlePago}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i>
                                Procesando...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-lock"></i>
                                Pagar ${total.toFixed(2)}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

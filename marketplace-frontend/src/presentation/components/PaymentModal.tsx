import React, { useState } from 'react';
import { mockPaymentService, type PaymentRequest } from '@infrastructure/services/MockPaymentService';
import { FEATURES } from '@infrastructure/api/microservices.config';
import './PaymentModal.css';

type MetodoPago = 'tarjeta' | 'wallet' | 'crypto' | 'transferencia' | 'efectivo';
type WizardStep = 1 | 2 | 3 | 4;

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    total: number;
    onSuccess: (transaccionId: string, detalles?: any) => void;
    ordenId?: number;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
    isOpen,
    onClose,
    total,
    onSuccess,
    ordenId,
}) => {
    // Estados del wizard
    const [currentStep, setCurrentStep] = useState<WizardStep>(1);
    const [metodoPago, setMetodoPago] = useState<MetodoPago>('tarjeta');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [transaccionResult, setTransaccionResult] = useState<any>(null);

    // Datos del formulario de pago
    const [formData, setFormData] = useState({
        // Tarjeta
        numeroTarjeta: '',
        nombreTitular: '',
        fechaExpiracion: '',
        cvv: '',
        // Wallet/Crypto
        walletAddress: '',
        cryptoMoneda: 'USDT' as 'USDT' | 'USDC' | 'BTC' | 'ETH',
        // Transferencia
        bancoOrigen: '',
        cuentaOrigen: '',
    });

    const resetModal = () => {
        setCurrentStep(1);
        setMetodoPago('tarjeta');
        setIsProcessing(false);
        setError(null);
        setTransaccionResult(null);
        setFormData({
            numeroTarjeta: '',
            nombreTitular: '',
            fechaExpiracion: '',
            cvv: '',
            walletAddress: '',
            cryptoMoneda: 'USDT',
            bancoOrigen: '',
            cuentaOrigen: '',
        });
    };

    const handleClose = () => {
        resetModal();
        onClose();
    };

    const handleNextStep = () => {
        if (currentStep < 4) {
            if (currentStep === 2) {
                // Validar formulario antes de procesar
                if (!validateForm()) {
                    return;
                }
                // Iniciar procesamiento
                procesarPago();
            } else {
                setCurrentStep((prev) => (prev + 1) as WizardStep);
            }
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => (prev - 1) as WizardStep);
            setError(null);
        }
    };

    const validateForm = (): boolean => {
        setError(null);

        if (metodoPago === 'tarjeta') {
            if (!formData.numeroTarjeta || !formData.nombreTitular || 
                !formData.fechaExpiracion || !formData.cvv) {
                setError('Por favor completa todos los campos de la tarjeta');
                return false;
            }

            if (!mockPaymentService.validarNumeroTarjeta(formData.numeroTarjeta)) {
                setError('Número de tarjeta inválido');
                return false;
            }

            if (!mockPaymentService.validarFechaExpiracion(formData.fechaExpiracion)) {
                setError('Fecha de expiración inválida o vencida');
                return false;
            }

            if (!mockPaymentService.validarCVV(formData.cvv)) {
                setError('CVV inválido (3-4 dígitos)');
                return false;
            }
        } else if (metodoPago === 'wallet' || metodoPago === 'crypto') {
            if (!formData.walletAddress) {
                setError('Por favor ingresa la dirección de wallet');
                return false;
            }
        } else if (metodoPago === 'transferencia') {
            if (!formData.bancoOrigen || !formData.cuentaOrigen) {
                setError('Por favor completa los datos de transferencia');
                return false;
            }
        }

        return true;
    };

    const procesarPago = async () => {
        setIsProcessing(true);
        setCurrentStep(3); // Paso de procesamiento
        setError(null);

        const paymentData: PaymentRequest = {
            monto: total,
            moneda: 'USD',
            descripcion: `Pago de orden ${ordenId || 'nueva'}`,
            ordenId,
            metodo_pago: metodoPago,
            datosPago: {
                numeroTarjeta: formData.numeroTarjeta,
                nombreTitular: formData.nombreTitular,
                fechaExpiracion: formData.fechaExpiracion,
                cvv: formData.cvv,
                walletAddress: formData.walletAddress,
                cryptoMoneda: formData.cryptoMoneda,
                bancoOrigen: formData.bancoOrigen,
                cuentaOrigen: formData.cuentaOrigen,
            },
        };

        try {
            const response = FEATURES.REAL_PAYMENTS
                ? await procesarPagoReal(paymentData)
                : await mockPaymentService.procesarPago(paymentData);

            setIsProcessing(false);

            if (response.success && response.transaccionId) {
                setTransaccionResult(response);
                setCurrentStep(4); // Paso de confirmación
                onSuccess(response.transaccionId, response.detalles);
            } else {
                setError(response.mensaje || 'Error al procesar el pago');
                setCurrentStep(2); // Volver al formulario
            }
        } catch (error) {
            setIsProcessing(false);
            setError('Error al conectar con el servicio de pagos');
            setCurrentStep(2);
        }
    };

    const procesarPagoReal = async (paymentData: PaymentRequest): Promise<any> => {
        // TODO: Implementar cuando se conecte el Payment Service real
        throw new Error('Pago real no implementado aún');
    };

    const formatCreditCard = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];

        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }

        if (parts.length) {
            return parts.join(' ');
        } else {
            return value;
        }
    };

    const formatExpirationDate = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
        }
        return v;
    };

    const handleInputChange = (field: string, value: string) => {
        if (field === 'numeroTarjeta') {
            value = formatCreditCard(value);
        } else if (field === 'fechaExpiracion') {
            value = formatExpirationDate(value);
        } else if (field === 'cvv') {
            value = value.replace(/[^0-9]/g, '').substring(0, 4);
        }

        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="payment-modal payment-wizard" onClick={(e) => e.stopPropagation()}>
                <div className="payment-modal-header">
                    <h2>Procesar Pago</h2>
                    <button className="close-button" onClick={handleClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* Progress Indicator */}
                <div className="wizard-progress">
                    <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                        <div className="step-number">1</div>
                        <div className="step-label">Método</div>
                    </div>
                    <div className="step-line"></div>
                    <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                        <div className="step-number">2</div>
                        <div className="step-label">Datos</div>
                    </div>
                    <div className="step-line"></div>
                    <div className={`step ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
                        <div className="step-number">3</div>
                        <div className="step-label">Procesando</div>
                    </div>
                    <div className="step-line"></div>
                    <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>
                        <div className="step-number">4</div>
                        <div className="step-label">Confirmación</div>
                    </div>
                </div>

                <div className="payment-modal-content">
                    {/* Paso 1: Selección de Método de Pago */}
                    {currentStep === 1 && (
                        <div className="wizard-step step-method">
                            <div className="payment-summary">
                                <div className="summary-item">
                                    <span>Total a pagar:</span>
                                    <strong>${total.toFixed(2)} USD</strong>
                                </div>
                            </div>

                            <h3>Selecciona tu método de pago</h3>
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
                                        <div>
                                            <span className="option-title">Tarjeta de Crédito/Débito</span>
                                            <span className="option-desc">Visa, Mastercard, AmEx</span>
                                        </div>
                                    </div>
                                </label>

                                <label className={`payment-option ${metodoPago === 'wallet' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="metodoPago"
                                        value="wallet"
                                        checked={metodoPago === 'wallet'}
                                        onChange={() => setMetodoPago('wallet')}
                                    />
                                    <div className="option-content">
                                        <i className="fas fa-wallet"></i>
                                        <div>
                                            <span className="option-title">Wallet Virtual</span>
                                            <span className="option-desc">Paga con tu wallet interna</span>
                                        </div>
                                    </div>
                                </label>

                                <label className={`payment-option ${metodoPago === 'crypto' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="metodoPago"
                                        value="crypto"
                                        checked={metodoPago === 'crypto'}
                                        onChange={() => setMetodoPago('crypto')}
                                    />
                                    <div className="option-content">
                                        <i className="fab fa-bitcoin"></i>
                                        <div>
                                            <span className="option-title">Criptomonedas</span>
                                            <span className="option-desc">USDT, USDC, BTC, ETH</span>
                                        </div>
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
                                        <div>
                                            <span className="option-title">Transferencia Bancaria</span>
                                            <span className="option-desc">Transferencia directa</span>
                                        </div>
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
                                        <div>
                                            <span className="option-title">Efectivo</span>
                                            <span className="option-desc">Pago contra entrega</span>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Paso 2: Formulario de Datos de Pago */}
                    {currentStep === 2 && (
                        <div className="wizard-step step-form">
                            <h3>Ingresa los datos de pago</h3>

                            {metodoPago === 'tarjeta' && (
                                <div className="payment-form">
                                    <div className="form-group">
                                        <label>
                                            <i className="fas fa-credit-card"></i> Número de Tarjeta
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="1234 5678 9012 3456"
                                            value={formData.numeroTarjeta}
                                            onChange={(e) => handleInputChange('numeroTarjeta', e.target.value)}
                                            maxLength={19}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            <i className="fas fa-user"></i> Nombre del Titular
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="JUAN PEREZ"
                                            value={formData.nombreTitular}
                                            onChange={(e) => handleInputChange('nombreTitular', e.target.value.toUpperCase())}
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>
                                                <i className="fas fa-calendar"></i> Expiración
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="MM/AA"
                                                value={formData.fechaExpiracion}
                                                onChange={(e) => handleInputChange('fechaExpiracion', e.target.value)}
                                                maxLength={5}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>
                                                <i className="fas fa-lock"></i> CVV
                                            </label>
                                            <input
                                                type="password"
                                                placeholder="123"
                                                value={formData.cvv}
                                                onChange={(e) => handleInputChange('cvv', e.target.value)}
                                                maxLength={4}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="form-info">
                                        <i className="fas fa-info-circle"></i>
                                        <span>Datos simulados - Puedes usar cualquier número válido</span>
                                    </div>
                                </div>
                            )}

                            {(metodoPago === 'wallet' || metodoPago === 'crypto') && (
                                <div className="payment-form">
                                    {metodoPago === 'crypto' && (
                                        <div className="form-group">
                                            <label>
                                                <i className="fab fa-bitcoin"></i> Criptomoneda
                                            </label>
                                            <select
                                                value={formData.cryptoMoneda}
                                                onChange={(e) => handleInputChange('cryptoMoneda', e.target.value)}
                                            >
                                                <option value="USDT">USDT (Tether)</option>
                                                <option value="USDC">USDC (USD Coin)</option>
                                                <option value="BTC">BTC (Bitcoin)</option>
                                                <option value="ETH">ETH (Ethereum)</option>
                                            </select>
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <label>
                                            <i className="fas fa-wallet"></i> Dirección de Wallet
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1"
                                            value={formData.walletAddress}
                                            onChange={(e) => handleInputChange('walletAddress', e.target.value)}
                                        />
                                    </div>

                                    <div className="wallet-balance">
                                        <span>Saldo disponible:</span>
                                        <strong>$1,250.00 USD</strong>
                                    </div>

                                    <div className="form-info">
                                        <i className="fas fa-info-circle"></i>
                                        <span>Datos simulados para demostración</span>
                                    </div>
                                </div>
                            )}

                            {metodoPago === 'transferencia' && (
                                <div className="payment-form">
                                    <div className="form-group">
                                        <label>
                                            <i className="fas fa-university"></i> Banco Origen
                                        </label>
                                        <select
                                            value={formData.bancoOrigen}
                                            onChange={(e) => handleInputChange('bancoOrigen', e.target.value)}
                                        >
                                            <option value="">Selecciona un banco</option>
                                            <option value="banco_a">Banco A</option>
                                            <option value="banco_b">Banco B</option>
                                            <option value="banco_c">Banco C</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            <i className="fas fa-hashtag"></i> Número de Cuenta
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="1234567890"
                                            value={formData.cuentaOrigen}
                                            onChange={(e) => handleInputChange('cuentaOrigen', e.target.value)}
                                        />
                                    </div>

                                    <div className="transfer-info">
                                        <h4>Datos para transferencia:</h4>
                                        <p><strong>Banco:</strong> Marketplace Bank</p>
                                        <p><strong>Cuenta:</strong> 0987654321</p>
                                        <p><strong>Monto:</strong> ${total.toFixed(2)} USD</p>
                                    </div>

                                    <div className="form-info">
                                        <i className="fas fa-info-circle"></i>
                                        <span>Simulación de transferencia bancaria</span>
                                    </div>
                                </div>
                            )}

                            {metodoPago === 'efectivo' && (
                                <div className="payment-form">
                                    <div className="efectivo-info">
                                        <i className="fas fa-money-bill-wave fa-3x"></i>
                                        <h4>Pago en Efectivo</h4>
                                        <p>El pago se realizará al momento de la entrega del producto.</p>
                                        <p className="efectivo-amount">
                                            Total a pagar: <strong>${total.toFixed(2)} USD</strong>
                                        </p>
                                        <p className="efectivo-note">
                                            <i className="fas fa-info-circle"></i>
                                            Por favor ten el monto exacto disponible.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Paso 3: Procesando Pago */}
                    {currentStep === 3 && (
                        <div className="wizard-step step-processing">
                            <div className="processing-animation">
                                <div className="spinner-container">
                                    <i className="fas fa-circle-notch fa-spin fa-4x"></i>
                                </div>
                                <h3>Procesando tu pago...</h3>
                                <p>Por favor espera mientras verificamos tu transacción</p>
                                <div className="processing-steps">
                                    <div className="processing-step active">
                                        <i className="fas fa-check-circle"></i>
                                        <span>Validando información</span>
                                    </div>
                                    <div className="processing-step active">
                                        <i className="fas fa-sync fa-spin"></i>
                                        <span>Procesando pago</span>
                                    </div>
                                    <div className="processing-step">
                                        <i className="fas fa-clock"></i>
                                        <span>Confirmando transacción</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Paso 4: Confirmación */}
                    {currentStep === 4 && transaccionResult && (
                        <div className="wizard-step step-confirmation">
                            <div className="confirmation-content">
                                {transaccionResult.success ? (
                                    <>
                                        <div className="confirmation-icon success">
                                            <i className="fas fa-check-circle fa-4x"></i>
                                        </div>
                                        <h3>¡Pago Exitoso!</h3>
                                        <p>Tu transacción se ha procesado correctamente</p>

                                        <div className="transaction-details">
                                            <div className="detail-item">
                                                <span>ID de Transacción:</span>
                                                <strong>{transaccionResult.transaccionId}</strong>
                                            </div>
                                            {transaccionResult.hashTransaccion && (
                                                <div className="detail-item">
                                                    <span>Hash:</span>
                                                    <strong className="hash-small">
                                                        {transaccionResult.hashTransaccion.substring(0, 20)}...
                                                    </strong>
                                                </div>
                                            )}
                                            {transaccionResult.detalles && (
                                                <>
                                                    <div className="detail-item">
                                                        <span>Monto:</span>
                                                        <strong>
                                                            ${transaccionResult.detalles.monto.toFixed(2)} {transaccionResult.detalles.moneda}
                                                        </strong>
                                                    </div>
                                                    <div className="detail-item">
                                                        <span>Método:</span>
                                                        <strong>{transaccionResult.detalles.metodoPago}</strong>
                                                    </div>
                                                    {transaccionResult.detalles.numeroAutorizacion && (
                                                        <div className="detail-item">
                                                            <span>Autorización:</span>
                                                            <strong>{transaccionResult.detalles.numeroAutorizacion}</strong>
                                                        </div>
                                                    )}
                                                    <div className="detail-item">
                                                        <span>Fecha:</span>
                                                        <strong>
                                                            {new Date(transaccionResult.detalles.fechaProcesamiento).toLocaleString()}
                                                        </strong>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        <div className="confirmation-actions">
                                            <button className="btn-primary" onClick={handleClose}>
                                                <i className="fas fa-check"></i>
                                                Continuar
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="confirmation-icon error">
                                            <i className="fas fa-times-circle fa-4x"></i>
                                        </div>
                                        <h3>Pago Rechazado</h3>
                                        <p>{transaccionResult.mensaje || 'No se pudo procesar el pago'}</p>
                                        {transaccionResult.detalles?.motivoRechazo && (
                                            <p className="error-reason">
                                                <strong>Motivo:</strong> {transaccionResult.detalles.motivoRechazo}
                                            </p>
                                        )}

                                        <div className="confirmation-actions">
                                            <button className="btn-secondary" onClick={() => setCurrentStep(2)}>
                                                <i className="fas fa-redo"></i>
                                                Reintentar
                                            </button>
                                            <button className="btn-outline" onClick={handleClose}>
                                                Cancelar
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && currentStep !== 4 && (
                        <div className="payment-error">
                            <i className="fas fa-exclamation-circle"></i>
                            {error}
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    {currentStep !== 3 && currentStep !== 4 && (
                        <div className="wizard-navigation">
                            {currentStep > 1 && (
                                <button className="btn-back" onClick={handlePrevStep}>
                                    <i className="fas fa-arrow-left"></i>
                                    Atrás
                                </button>
                            )}
                            <button
                                className="btn-next"
                                onClick={handleNextStep}
                                disabled={isProcessing}
                            >
                                {currentStep === 2 ? (
                                    <>
                                        <i className="fas fa-lock"></i>
                                        Pagar ${total.toFixed(2)}
                                    </>
                                ) : (
                                    <>
                                        Continuar
                                        <i className="fas fa-arrow-right"></i>
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

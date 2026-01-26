import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { paymentUseCases } from '@application/use-cases';
import './OrdenConfirmacionPage.css';

// Helper para formatear números de forma segura (la API puede devolver strings)
const formatPrice = (value: number | string | undefined): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return (num ?? 0).toFixed(2);
};

interface DetalleOrden {
    idOrden: number;
    fechaOrden: string;
    estado: string;
    total: number;
    metodoPago: string;
    transaccionId?: string;
    usuario: {
        nombre: string;
        email: string;
    };
    detalles: Array<{
        producto: {
            nombreProducto: string;
            imagenURL: string;
        };
        cantidad: number;
        precioUnitario: number;
        subtotal: number;
    }>;
}

export const OrdenConfirmacionPage: React.FC = () => {
    const { ordenId } = useParams<{ ordenId: string }>();
    const navigate = useNavigate();
    const [orden, setOrden] = useState<DetalleOrden | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Verificar si hay token antes de cargar
        const token = localStorage.getItem('token');
        console.log('🔍 OrdenConfirmacion - Token disponible:', !!token);
        console.log('🔍 OrdenConfirmacion - OrdenId:', ordenId);

        if (!token) {
            console.warn('⚠️ No hay token, esperando...');
            // Dar tiempo para que el token se guarde después del login
            const timeout = setTimeout(() => {
                cargarOrden();
            }, 500);
            return () => clearTimeout(timeout);
        }

        cargarOrden();
    }, [ordenId]);

    const cargarOrden = async () => {
        if (!ordenId) {
            setError('ID de orden no válido');
            setLoading(false);
            return;
        }

        // Verificar token justo antes de la petición
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('❌ No hay token para cargar la orden');
            setError('Sesión no disponible. Por favor, inicia sesión nuevamente.');
            setLoading(false);
            return;
        }

        try {
            console.log('📦 Cargando orden:', ordenId);
            const data = await paymentUseCases.obtenerDetalleOrden(parseInt(ordenId));
            console.log('✅ Orden cargada:', data);
            setOrden(data);
        } catch (error: any) {
            console.error('Error al cargar orden:', error);
            // No hacer nada especial si es error de autenticación, solo mostrar mensaje
            if (error.status === 401 || error.status === 403) {
                setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
            } else {
                setError('No se pudo cargar la información de la orden');
            }
        } finally {
            setLoading(false);
        }
    };

    const descargarFactura = () => {
        // Simulación de descarga de factura PDF
        alert('Función de descarga de factura en desarrollo');
        // TODO: Implementar generación y descarga de PDF
    };

    const getEstadoClass = (estado: string) => {
        switch (estado.toLowerCase()) {
            case 'completado':
            case 'completada':
                return 'success';
            case 'pendiente':
                return 'warning';
            case 'cancelado':
            case 'cancelada':
                return 'danger';
            default:
                return 'info';
        }
    };

    const getEstadoIcon = (estado: string) => {
        switch (estado.toLowerCase()) {
            case 'completado':
            case 'completada':
                return 'fa-check-circle';
            case 'pendiente':
                return 'fa-clock';
            case 'cancelado':
            case 'cancelada':
                return 'fa-times-circle';
            default:
                return 'fa-info-circle';
        }
    };

    const getTrackingSteps = (estado: string) => {
        const steps = [
            { label: 'Orden Recibida', completed: true },
            { label: 'Pago Confirmado', completed: estado === 'completado' || estado === 'completada' },
            { label: 'En Preparación', completed: false },
            { label: 'Enviado', completed: false },
            { label: 'Entregado', completed: false },
        ];

        return steps;
    };

    if (loading) {
        return (
            <div className="orden-confirmacion-page">
                <div className="loading-container">
                    <i className="fas fa-spinner fa-spin fa-3x"></i>
                    <p>Cargando información de la orden...</p>
                </div>
            </div>
        );
    }

    if (error || !orden) {
        return (
            <div className="orden-confirmacion-page">
                <div className="error-container">
                    <i className="fas fa-exclamation-triangle fa-3x"></i>
                    <h2>Error</h2>
                    <p>{error || 'No se encontró la orden'}</p>
                    <button className="btn-primary" onClick={() => navigate('/ordenes')}>
                        Ver Mis Órdenes
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="orden-confirmacion-page">
            <div className="confirmacion-container">
                {/* Header de Confirmación */}
                <div className="confirmacion-header">
                    <div className={`status-icon ${getEstadoClass(orden.estado)}`}>
                        <i className={`fas ${getEstadoIcon(orden.estado)} fa-4x`}></i>
                    </div>
                    <h1>
                        {orden.estado === 'completado' || orden.estado === 'completada'
                            ? '¡Gracias por tu compra!'
                            : 'Orden Registrada'}
                    </h1>
                    <p className="orden-numero">Orden #{orden.idOrden}</p>
                    <p className="orden-fecha">
                        {new Date(orden.fechaOrden).toLocaleString('es-ES', {
                            dateStyle: 'long',
                            timeStyle: 'short',
                        })}
                    </p>
                </div>

                {/* Resumen de la Orden */}
                <div className="orden-summary">
                    <div className="summary-card">
                        <h3>
                            <i className="fas fa-receipt"></i> Resumen de la Orden
                        </h3>
                        <div className="summary-details">
                            <div className="detail-row">
                                <span>Estado:</span>
                                <strong className={`estado ${getEstadoClass(orden.estado)}`}>
                                    {orden.estado.charAt(0).toUpperCase() + orden.estado.slice(1)}
                                </strong>
                            </div>
                            <div className="detail-row">
                                <span>Total:</span>
                                <strong className="total">${formatPrice(orden.total)} USD</strong>
                            </div>
                            <div className="detail-row">
                                <span>Método de Pago:</span>
                                <strong>{orden.metodoPago}</strong>
                            </div>
                            {orden.transaccionId && (
                                <div className="detail-row">
                                    <span>ID Transacción:</span>
                                    <strong className="transaccion-id">{orden.transaccionId}</strong>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tracking Simulado */}
                    <div className="tracking-card">
                        <h3>
                            <i className="fas fa-shipping-fast"></i> Seguimiento del Pedido
                        </h3>
                        <div className="tracking-steps">
                            {getTrackingSteps(orden.estado).map((step, index) => (
                                <div
                                    key={index}
                                    className={`tracking-step ${step.completed ? 'completed' : ''}`}
                                >
                                    <div className="step-marker">
                                        {step.completed ? (
                                            <i className="fas fa-check"></i>
                                        ) : (
                                            <span>{index + 1}</span>
                                        )}
                                    </div>
                                    <div className="step-label">{step.label}</div>
                                    {index < getTrackingSteps(orden.estado).length - 1 && (
                                        <div className="step-connector"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <p className="tracking-note">
                            <i className="fas fa-info-circle"></i>
                            Simulación de tracking - Implementar integración real con servicio de envíos
                        </p>
                    </div>
                </div>

                {/* Productos Ordenados */}
                <div className="productos-card">
                    <h3>
                        <i className="fas fa-box"></i> Productos Ordenados
                    </h3>
                    <div className="productos-list">
                        {orden.detalles.map((detalle, index) => (
                            <div key={index} className="producto-item">
                                <img
                                    src={detalle.producto.imagenURL}
                                    alt={detalle.producto.nombreProducto}
                                    className="producto-imagen"
                                />
                                <div className="producto-info">
                                    <h4>{detalle.producto.nombreProducto}</h4>
                                    <p>Cantidad: {detalle.cantidad}</p>
                                    <p>Precio unitario: ${formatPrice(detalle.precioUnitario)}</p>
                                </div>
                                <div className="producto-subtotal">
                                    ${formatPrice(detalle.subtotal)}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="productos-total">
                        <span>Total:</span>
                        <strong>${formatPrice(orden.total)} USD</strong>
                    </div>
                </div>

                {/* Información del Cliente */}
                <div className="cliente-card">
                    <h3>
                        <i className="fas fa-user"></i> Información del Cliente
                    </h3>
                    <div className="cliente-info">
                        <p>
                            <strong>Nombre:</strong> {orden.usuario.nombre}
                        </p>
                        <p>
                            <strong>Email:</strong> {orden.usuario.email}
                        </p>
                    </div>
                </div>

                {/* Acciones */}
                <div className="confirmacion-actions">
                    <button className="btn-primary" onClick={() => navigate('/productos')}>
                        <i className="fas fa-shopping-cart"></i>
                        Seguir Comprando
                    </button>
                    <button className="btn-secondary" onClick={() => navigate('/ordenes')}>
                        <i className="fas fa-list"></i>
                        Ver Mis Órdenes
                    </button>
                    <button className="btn-outline" onClick={descargarFactura}>
                        <i className="fas fa-file-pdf"></i>
                        Descargar Factura
                    </button>
                </div>

                {/* Nota de Ayuda */}
                <div className="help-note">
                    <i className="fas fa-question-circle"></i>
                    <p>
                        ¿Tienes alguna pregunta sobre tu orden?{' '}
                        <a href="/contacto">Contáctanos</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

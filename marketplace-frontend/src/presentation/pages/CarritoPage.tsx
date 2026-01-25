import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCarrito } from '../hooks';
import { PaymentModal } from '../components/PaymentModal';
import { paymentUseCases } from '@application/use-cases';
import './CarritoPage.css';

export const CarritoPage: React.FC = () => {
    const navigate = useNavigate();
    const { carrito, loading, totalPrice, removeFromCarrito, updateItemCantidad } = useCarrito();
    const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

    const handleRemoveItem = async (productoId: number) => {
        if (confirm('¿Eliminar este producto del carrito?')) {
            try {
                await removeFromCarrito(productoId);
            } catch (err) {
                alert('Error al eliminar el producto');
            }
        }
    };

    const handleUpdateCantidad = async (productoId: number, newCantidad: number, maxStock: number) => {
        if (newCantidad < 1 || newCantidad > maxStock) {
            return;
        }

        try {
            setUpdatingItems(prev => new Set(prev).add(productoId));
            await updateItemCantidad(productoId, newCantidad);
        } catch (err) {
            alert('Error al actualizar la cantidad');
        } finally {
            setUpdatingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(productoId);
                return newSet;
            });
        }
    };

    const handleCheckout = () => {
        setShowPaymentModal(true);
    };

    const handlePaymentSuccess = async (_transaccionId: string, _detalles?: any) => {
        setIsProcessingCheckout(true);
        
        try {
            // El PaymentModal ya manejó el pago, ahora procesamos el checkout completo
            if (!carrito || carrito.items.length === 0) {
                alert('El carrito está vacío');
                return;
            }

            const items = carrito.items
                .filter(item => item.producto) // Filtrar items sin producto
                .map(item => ({
                    productoId: item.producto!.id,
                    cantidad: item.cantidad,
                    precio: item.producto!.precio,
                    nombreProducto: item.producto!.nombreProducto || item.producto!.nombre,
                }));

            // Crear la orden con el transaccionId recibido
            const resultado = await paymentUseCases.procesarCheckout(
                items,
                'tarjeta', // El método se selecciona en el modal
                {}
            );

            if (resultado.success) {
                // Redirigir a la página de confirmación
                navigate(`/orden/${resultado.ordenId}`);
            } else {
                alert(resultado.mensaje || 'Error al procesar el checkout');
            }
        } catch (error) {
            console.error('Error en checkout:', error);
            alert('Error al procesar la compra');
        } finally {
            setIsProcessingCheckout(false);
            setShowPaymentModal(false);
        }
    };

    const handleContinueShopping = () => {
        navigate('/');
    };

    if (loading) {
        return (
            <div className="carrito-page">
                <div className="container">
                    <div className="loading-container">
                        <i className="fas fa-spinner fa-spin"></i>
                        <p>Cargando carrito...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!carrito || carrito.items.length === 0) {
        return (
            <div className="carrito-page">
                <div className="container">
                    <div className="empty-state">
                        <i className="fas fa-shopping-cart"></i>
                        <h2>Tu carrito está vacío</h2>
                        <p>Agrega productos increíbles y comienza tu experiencia de compra</p>
                        <button onClick={handleContinueShopping} className="btn-primary">
                            <i className="fas fa-shopping-bag"></i> Ver Productos
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const envio = totalPrice >= 100 ? 0 : 5.00;
    const totalFinal = totalPrice + envio;

    return (
        <div className="carrito-page">
            <div className="container">
                <div className="carrito-header">
                    <h1>
                        <i className="fas fa-shopping-cart"></i> Mi Carrito
                    </h1>
                    <p className="subtitle">{carrito.items.length} {carrito.items.length === 1 ? 'producto' : 'productos'} en tu carrito</p>
                </div>

                <div className="carrito-content">
                    <div className="carrito-items">
                        {carrito.items
                            .filter(item => item.producto) // Solo mostrar items con producto válido
                            .map((item, index) => {
                            const producto = item.producto!; // Non-null assertion después del filter
                            const isUpdating = updatingItems.has(producto.id);
                            const maxStock = producto.stock || 10;

                            return (
                                <div key={producto.id || `item-${index}`} className="carrito-item">
                                    <div className="item-image">
                                        <img
                                            src={producto.imagen || '/placeholder.png'}
                                            alt={producto.nombre}
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = '/placeholder.png';
                                            }}
                                        />
                                    </div>

                                    <div className="item-details">
                                        <h3>{producto.nombre}</h3>
                                        <p className="item-description">
                                            {producto.descripcion?.substring(0, 100)}
                                            {(producto.descripcion?.length || 0) > 100 && '...'}
                                        </p>
                                        <p className="item-price">
                                            <i className="fas fa-tag"></i>
                                            ${producto.precio.toFixed(2)} c/u
                                        </p>
                                        <p className="item-stock">
                                            <i className="fas fa-box"></i>
                                            Stock disponible: {maxStock}
                                        </p>
                                    </div>

                                    <div className="item-quantity">
                                        <label>Cantidad:</label>
                                        <div className="quantity-controls">
                                            <button
                                                onClick={() => handleUpdateCantidad(producto.id, item.cantidad - 1, maxStock)}
                                                className="quantity-btn"
                                                disabled={item.cantidad <= 1 || isUpdating}
                                            >
                                                <i className="fas fa-minus"></i>
                                            </button>
                                            <input
                                                type="number"
                                                value={item.cantidad}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value);
                                                    if (!isNaN(val)) {
                                                        handleUpdateCantidad(producto.id, val, maxStock);
                                                    }
                                                }}
                                                min="1"
                                                max={maxStock}
                                                className="quantity-input"
                                                disabled={isUpdating}
                                            />
                                            <button
                                                onClick={() => handleUpdateCantidad(producto.id, item.cantidad + 1, maxStock)}
                                                className="quantity-btn"
                                                disabled={item.cantidad >= maxStock || isUpdating}
                                            >
                                                <i className="fas fa-plus"></i>
                                            </button>
                                        </div>
                                        {isUpdating && (
                                            <span className="updating-text">
                                                <i className="fas fa-spinner fa-spin"></i> Actualizando...
                                            </span>
                                        )}
                                    </div>

                                    <div className="item-actions">
                                        <p className="item-subtotal">
                                            ${(producto.precio * item.cantidad).toFixed(2)}
                                        </p>
                                        <button
                                            onClick={() => handleRemoveItem(producto.id)}
                                            className="btn-remove"
                                        >
                                            <i className="fas fa-trash-alt"></i> Eliminar
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="carrito-summary">
                        <h2>
                            <i className="fas fa-receipt"></i> Resumen de Compra
                        </h2>

                        <div className="summary-details">
                            <div className="summary-row">
                                <span>Subtotal ({carrito.items.length} {carrito.items.length === 1 ? 'producto' : 'productos'}):</span>
                                <span>${totalPrice.toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Envío:</span>
                                <span className={envio === 0 ? 'free-shipping' : ''}>
                                    {envio === 0 ? 'GRATIS' : `$${envio.toFixed(2)}`}
                                </span>
                            </div>
                            {totalPrice < 100 && (
                                <div className="shipping-notice">
                                    <i className="fas fa-info-circle"></i>
                                    Agrega ${(100 - totalPrice).toFixed(2)} más para envío gratis
                                </div>
                            )}
                            <div className="summary-divider"></div>
                            <div className="summary-row total">
                                <span>Total:</span>
                                <span>${totalFinal.toFixed(2)}</span>
                            </div>
                        </div>

                        <button onClick={handleCheckout} className="btn-checkout" disabled={isProcessingCheckout}>
                            {isProcessingCheckout ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i> Procesando...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-credit-card"></i> Proceder al Pago
                                </>
                            )}
                        </button>

                        <button onClick={handleContinueShopping} className="btn-continue">
                            <i className="fas fa-arrow-left"></i> Continuar Comprando
                        </button>

                        <div className="security-badges">
                            <div className="badge-item">
                                <i className="fas fa-shield-alt"></i>
                                <span>Compra Segura</span>
                            </div>
                            <div className="badge-item">
                                <i className="fas fa-undo"></i>
                                <span>Devolución Fácil</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal de Pago */}
                <PaymentModal
                    isOpen={showPaymentModal}
                    onClose={() => setShowPaymentModal(false)}
                    total={totalFinal}
                    onSuccess={handlePaymentSuccess}
                />
            </div>
        </div>
    );
};

import React from 'react';
import { useCarrito } from '../hooks';

export const CarritoPage: React.FC = () => {
    const { carrito, loading, totalPrice, removeFromCarrito } = useCarrito();

    const handleRemoveItem = async (itemId: number) => {
        if (confirm('¿Eliminar este producto del carrito?')) {
            try {
                await removeFromCarrito(itemId);
            } catch (err) {
                alert('Error al eliminar el producto');
            }
        }
    };

    const handleCheckout = () => {
        // Redirigir a página de checkout
        window.location.href = '/checkout';
    };

    if (loading) {
        return <div className="loading">Cargando carrito...</div>;
    }

    if (!carrito || carrito.items.length === 0) {
        return (
            <div className="empty-state">
                <h2>Tu carrito está vacío</h2>
                <p>Agrega productos para continuar</p>
                <a href="/" className="btn-primary">Ver Productos</a>
            </div>
        );
    }

    return (
        <div className="carrito-page">
            <div className="container">
                <h1>Mi Carrito</h1>

                <div className="carrito-content">
                    <div className="carrito-items">
                        {carrito.items.map((item) => (
                            <div key={item.id} className="carrito-item">
                                <div className="item-image">
                                    <img
                                        src={item.producto?.imagen || '/placeholder.png'}
                                        alt={item.producto?.nombre}
                                    />
                                </div>

                                <div className="item-details">
                                    <h3>{item.producto?.nombre}</h3>
                                    <p>Cantidad: {item.cantidad}</p>
                                    <p className="precio">
                                        ${(item.producto?.precio || 0).toFixed(2)} c/u
                                    </p>
                                </div>

                                <div className="item-actions">
                                    <p className="subtotal">
                                        ${((item.producto?.precio || 0) * item.cantidad).toFixed(2)}
                                    </p>
                                    <button
                                        onClick={() => handleRemoveItem(item.id)}
                                        className="btn-danger"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="carrito-summary">
                        <h2>Resumen de Compra</h2>
                        <div className="summary-row">
                            <span>Subtotal:</span>
                            <span>${totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Envío:</span>
                            <span>Gratis</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total:</span>
                            <span>${totalPrice.toFixed(2)}</span>
                        </div>
                        <button onClick={handleCheckout} className="btn-primary btn-block">
                            Proceder al Pago
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

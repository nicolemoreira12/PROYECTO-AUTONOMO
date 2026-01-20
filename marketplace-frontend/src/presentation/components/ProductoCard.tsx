import React from 'react';
import { Producto } from '@domain/entities/Producto';

interface ProductoCardProps {
    producto: Producto;
    onAddToCart: (productoId: number) => void;
    onViewDetails: (productoId: number) => void;
}

export const ProductoCard: React.FC<ProductoCardProps> = ({
    producto,
    onAddToCart,
    onViewDetails
}) => {
    return (
        <div className="producto-card">
            <div className="producto-image">
                <img
                    src={producto.imagen || '/placeholder.png'}
                    alt={producto.nombre}
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.png';
                    }}
                />
            </div>

            <div className="producto-info">
                <h3>{producto.nombre}</h3>
                <p className="descripcion">{producto.descripcion}</p>

                <div className="producto-footer">
                    <span className="precio">
                        ${typeof producto.precio === 'number' 
                            ? producto.precio.toFixed(2) 
                            : parseFloat(producto.precio as any || '0').toFixed(2)}
                    </span>
                    <span className={`stock ${producto.stock > 0 ? 'disponible' : 'agotado'}`}>
                        {producto.stock > 0 ? `Stock: ${producto.stock}` : 'Agotado'}
                    </span>
                </div>

                <div className="producto-actions">
                    <button
                        className="btn-secondary"
                        onClick={() => onViewDetails(producto.id)}
                    >
                        Ver Detalles
                    </button>
                    <button
                        className="btn-primary"
                        onClick={() => onAddToCart(producto.id)}
                        disabled={producto.stock === 0}
                    >
                        Agregar al Carrito
                    </button>
                </div>
            </div>
        </div>
    );
};

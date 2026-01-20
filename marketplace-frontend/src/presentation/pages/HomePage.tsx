import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductos, useCarrito } from '../hooks';
import { ProductoCard } from '../components';

export const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const { productos, loading, error, searchProductos, loadProductos } = useProductos();
    const { addToCarrito } = useCarrito();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            searchProductos(searchQuery);
        } else {
            loadProductos();
        }
    };

    const handleAddToCart = async (productoId: number) => {
        try {
            await addToCarrito(productoId, 1);
            alert('Producto agregado al carrito');
        } catch (err) {
            console.error('Error al agregar al carrito:', err);
            alert('Error al agregar al carrito. Por favor, inicia sesión.');
        }
    };

    const handleViewDetails = (productoId: number) => {
        navigate(`/productos/${productoId}`);
    };

    return (
        <div className="home-page">
            <div className="container">
                <header className="page-header">
                    <h1>Explora Nuestros Productos</h1>

                    <form onSubmit={handleSearch} className="search-form">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar productos..."
                            className="search-input"
                        />
                        <button type="submit" className="btn-primary">
                            Buscar
                        </button>
                    </form>
                </header>

                {loading && (
                    <div className="loading" style={{ 
                        textAlign: 'center', 
                        padding: '2rem',
                        fontSize: '1.2rem' 
                    }}>
                        Cargando productos...
                    </div>
                )}

                {error && (
                    <div className="alert alert-error" style={{ 
                        backgroundColor: '#fee',
                        border: '1px solid #fcc',
                        padding: '1rem',
                        borderRadius: '4px',
                        marginBottom: '1rem'
                    }}>
                        <strong>Error:</strong> {error}
                        <br />
                        <button 
                            onClick={loadProductos} 
                            style={{ marginTop: '0.5rem' }}
                            className="btn-primary"
                        >
                            Reintentar
                        </button>
                    </div>
                )}

                {!loading && !error && productos.length > 0 && (
                    <div className="productos-grid">
                        {productos.map((producto) => (
                            <ProductoCard
                                key={producto.id}
                                producto={producto}
                                onAddToCart={handleAddToCart}
                                onViewDetails={handleViewDetails}
                            />
                        ))}
                    </div>
                )}

                {!loading && !error && productos.length === 0 && (
                    <div className="empty-state" style={{ 
                        textAlign: 'center',
                        padding: '3rem',
                        color: '#666'
                    }}>
                        <p>No se encontraron productos</p>
                        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                            Intenta buscar algo o verifica que el backend esté funcionando
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

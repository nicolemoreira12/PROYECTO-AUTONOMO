import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCarrito } from '../hooks';
import { Producto } from '@domain/entities';
import { ProductoRepositoryImpl } from '@infrastructure/repositories';
import './ProductoDetallePage.css';

const productoRepository = new ProductoRepositoryImpl();

export const ProductoDetallePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addToCarrito } = useCarrito();
    
    const [producto, setProducto] = useState<Producto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cantidad, setCantidad] = useState(1);
    const [selectedImage, setSelectedImage] = useState<string>('');
    const [addingToCart, setAddingToCart] = useState(false);

    useEffect(() => {
        loadProducto();
    }, [id]);

    const loadProducto = async () => {
        if (!id) {
            setError('ID de producto no válido');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await productoRepository.getById(parseInt(id));
            if (data) {
                setProducto(data);
                setSelectedImage(data.imagen || '/placeholder.png');
            } else {
                setError('Producto no encontrado');
            }
        } catch (err) {
            console.error('Error al cargar producto:', err);
            setError('No se pudo cargar el producto');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!producto) return;

        try {
            setAddingToCart(true);
            await addToCarrito(producto.id, cantidad, producto);
            
            // Mostrar mensaje de éxito
            alert(`✅ ${cantidad} ${cantidad === 1 ? 'unidad' : 'unidades'} agregada(s) al carrito`);
            
            // Opcional: Redirigir al carrito
            // navigate('/carrito');
        } catch (err) {
            console.error('Error al agregar al carrito:', err);
            alert('⚠️ ' + (err instanceof Error ? err.message : 'Error al agregar al carrito'));
        } finally {
            setAddingToCart(false);
        }
    };

    const handleIncreaseCantidad = () => {
        if (cantidad < (producto?.stock || 1)) {
            setCantidad(cantidad + 1);
        }
    };

    const handleDecreaseCantidad = () => {
        if (cantidad > 1) {
            setCantidad(cantidad - 1);
        }
    };

    const handleBackToProducts = () => {
        navigate('/');
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner">
                    <i className="fas fa-spinner fa-spin"></i>
                    <p>Cargando producto...</p>
                </div>
            </div>
        );
    }

    if (error || !producto) {
        return (
            <div className="error-container">
                <div className="error-content">
                    <i className="fas fa-exclamation-circle"></i>
                    <h2>Error al cargar el producto</h2>
                    <p>{error || 'Producto no encontrado'}</p>
                    <button onClick={handleBackToProducts} className="btn-primary">
                        <i className="fas fa-arrow-left"></i> Volver a productos
                    </button>
                </div>
            </div>
        );
    }

    const disponible = (producto.stock || 0) > 0;

    return (
        <div className="producto-detalle-page">
            <div className="container">
                {/* Breadcrumb */}
                <nav className="breadcrumb">
                    <button onClick={handleBackToProducts} className="breadcrumb-link">
                        <i className="fas fa-home"></i> Inicio
                    </button>
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-current">
                        {producto.categoria?.nombre || 'Producto'}
                    </span>
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-current">{producto.nombre}</span>
                </nav>

                <div className="producto-detalle-content">
                    {/* Galería de imágenes */}
                    <div className="producto-gallery">
                        <div className="main-image">
                            <img 
                                src={selectedImage} 
                                alt={producto.nombre}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/placeholder.png';
                                }}
                            />
                            {!disponible && (
                                <div className="out-of-stock-badge">
                                    Agotado
                                </div>
                            )}
                        </div>
                        
                        {/* Miniaturas (si hay más imágenes en el futuro) */}
                        <div className="thumbnails">
                            <img 
                                src={producto.imagen || '/placeholder.png'} 
                                alt={producto.nombre}
                                className={selectedImage === producto.imagen ? 'active' : ''}
                                onClick={() => setSelectedImage(producto.imagen || '/placeholder.png')}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/placeholder.png';
                                }}
                            />
                        </div>
                    </div>

                    {/* Información del producto */}
                    <div className="producto-info">
                        <div className="producto-header">
                            <div className="producto-category">
                                <i className="fas fa-tag"></i> 
                                {producto.categoria?.nombre || 'Sin categoría'}
                            </div>
                            <h1 className="producto-title">{producto.nombre}</h1>
                        </div>

                        {/* Precio */}
                        <div className="producto-price-section">
                            <div className="precio-principal">
                                <span className="precio-label">Precio:</span>
                                <span className="precio-valor">${producto.precio.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Disponibilidad */}
                        <div className="producto-availability">
                            <div className={`availability-badge ${disponible ? 'available' : 'unavailable'}`}>
                                <i className={`fas fa-${disponible ? 'check-circle' : 'times-circle'}`}></i>
                                {disponible ? (
                                    <span>En stock ({producto.stock} unidades disponibles)</span>
                                ) : (
                                    <span>Producto agotado</span>
                                )}
                            </div>
                        </div>

                        {/* Descripción */}
                        <div className="producto-description">
                            <h3>
                                <i className="fas fa-info-circle"></i> Descripción
                            </h3>
                            <p>{producto.descripcion || 'Sin descripción disponible.'}</p>
                        </div>

                        {/* Información adicional */}
                        <div className="producto-additional-info">
                            <div className="info-item">
                                <i className="fas fa-store"></i>
                                <span>Vendedor: {producto.emprendedor?.nombre || 'Marketplace'}</span>
                            </div>
                            {producto.categoria && (
                                <div className="info-item">
                                    <i className="fas fa-list"></i>
                                    <span>Categoría: {producto.categoria.nombre}</span>
                                </div>
                            )}
                        </div>

                        {/* Selector de cantidad y botón de compra */}
                        {disponible && (
                            <div className="producto-actions">
                                <div className="cantidad-selector">
                                    <label>Cantidad:</label>
                                    <div className="cantidad-controls">
                                        <button 
                                            onClick={handleDecreaseCantidad}
                                            className="cantidad-btn"
                                            disabled={cantidad <= 1}
                                        >
                                            <i className="fas fa-minus"></i>
                                        </button>
                                        <input 
                                            type="number" 
                                            value={cantidad}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                if (val > 0 && val <= (producto.stock || 1)) {
                                                    setCantidad(val);
                                                }
                                            }}
                                            min="1"
                                            max={producto.stock}
                                            className="cantidad-input"
                                        />
                                        <button 
                                            onClick={handleIncreaseCantidad}
                                            className="cantidad-btn"
                                            disabled={cantidad >= (producto.stock || 1)}
                                        >
                                            <i className="fas fa-plus"></i>
                                        </button>
                                    </div>
                                </div>

                                <button 
                                    onClick={handleAddToCart}
                                    className="btn-add-to-cart"
                                    disabled={addingToCart}
                                >
                                    {addingToCart ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin"></i> Agregando...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-shopping-cart"></i> Agregar al Carrito
                                        </>
                                    )}
                                </button>

                                <div className="total-preview">
                                    <span>Total: </span>
                                    <span className="total-value">
                                        ${(producto.precio * cantidad).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Garantías y beneficios */}
                        <div className="producto-benefits">
                            <div className="benefit-item">
                                <i className="fas fa-shipping-fast"></i>
                                <span>Envío gratis en compras mayores a $100</span>
                            </div>
                            <div className="benefit-item">
                                <i className="fas fa-undo"></i>
                                <span>Devoluciones gratis en 30 días</span>
                            </div>
                            <div className="benefit-item">
                                <i className="fas fa-shield-alt"></i>
                                <span>Garantía de satisfacción</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductos, useCarrito } from '../hooks';
import { ProductoCard } from '../components';
import { webSocketService } from '@infrastructure/services';
import './HomePage.css';

export const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [priceRange, setPriceRange] = useState<'all' | 'low' | 'medium' | 'high'>('all');
    const [statsData, setStatsData] = useState({
        totalProducts: 0,
        totalOrders: 0,
        onlineUsers: 1,
    });

    const { productos, loading, error, searchProductos, loadProductos } = useProductos();
    const { addToCarrito } = useCarrito();

    useEffect(() => {
        // Cargar productos al inicio
        loadProductos();

        // Escuchar actualizaciones en tiempo real
        webSocketService.on('producto_nuevo', (data) => {
            console.log('Nuevo producto:', data);
            loadProductos();
        });

        webSocketService.on('stats_update', (data) => {
            setStatsData(prev => ({ ...prev, ...data }));
        });

        webSocketService.on('clients_count', (data) => {
            setStatsData(prev => ({ ...prev, onlineUsers: data.count || 1 }));
        });

        return () => {
            webSocketService.off('producto_nuevo', loadProductos);
        };
    }, []);

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
            alert('✅ Producto agregado al carrito');
        } catch (err) {
            console.error('Error al agregar al carrito:', err);
            alert('⚠️ Por favor, inicia sesión para agregar productos');
        }
    };

    const handleViewDetails = (productoId: number) => {
        navigate(`/productos/${productoId}`);
    };

    // Filtrar productos
    const filteredProducts = productos.filter(producto => {
        // Filtro de categoría
        if (selectedCategory !== 'all' && producto.categoria?.nombre !== selectedCategory) {
            return false;
        }

        // Filtro de precio
        if (priceRange !== 'all') {
            const precio = producto.precio;
            if (priceRange === 'low' && precio > 50) return false;
            if (priceRange === 'medium' && (precio <= 50 || precio > 150)) return false;
            if (priceRange === 'high' && precio <= 150) return false;
        }

        return true;
    });

    // Obtener categorías únicas
    const categories = ['all', ...new Set(productos.map(p => p.categoria?.nombre).filter(Boolean))];

    return (
        <div className="marketplace-home">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">
                        🛍️ Bienvenido al Marketplace Premium
                    </h1>
                    <p className="hero-subtitle">
                        Descubre productos increíbles de emprendedores locales
                    </p>
                    
                    {/* Barra de búsqueda principal */}
                    <form onSubmit={handleSearch} className="hero-search">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="🔍 Buscar productos..."
                            className="hero-search-input"
                        />
                        <button type="submit" className="hero-search-btn">
                            Buscar
                        </button>
                    </form>
                </div>
            </section>

            {/* Stats Cards */}
            <section className="stats-section">
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">📦</div>
                        <div className="stat-value">{productos.length}</div>
                        <div className="stat-label">Productos Disponibles</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🛒</div>
                        <div className="stat-value">{statsData.totalOrders}</div>
                        <div className="stat-label">Órdenes Hoy</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-value">{statsData.onlineUsers}</div>
                        <div className="stat-label">Usuarios en Línea</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">⭐</div>
                        <div className="stat-value">4.8</div>
                        <div className="stat-label">Calificación</div>
                    </div>
                </div>
            </section>

            {/* Filters Section */}
            <section className="filters-section">
                <div className="filters-container">
                    <div className="filter-group">
                        <label className="filter-label">
                            <i className="fas fa-filter"></i> Categoría:
                        </label>
                        <select 
                            value={selectedCategory} 
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="filter-select"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat === 'all' ? 'Todas las categorías' : cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">
                            <i className="fas fa-dollar-sign"></i> Precio:
                        </label>
                        <select 
                            value={priceRange} 
                            onChange={(e) => setPriceRange(e.target.value as any)}
                            className="filter-select"
                        >
                            <option value="all">Todos los precios</option>
                            <option value="low">Menos de $50</option>
                            <option value="medium">$50 - $150</option>
                            <option value="high">Más de $150</option>
                        </select>
                    </div>

                    <button 
                        onClick={() => {
                            setSelectedCategory('all');
                            setPriceRange('all');
                            setSearchQuery('');
                            loadProductos();
                        }}
                        className="filter-reset-btn"
                    >
                        <i className="fas fa-redo"></i> Limpiar Filtros
                    </button>
                </div>
            </section>

            {/* Products Section */}
            <section className="products-section">
                <div className="section-header">
                    <h2 className="section-title">
                        {searchQuery ? `Resultados para "${searchQuery}"` : 'Productos Destacados'}
                    </h2>
                    <p className="section-subtitle">
                        {filteredProducts.length} {filteredProducts.length === 1 ? 'producto encontrado' : 'productos encontrados'}
                    </p>
                </div>

                {loading && (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Cargando productos increíbles...</p>
                    </div>
                )}

                {error && (
                    <div className="info-card warning">
                        <div className="info-icon">⚠️</div>
                        <div className="info-content">
                            <h3>Modo de Demostración</h3>
                            <p>El servidor backend no está disponible</p>
                            <small>Inicia el servidor en el puerto 3000 para ver productos reales</small>
                        </div>
                    </div>
                )}

                {!loading && !error && filteredProducts.length > 0 && (
                    <div className="products-grid">
                        {filteredProducts.map((producto) => (
                            <ProductoCard
                                key={producto.id}
                                producto={producto}
                                onAddToCart={handleAddToCart}
                                onViewDetails={handleViewDetails}
                            />
                        ))}
                    </div>
                )}

                {!loading && !error && filteredProducts.length === 0 && productos.length > 0 && (
                    <div className="info-card info">
                        <div className="info-icon">🔍</div>
                        <div className="info-content">
                            <h3>No se encontraron productos</h3>
                            <p>Intenta ajustar los filtros o realizar una nueva búsqueda</p>
                        </div>
                    </div>
                )}

                {!loading && !error && productos.length === 0 && (
                    <div className="empty-state-card">
                        <div className="empty-icon">🏪</div>
                        <h2>¡Próximamente nuevos productos!</h2>
                        <p>Estamos trabajando para traerte los mejores productos</p>
                        <div className="setup-instructions">
                            <h3>💡 Para ver productos de tu base de datos:</h3>
                            <ol>
                                <li>Asegúrate de tener productos en tu base de datos</li>
                                <li>El backend debe estar corriendo en puerto 3000</li>
                                <li>Verifica la conexión a Supabase</li>
                            </ol>
                        </div>
                    </div>
                )}
            </section>

            {/* Features Section */}
            <section className="features-section">
                <h2 className="section-title">¿Por qué elegirnos?</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">🚀</div>
                        <h3>Envío Rápido</h3>
                        <p>Entrega en 24-48 horas</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🔒</div>
                        <h3>Pago Seguro</h3>
                        <p>Protección total en transacciones</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">💳</div>
                        <h3>Tarjeta Virtual</h3>
                        <p>Sistema de pagos integrado</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🤖</div>
                        <h3>Asistente IA</h3>
                        <p>Ayuda inteligente 24/7</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

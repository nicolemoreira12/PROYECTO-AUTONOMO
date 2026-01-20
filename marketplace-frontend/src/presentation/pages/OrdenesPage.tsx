import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks';
import { Orden } from '@domain/entities';
import './OrdenesPage.css';

export const OrdenesPage: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    const [ordenes, setOrdenes] = useState<Orden[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrden, setSelectedOrden] = useState<Orden | null>(null);
    const [filter, setFilter] = useState<'todas' | 'pendiente' | 'completada' | 'cancelada'>('todas');

    useEffect(() => {
        if (isAuthenticated) {
            loadOrdenes();
        }
    }, [isAuthenticated]);

    const loadOrdenes = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Aquí iría la llamada real al backend
            // const data = await ordenUseCases.getOrdenesUsuario();
            
            // Simulación de datos
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const ordenesSimuladas: Orden[] = [
                {
                    id: 1,
                    usuarioId: user?.id || 0,
                    total: 125.50,
                    estado: 'completada',
                    fechaCreacion: new Date('2025-01-15'),
                    createdAt: new Date('2025-01-15'),
                    updatedAt: new Date('2025-01-15'),
                    items: [
                        {
                            id: 1,
                            ordenId: 1,
                            productoId: 1,
                            cantidad: 2,
                            precio: 50.00,
                            producto: {
                                id: 1,
                                nombre: 'Producto Example 1',
                                precio: 50.00,
                                imagen: '/placeholder.png',
                                descripcion: 'Descripción del producto',
                                stock: 10,
                                emprendedorId: 1,
                                categoriaId: 1,
                                fechaCreacion: new Date()
                            }
                        },
                        {
                            id: 2,
                            ordenId: 1,
                            productoId: 2,
                            cantidad: 1,
                            precio: 25.50,
                            producto: {
                                id: 2,
                                nombre: 'Producto Example 2',
                                precio: 25.50,
                                imagen: '/placeholder.png',
                                descripcion: 'Descripción del producto',
                                stock: 5,
                                emprendedorId: 1,
                                categoriaId: 1,
                                fechaCreacion: new Date()
                            }
                        }
                    ]
                },
                {
                    id: 2,
                    usuarioId: user?.id || 0,
                    total: 75.00,
                    estado: 'pendiente',
                    fechaCreacion: new Date('2025-01-18'),
                    createdAt: new Date('2025-01-18'),
                    updatedAt: new Date('2025-01-18'),
                    items: [
                        {
                            id: 3,
                            ordenId: 2,
                            productoId: 3,
                            cantidad: 3,
                            precio: 25.00,
                            producto: {
                                id: 3,
                                nombre: 'Producto Example 3',
                                precio: 25.00,
                                imagen: '/placeholder.png',
                                descripcion: 'Descripción del producto',
                                stock: 15,
                                emprendedorId: 2,
                                categoriaId: 2,
                                fechaCreacion: new Date()
                            }
                        }
                    ]
                }
            ];

            setOrdenes(ordenesSimuladas);
        } catch (err) {
            console.error('Error al cargar órdenes:', err);
            setError('No se pudieron cargar las órdenes');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetalle = (orden: Orden) => {
        setSelectedOrden(orden);
    };

    const handleCloseDetalle = () => {
        setSelectedOrden(null);
    };

    const getEstadoBadgeClass = (estado: string) => {
        switch (estado) {
            case 'completada': return 'estado-completada';
            case 'pendiente': return 'estado-pendiente';
            case 'cancelada': return 'estado-cancelada';
            default: return 'estado-default';
        }
    };

    const getEstadoIcon = (estado: string) => {
        switch (estado) {
            case 'completada': return 'fa-check-circle';
            case 'pendiente': return 'fa-clock';
            case 'cancelada': return 'fa-times-circle';
            default: return 'fa-info-circle';
        }
    };

    const filteredOrdenes = ordenes.filter(orden => {
        if (filter === 'todas') return true;
        return orden.estado === filter;
    });

    if (!isAuthenticated) {
        return (
            <div className="ordenes-page">
                <div className="container">
                    <div className="not-logged-in">
                        <i className="fas fa-user-slash"></i>
                        <h2>No has iniciado sesión</h2>
                        <p>Por favor, inicia sesión para ver tus órdenes</p>
                        <a href="/login" className="btn-primary">Iniciar Sesión</a>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="ordenes-page">
                <div className="container">
                    <div className="loading-container">
                        <i className="fas fa-spinner fa-spin"></i>
                        <p>Cargando órdenes...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="ordenes-page">
                <div className="container">
                    <div className="error-container">
                        <i className="fas fa-exclamation-circle"></i>
                        <h2>Error</h2>
                        <p>{error}</p>
                        <button onClick={loadOrdenes} className="btn-primary">
                            Reintentar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="ordenes-page">
            <div className="container">
                <div className="ordenes-header">
                    <h1>
                        <i className="fas fa-box"></i> Mis Órdenes
                    </h1>
                    <p className="subtitle">Historial de todas tus compras</p>
                </div>

                {/* Filtros */}
                <div className="ordenes-filters">
                    <button
                        className={`filter-btn ${filter === 'todas' ? 'active' : ''}`}
                        onClick={() => setFilter('todas')}
                    >
                        <i className="fas fa-list"></i> Todas ({ordenes.length})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'pendiente' ? 'active' : ''}`}
                        onClick={() => setFilter('pendiente')}
                    >
                        <i className="fas fa-clock"></i> Pendientes ({ordenes.filter(o => o.estado === 'pendiente').length})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'completada' ? 'active' : ''}`}
                        onClick={() => setFilter('completada')}
                    >
                        <i className="fas fa-check-circle"></i> Completadas ({ordenes.filter(o => o.estado === 'completada').length})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'cancelada' ? 'active' : ''}`}
                        onClick={() => setFilter('cancelada')}
                    >
                        <i className="fas fa-times-circle"></i> Canceladas ({ordenes.filter(o => o.estado === 'cancelada').length})
                    </button>
                </div>

                {/* Lista de Órdenes */}
                {filteredOrdenes.length === 0 ? (
                    <div className="empty-state">
                        <i className="fas fa-inbox"></i>
                        <h2>No hay órdenes {filter !== 'todas' ? filter + 's' : ''}</h2>
                        <p>Comienza a explorar productos y realiza tu primera compra</p>
                        <a href="/" className="btn-primary">
                            <i className="fas fa-shopping-bag"></i> Ver Productos
                        </a>
                    </div>
                ) : (
                    <div className="ordenes-list">
                        {filteredOrdenes.map((orden) => (
                            <div key={orden.id} className="orden-card">
                                <div className="orden-header">
                                    <div className="orden-info">
                                        <h3>
                                            <i className="fas fa-receipt"></i> Orden #{orden.id}
                                        </h3>
                                        <p className="orden-fecha">
                                            <i className="fas fa-calendar-alt"></i>
                                            {orden.fechaCreacion ? new Date(orden.fechaCreacion).toLocaleDateString('es-ES', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            }) : 'Fecha no disponible'}
                                        </p>
                                    </div>
                                    <div className="orden-status">
                                        <span className={`estado-badge ${getEstadoBadgeClass(orden.estado)}`}>
                                            <i className={`fas ${getEstadoIcon(orden.estado)}`}></i>
                                            {orden.estado.charAt(0).toUpperCase() + orden.estado.slice(1)}
                                        </span>
                                    </div>
                                </div>

                                <div className="orden-items">
                                    {orden.items?.slice(0, 3).map((item) => (
                                        <div key={item.id} className="orden-item">
                                            <img 
                                                src={item.producto?.imagen || '/placeholder.png'} 
                                                alt={item.producto?.nombre}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = '/placeholder.png';
                                                }}
                                            />
                                            <div className="item-details">
                                                <p className="item-name">{item.producto?.nombre}</p>
                                                <p className="item-quantity">Cantidad: {item.cantidad}</p>
                                            </div>
                                            <div className="item-price">
                                                ${(item.precio * item.cantidad).toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                    {(orden.items?.length || 0) > 3 && (
                                        <p className="more-items">
                                            + {(orden.items?.length || 0) - 3} producto(s) más
                                        </p>
                                    )}
                                </div>

                                <div className="orden-footer">
                                    <div className="orden-total">
                                        <span>Total:</span>
                                        <span className="total-amount">${orden.total.toFixed(2)}</span>
                                    </div>
                                    <button
                                        onClick={() => handleViewDetalle(orden)}
                                        className="btn-view-details"
                                    >
                                        <i className="fas fa-eye"></i> Ver Detalles
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de Detalle */}
            {selectedOrden && (
                <div className="modal-overlay" onClick={handleCloseDetalle}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                <i className="fas fa-receipt"></i> Detalle de Orden #{selectedOrden.id}
                            </h2>
                            <button onClick={handleCloseDetalle} className="btn-close">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="detalle-info">
                                <div className="info-row">
                                    <span className="label">Fecha:</span>
                                    <span className="value">
                                        {selectedOrden.fechaCreacion ? new Date(selectedOrden.fechaCreacion).toLocaleDateString('es-ES', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }) : 'Fecha no disponible'}
                                    </span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Estado:</span>
                                    <span className={`estado-badge ${getEstadoBadgeClass(selectedOrden.estado)}`}>
                                        <i className={`fas ${getEstadoIcon(selectedOrden.estado)}`}></i>
                                        {selectedOrden.estado.charAt(0).toUpperCase() + selectedOrden.estado.slice(1)}
                                    </span>
                                </div>
                            </div>

                            <div className="detalle-items">
                                <h3>Productos</h3>
                                {selectedOrden.items?.map((item) => (
                                    <div key={item.id} className="detalle-item">
                                        <img 
                                            src={item.producto?.imagen || '/placeholder.png'} 
                                            alt={item.producto?.nombre}
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = '/placeholder.png';
                                            }}
                                        />
                                        <div className="item-info">
                                            <p className="item-name">{item.producto?.nombre}</p>
                                            <p className="item-quantity">Cantidad: {item.cantidad} × ${item.precio.toFixed(2)}</p>
                                        </div>
                                        <div className="item-subtotal">
                                            ${(item.precio * item.cantidad).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="detalle-total">
                                <div className="total-row">
                                    <span>Subtotal:</span>
                                    <span>${selectedOrden.total.toFixed(2)}</span>
                                </div>
                                <div className="total-row">
                                    <span>Envío:</span>
                                    <span className="free">Gratis</span>
                                </div>
                                <div className="total-row final">
                                    <span>Total:</span>
                                    <span>${selectedOrden.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

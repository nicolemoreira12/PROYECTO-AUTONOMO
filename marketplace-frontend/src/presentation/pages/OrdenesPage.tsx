import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks';
import { Orden } from '@domain/entities';
import { httpClient } from '@infrastructure/api/http-client';
import './OrdenesPage.css';

// Helper para formatear precios de forma segura
const formatPrice = (value: number | string | undefined): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return (num ?? 0).toFixed(2);
};

// Interfaz para la orden del backend
interface OrdenBackend {
    idOrden: number;
    fechaOrden: string;
    estado: string;
    total: number | string;
    metodoPago?: string;
    usuario?: {
        id: number;
        nombre: string;
        email: string;
    };
    detalles?: Array<{
        idDetalle: number;
        cantidad: number;
        precioUnitario: number | string;
        subtotal: number | string;
        producto: {
            idProducto: number;
            nombreProducto: string;
            imagenURL: string;
            precio: number | string;
        };
    }>;
}

export const OrdenesPage: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    const [ordenes, setOrdenes] = useState<OrdenBackend[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrden, setSelectedOrden] = useState<OrdenBackend | null>(null);
    const [filter, setFilter] = useState<'todas' | 'pendiente' | 'completado' | 'cancelado'>('todas');

    useEffect(() => {
        if (isAuthenticated) {
            loadOrdenes();
        }
    }, [isAuthenticated]);

    const loadOrdenes = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError(null);

            // Llamada real al backend
            const data = await httpClient.get<OrdenBackend[]>('/orden');

            // Ordenar por fecha (más recientes primero)
            const ordenesOrdenadas = data.sort((a, b) => {
                const fechaA = new Date(a.fechaOrden).getTime();
                const fechaB = new Date(b.fechaOrden).getTime();
                return fechaB - fechaA; // Descendente (más recientes primero)
            });

            console.log('📦 Órdenes cargadas:', ordenesOrdenadas.length);
            setOrdenes(ordenesOrdenadas);
        } catch (err: any) {
            console.error('Error al cargar órdenes:', err);
            setError('No se pudieron cargar las órdenes');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        loadOrdenes(true);
    };

    const handleViewDetalle = (orden: OrdenBackend) => {
        setSelectedOrden(orden);
    };

    const handleCloseDetalle = () => {
        setSelectedOrden(null);
    };

    const getEstadoBadgeClass = (estado: string) => {
        switch (estado.toLowerCase()) {
            case 'completado':
            case 'completada': return 'estado-completada';
            case 'pendiente': return 'estado-pendiente';
            case 'cancelado':
            case 'cancelada': return 'estado-cancelada';
            case 'procesando': return 'estado-procesando';
            default: return 'estado-default';
        }
    };

    const getEstadoIcon = (estado: string) => {
        switch (estado.toLowerCase()) {
            case 'completado':
            case 'completada': return 'fa-check-circle';
            case 'pendiente': return 'fa-clock';
            case 'cancelado':
            case 'cancelada': return 'fa-times-circle';
            case 'procesando': return 'fa-spinner fa-spin';
            default: return 'fa-info-circle';
        }
    };

    const filteredOrdenes = ordenes.filter(orden => {
        if (filter === 'todas') return true;
        return orden.estado.toLowerCase() === filter.toLowerCase();
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
                    <div className="header-title">
                        <h1>
                            <i className="fas fa-box"></i> Mis Órdenes
                        </h1>
                        <p className="subtitle">Historial de todas tus compras</p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        className="btn-refresh"
                        disabled={refreshing}
                        title="Actualizar órdenes"
                    >
                        <i className={`fas fa-sync-alt ${refreshing ? 'fa-spin' : ''}`}></i>
                        {refreshing ? 'Actualizando...' : 'Actualizar'}
                    </button>
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
                        <i className="fas fa-clock"></i> Pendientes ({ordenes.filter(o => o.estado.toLowerCase() === 'pendiente').length})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'completado' ? 'active' : ''}`}
                        onClick={() => setFilter('completado')}
                    >
                        <i className="fas fa-check-circle"></i> Completadas ({ordenes.filter(o => o.estado.toLowerCase() === 'completado' || o.estado.toLowerCase() === 'completada').length})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'cancelado' ? 'active' : ''}`}
                        onClick={() => setFilter('cancelado')}
                    >
                        <i className="fas fa-times-circle"></i> Canceladas ({ordenes.filter(o => o.estado.toLowerCase() === 'cancelado' || o.estado.toLowerCase() === 'cancelada').length})
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
                            <div key={orden.idOrden} className="orden-card">
                                <div className="orden-header">
                                    <div className="orden-info">
                                        <h3>
                                            <i className="fas fa-receipt"></i> Orden #{orden.idOrden}
                                        </h3>
                                        <p className="orden-fecha">
                                            <i className="fas fa-calendar-alt"></i>
                                            {orden.fechaOrden ? new Date(orden.fechaOrden).toLocaleDateString('es-ES', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
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
                                    {orden.detalles?.slice(0, 3).map((detalle) => (
                                        <div key={detalle.idDetalle} className="orden-item">
                                            <img
                                                src={detalle.producto?.imagenURL || '/placeholder.png'}
                                                alt={detalle.producto?.nombreProducto}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = '/placeholder.png';
                                                }}
                                            />
                                            <div className="item-details">
                                                <p className="item-name">{detalle.producto?.nombreProducto}</p>
                                                <p className="item-quantity">Cantidad: {detalle.cantidad}</p>
                                            </div>
                                            <div className="item-price">
                                                ${formatPrice(detalle.subtotal)}
                                            </div>
                                        </div>
                                    ))}
                                    {(orden.detalles?.length || 0) > 3 && (
                                        <p className="more-items">
                                            + {(orden.detalles?.length || 0) - 3} producto(s) más
                                        </p>
                                    )}
                                    {(!orden.detalles || orden.detalles.length === 0) && (
                                        <p className="no-items">Sin detalles de productos</p>
                                    )}
                                </div>

                                <div className="orden-footer">
                                    <div className="orden-total">
                                        <span>Total:</span>
                                        <span className="total-amount">${formatPrice(orden.total)}</span>
                                    </div>
                                    <div className="orden-actions">
                                        <button
                                            onClick={() => handleViewDetalle(orden)}
                                            className="btn-view-details"
                                        >
                                            <i className="fas fa-eye"></i> Ver Detalles
                                        </button>
                                        <a href={`/orden/${orden.idOrden}`} className="btn-full-details">
                                            <i className="fas fa-external-link-alt"></i> Página Completa
                                        </a>
                                    </div>
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
                                <i className="fas fa-receipt"></i> Detalle de Orden #{selectedOrden.idOrden}
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
                                        {selectedOrden.fechaOrden ? new Date(selectedOrden.fechaOrden).toLocaleDateString('es-ES', {
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
                                {selectedOrden.metodoPago && (
                                    <div className="info-row">
                                        <span className="label">Método de Pago:</span>
                                        <span className="value">{selectedOrden.metodoPago}</span>
                                    </div>
                                )}
                            </div>

                            <div className="detalle-items">
                                <h3>Productos</h3>
                                {selectedOrden.detalles?.map((detalle) => (
                                    <div key={detalle.idDetalle} className="detalle-item">
                                        <img
                                            src={detalle.producto?.imagenURL || '/placeholder.png'}
                                            alt={detalle.producto?.nombreProducto}
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = '/placeholder.png';
                                            }}
                                        />
                                        <div className="item-info">
                                            <p className="item-name">{detalle.producto?.nombreProducto}</p>
                                            <p className="item-quantity">Cantidad: {detalle.cantidad} × ${formatPrice(detalle.precioUnitario)}</p>
                                        </div>
                                        <div className="item-subtotal">
                                            ${formatPrice(detalle.subtotal)}
                                        </div>
                                    </div>
                                ))}
                                {(!selectedOrden.detalles || selectedOrden.detalles.length === 0) && (
                                    <p className="no-items">Sin detalles de productos disponibles</p>
                                )}
                            </div>

                            <div className="detalle-total">
                                <div className="total-row">
                                    <span>Subtotal:</span>
                                    <span>${formatPrice(selectedOrden.total)}</span>
                                </div>
                                <div className="total-row">
                                    <span>Envío:</span>
                                    <span className="free">Gratis</span>
                                </div>
                                <div className="total-row final">
                                    <span>Total:</span>
                                    <span>${formatPrice(selectedOrden.total)}</span>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <a href={`/orden/${selectedOrden.idOrden}`} className="btn-primary">
                                    <i className="fas fa-external-link-alt"></i> Ver Página Completa
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

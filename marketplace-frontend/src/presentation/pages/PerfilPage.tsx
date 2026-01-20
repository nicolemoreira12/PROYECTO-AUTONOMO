import React, { useState } from 'react';
import { useAuth } from '../hooks';
import './PerfilPage.css';

export const PerfilPage: React.FC = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        nombre: user?.nombre || '',
        email: user?.email || '',
        telefono: user?.telefono || '',
        direccion: user?.direccion || '',
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.nombre.trim()) {
            setMessage({ type: 'error', text: 'El nombre es obligatorio' });
            return;
        }

        if (!formData.email.trim()) {
            setMessage({ type: 'error', text: 'El email es obligatorio' });
            return;
        }

        try {
            setSaving(true);
            setMessage(null);
            
            // Aquí iría la lógica para actualizar el usuario
            // await updateUser(formData);
            
            // Simulación
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setMessage({ type: 'success', text: '✅ Perfil actualizado correctamente' });
            setIsEditing(false);
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            setMessage({ type: 'error', text: '❌ Error al actualizar el perfil' });
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setFormData({
            nombre: user?.nombre || '',
            email: user?.email || '',
            telefono: user?.telefono || '',
            direccion: user?.direccion || '',
        });
        setIsEditing(false);
        setMessage(null);
    };

    if (!user) {
        return (
            <div className="perfil-page">
                <div className="container">
                    <div className="not-logged-in">
                        <i className="fas fa-user-slash"></i>
                        <h2>No has iniciado sesión</h2>
                        <p>Por favor, inicia sesión para ver tu perfil</p>
                        <a href="/login" className="btn-primary">Iniciar Sesión</a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="perfil-page">
            <div className="container">
                <div className="perfil-header">
                    <div className="perfil-avatar">
                        <div className="avatar-circle">
                            <i className="fas fa-user"></i>
                        </div>
                    </div>
                    <div className="perfil-header-info">
                        <h1>{user.nombre}</h1>
                        <p className="user-role">
                            <i className={`fas fa-${user.rol === 'emprendedor' ? 'store' : 'user'}`}></i>
                            {user.rol === 'emprendedor' ? 'Emprendedor' : 'Usuario'}
                        </p>
                    </div>
                </div>

                {message && (
                    <div className={`alert alert-${message.type}`}>
                        {message.text}
                    </div>
                )}

                <div className="perfil-content">
                    {/* Información Personal */}
                    <div className="perfil-section">
                        <div className="section-header">
                            <h2>
                                <i className="fas fa-user-circle"></i>
                                Información Personal
                            </h2>
                            {!isEditing && (
                                <button 
                                    onClick={() => setIsEditing(true)} 
                                    className="btn-edit"
                                >
                                    <i className="fas fa-edit"></i> Editar
                                </button>
                            )}
                        </div>

                        {isEditing ? (
                            <form onSubmit={handleSubmit} className="perfil-form">
                                <div className="form-group">
                                    <label htmlFor="nombre">
                                        <i className="fas fa-user"></i> Nombre Completo
                                    </label>
                                    <input
                                        id="nombre"
                                        name="nombre"
                                        type="text"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        placeholder="Tu nombre completo"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">
                                        <i className="fas fa-envelope"></i> Email
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="tu@email.com"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="telefono">
                                        <i className="fas fa-phone"></i> Teléfono
                                    </label>
                                    <input
                                        id="telefono"
                                        name="telefono"
                                        type="tel"
                                        value={formData.telefono}
                                        onChange={handleChange}
                                        placeholder="+593 99 999 9999"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="direccion">
                                        <i className="fas fa-map-marker-alt"></i> Dirección
                                    </label>
                                    <textarea
                                        id="direccion"
                                        name="direccion"
                                        value={formData.direccion}
                                        onChange={handleChange}
                                        placeholder="Tu dirección completa"
                                        rows={3}
                                    />
                                </div>

                                <div className="form-actions">
                                    <button 
                                        type="submit" 
                                        className="btn-primary"
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <>
                                                <i className="fas fa-spinner fa-spin"></i> Guardando...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-save"></i> Guardar Cambios
                                            </>
                                        )}
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={handleCancelEdit}
                                        className="btn-secondary"
                                        disabled={saving}
                                    >
                                        <i className="fas fa-times"></i> Cancelar
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="perfil-info-display">
                                <div className="info-row">
                                    <div className="info-label">
                                        <i className="fas fa-user"></i> Nombre:
                                    </div>
                                    <div className="info-value">{user.nombre}</div>
                                </div>

                                <div className="info-row">
                                    <div className="info-label">
                                        <i className="fas fa-envelope"></i> Email:
                                    </div>
                                    <div className="info-value">{user.email}</div>
                                </div>

                                <div className="info-row">
                                    <div className="info-label">
                                        <i className="fas fa-phone"></i> Teléfono:
                                    </div>
                                    <div className="info-value">
                                        {user.telefono || <span className="text-muted">No especificado</span>}
                                    </div>
                                </div>

                                <div className="info-row">
                                    <div className="info-label">
                                        <i className="fas fa-map-marker-alt"></i> Dirección:
                                    </div>
                                    <div className="info-value">
                                        {user.direccion || <span className="text-muted">No especificada</span>}
                                    </div>
                                </div>

                                <div className="info-row">
                                    <div className="info-label">
                                        <i className="fas fa-id-card"></i> Tipo de Cuenta:
                                    </div>
                                    <div className="info-value">
                                        <span className={`role-badge ${user.rol}`}>
                                            {user.rol === 'emprendedor' ? 'Emprendedor' : 'Usuario'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Estadísticas */}
                    <div className="perfil-section">
                        <div className="section-header">
                            <h2>
                                <i className="fas fa-chart-line"></i>
                                Estadísticas
                            </h2>
                        </div>

                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <i className="fas fa-shopping-bag"></i>
                                </div>
                                <div className="stat-content">
                                    <div className="stat-value">0</div>
                                    <div className="stat-label">Compras Realizadas</div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">
                                    <i className="fas fa-heart"></i>
                                </div>
                                <div className="stat-content">
                                    <div className="stat-value">0</div>
                                    <div className="stat-label">Favoritos</div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">
                                    <i className="fas fa-star"></i>
                                </div>
                                <div className="stat-content">
                                    <div className="stat-value">0</div>
                                    <div className="stat-label">Reseñas</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Acciones Rápidas */}
                    <div className="perfil-section">
                        <div className="section-header">
                            <h2>
                                <i className="fas fa-bolt"></i>
                                Acciones Rápidas
                            </h2>
                        </div>

                        <div className="quick-actions">
                            <a href="/ordenes" className="action-card">
                                <i className="fas fa-box"></i>
                                <span>Mis Órdenes</span>
                            </a>

                            <a href="/carrito" className="action-card">
                                <i className="fas fa-shopping-cart"></i>
                                <span>Ver Carrito</span>
                            </a>

                            <a href="/" className="action-card">
                                <i className="fas fa-store"></i>
                                <span>Ir a Productos</span>
                            </a>

                            {user.rol === 'emprendedor' && (
                                <a href="/emprendedor" className="action-card">
                                    <i className="fas fa-briefcase"></i>
                                    <span>Mi Negocio</span>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

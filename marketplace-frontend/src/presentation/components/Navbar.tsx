import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks';
import { useCarrito } from '../hooks';

export const Navbar: React.FC = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const { totalItems } = useCarrito();

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">
                    <h1>Marketplace</h1>
                </Link>

                <div className="navbar-menu">
                    <Link to="/" className="nav-link">Productos</Link>

                    {isAuthenticated ? (
                        <>
                            <Link to="/carrito" className="nav-link">
                                Carrito {totalItems > 0 && <span className="badge">{totalItems}</span>}
                            </Link>
                            <Link to="/ordenes" className="nav-link">Mis Órdenes</Link>

                            {user?.rol === 'emprendedor' && (
                                <Link to="/emprendedor" className="nav-link">Mi Negocio</Link>
                            )}

                            <div className="nav-user">
                                <span>Hola, {user?.nombre}</span>
                                <button onClick={logout} className="btn-logout">
                                    Cerrar Sesión
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link btn-primary">
                                Iniciar Sesión
                            </Link>
                            <Link to="/register" className="nav-link btn-secondary">
                                Registrarse
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

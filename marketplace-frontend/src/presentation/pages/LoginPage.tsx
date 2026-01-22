import React, { useState } from 'react';
import { useAuth } from '../hooks';

export const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rol, setRol] = useState<'usuario' | 'emprendedor'>('usuario'); // Por defecto 'usuario' (Comprador)
    const { login, loading, error } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(email, password, rol);
        } catch (err) {
            // Error manejado por el hook
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <h2>Iniciar Sesión</h2>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu@email.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Tu contraseña"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Ingresar como:</label>
                        <div className="role-selector">
                            <label>
                                <input
                                    type="radio"
                                    name="rol"
                                    value="usuario"
                                    checked={rol === 'usuario'}
                                    onChange={() => setRol('usuario')}
                                />
                                Comprador
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="rol"
                                    value="emprendedor"
                                    checked={rol === 'emprendedor'}
                                    onChange={() => setRol('emprendedor')}
                                />
                                Vendedor
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary btn-block"
                        disabled={loading}
                    >
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>¿No tienes cuenta? <a href="/register">Regístrate aquí</a></p>
                </div>
            </div>
        </div>
    );
};

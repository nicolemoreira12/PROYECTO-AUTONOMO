import React, { useState } from 'react';
import { useAuth } from '../hooks';

export const RegisterPage: React.FC = () => {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [rol, setRol] = useState<'usuario' | 'emprendedor'>('usuario');
    const { register, loading, error } = useAuth();
    const [formError, setFormError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setSuccessMessage(null);

        if (password !== confirmPassword) {
            setFormError('Las contraseñas no coinciden');
            return;
        }

        if (password.length < 8) {
            setFormError('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        // Validar mayúscula
        if (!/[A-Z]/.test(password)) {
            setFormError('La contraseña debe contener al menos una letra mayúscula');
            return;
        }

        // Validar carácter especial
        if (!/[@$!%*?&]/.test(password)) {
            setFormError('La contraseña debe contener al menos un carácter especial (@$!%*?&)');
            return;
        }

        console.log('📝 Intentando registrar usuario:', { nombre, email, rol });

        try {
            await register({ nombre, email, password, rol });
            console.log('✅ Registro exitoso');
            setSuccessMessage('¡Registro exitoso! Serás redirigido al inicio de sesión...');
        } catch (err) {
            console.error('❌ Error en el registro:', err);
            // Error manejado por el hook
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <h2>Registrarse</h2>

                {successMessage && (
                    <div className="alert alert-success">{successMessage}</div>
                )}

                {(error || formError) && (
                    <div className="alert alert-error">{error || formError}</div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="nombre">Nombre Completo</label>
                        <input
                            id="nombre"
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Juan Pérez"
                            required
                        />
                    </div>

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
                            placeholder="Mínimo 8 caracteres, 1 mayúscula, 1 carácter especial"
                            required
                            minLength={8}
                        />
                        <small style={{ color: '#666', fontSize: '0.875rem' }}>
                            Debe contener: 8+ caracteres, 1 mayúscula, 1 carácter especial (@$!%*?&)
                        </small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repite tu contraseña"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="rol">Tipo de Cuenta</label>
                        <select
                            id="rol"
                            value={rol}
                            onChange={(e) => setRol(e.target.value as 'usuario' | 'emprendedor')}
                        >
                            <option value="usuario">Usuario (Comprador)</option>
                            <option value="emprendedor">Emprendedor (Vendedor)</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary btn-block"
                        disabled={loading}
                    >
                        {loading ? 'Registrando...' : 'Registrarse'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>¿Ya tienes cuenta? <a href="/login">Inicia sesión aquí</a></p>
                </div>
            </div>
        </div>
    );
};

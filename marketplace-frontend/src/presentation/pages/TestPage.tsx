import React, { useState } from 'react';
import axios from 'axios';

export const TestPage: React.FC = () => {
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const testBackend = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:3000/api/productos');
            setStatus({
                success: true,
                message: 'Conexión exitosa',
                data: response.data,
                count: response.data?.length || 0
            });
        } catch (error: any) {
            setStatus({
                success: false,
                message: error.message,
                error: error.response?.data || error.toString()
            });
        } finally {
            setLoading(false);
        }
    };

    const testAuth = async () => {
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:3000/api/auth/login', {
                email: 'test@test.com',
                password: 'test123'
            });
            setStatus({
                success: true,
                message: 'Login exitoso',
                data: response.data
            });
        } catch (error: any) {
            setStatus({
                success: false,
                message: error.message,
                error: error.response?.data || error.toString()
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1>Página de Prueba de Conexión</h1>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button 
                    onClick={testBackend}
                    disabled={loading}
                    style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    {loading ? 'Probando...' : 'Probar Productos'}
                </button>

                <button 
                    onClick={testAuth}
                    disabled={loading}
                    style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    {loading ? 'Probando...' : 'Probar Login'}
                </button>
            </div>

            {status && (
                <div style={{
                    padding: '1rem',
                    backgroundColor: status.success ? '#d1fae5' : '#fee2e2',
                    border: `1px solid ${status.success ? '#10b981' : '#ef4444'}`,
                    borderRadius: '4px'
                }}>
                    <h3>{status.success ? '✅ Éxito' : '❌ Error'}</h3>
                    <p><strong>Mensaje:</strong> {status.message}</p>
                    {status.count !== undefined && (
                        <p><strong>Productos encontrados:</strong> {status.count}</p>
                    )}
                    <details style={{ marginTop: '1rem' }}>
                        <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                            Ver detalles
                        </summary>
                        <pre style={{
                            backgroundColor: '#f5f5f5',
                            padding: '1rem',
                            borderRadius: '4px',
                            overflow: 'auto',
                            marginTop: '0.5rem',
                            fontSize: '0.875rem'
                        }}>
                            {JSON.stringify(status, null, 2)}
                        </pre>
                    </details>
                </div>
            )}
        </div>
    );
};

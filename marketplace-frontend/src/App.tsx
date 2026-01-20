import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar, ProtectedRoute } from '@presentation/components';
import { HomePage, LoginPage, RegisterPage, CarritoPage, TestPage } from '@presentation/pages';
import { useAuthStore } from '@presentation/store';

function App() {
    const { loadFromStorage } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Cargar datos de autenticación del localStorage al iniciar
        try {
            loadFromStorage();
            setIsLoading(false);
        } catch (err) {
            console.error('Error al cargar autenticación:', err);
            setError('Error al inicializar la aplicación');
            setIsLoading(false);
        }
    }, []);

    if (isLoading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                fontSize: '1.5rem'
            }}>
                Cargando...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <h2>Error</h2>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <BrowserRouter>
            <div className="app">
                <Navbar />
                <main className="main-content">
                    <Routes>
                        {/* Rutas públicas */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/test" element={<TestPage />} />

                        {/* Rutas protegidas */}
                        <Route
                            path="/carrito"
                            element={
                                <ProtectedRoute>
                                    <CarritoPage />
                                </ProtectedRoute>
                            }
                        />

                        {/* Ruta por defecto */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;

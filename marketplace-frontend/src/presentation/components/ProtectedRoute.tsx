import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'usuario' | 'emprendedor' | 'admin';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
    const { isAuthenticated, user } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Validar rol si se especifica
    if (requiredRole && user?.rol !== requiredRole) {
        // Redirigir a la página apropiada según su rol
        if (user?.rol === 'emprendedor') {
            return <Navigate to="/emprendedor" replace />;
        }
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

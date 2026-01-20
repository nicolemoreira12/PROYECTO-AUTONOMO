import React, { useEffect, useState } from 'react';
import { webSocketService } from '@infrastructure/services';
import './ConnectionStatus.css';

interface ConnectionStatusProps {
    onClientsChange?: (count: number) => void;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ onClientsChange }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [clientsOnline, setClientsOnline] = useState(1);
    const [hasError, setHasError] = useState(false);
    const [showCount, setShowCount] = useState(true);

    useEffect(() => {
        // Intentar conectar WebSocket
        try {
            webSocketService.connect();
            setHasError(false);
        } catch (error) {
            console.warn('WebSocket no disponible:', error);
            setHasError(true);
        }

        // Escuchar cambios de conexión
        const handleConnectionChange = (connected: boolean) => {
            setIsConnected(connected);
            setHasError(!connected);
        };

        // Escuchar actualizaciones de clientes
        const handleClientsCount = (data: any) => {
            const count = data.count || data.clientsOnline || 1;
            // Asegurar que el mínimo sea 1 y máximo razonable
            const realCount = Math.max(1, Math.min(count, 999));
            setClientsOnline(realCount);
            onClientsChange?.(realCount);
        };

        webSocketService.onConnectionChange(handleConnectionChange);
        webSocketService.on('clients_count', handleClientsCount);

        // Cleanup
        return () => {
            webSocketService.offConnectionChange(handleConnectionChange);
            webSocketService.off('clients_count', handleClientsCount);
        };
    }, [onClientsChange]);

    // Si hay error, mostrar solo en consola, no en UI
    if (hasError && !isConnected) {
        return null; // No mostrar nada si hay error
    }

    return (
        <div className="connection-status">
            <div className={`status-dot ${isConnected ? 'online' : 'offline'}`}></div>
            <span className="status-text">
                {isConnected ? 'En línea' : 'Modo local'}
            </span>
            {showCount && (
                <span className="clients-count">
                    <i className="fas fa-users"></i> {clientsOnline}
                </span>
            )}
        </div>
    );
};

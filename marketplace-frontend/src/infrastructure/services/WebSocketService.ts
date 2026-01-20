import { MICROSERVICES } from '../api/microservices.config';

export type WebSocketMessageType = 
    | 'producto_nuevo'
    | 'producto_actualizado'
    | 'orden_nueva'
    | 'orden_actualizada'
    | 'pago_completado'
    | 'notificacion'
    | 'stats_update'
    | 'clients_count';

export interface WebSocketMessage {
    type: WebSocketMessageType;
    data: any;
    timestamp?: string;
}

export class WebSocketService {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectTimeout: number | null = null;
    private listeners: Map<WebSocketMessageType, Set<(data: any) => void>> = new Map();
    private connectionListeners: Set<(connected: boolean) => void> = new Set();
    public clientId: string | null = null;
    private isIntentionalClose = false;

    connect() {
        if (this.ws?.readyState === WebSocket.OPEN) {
            console.log('WebSocket ya está conectado');
            return;
        }

        this.isIntentionalClose = false;

        try {
            console.log('Conectando a WebSocket:', MICROSERVICES.WEBSOCKET);
            this.ws = new WebSocket(MICROSERVICES.WEBSOCKET);

            this.ws.onopen = () => {
                console.log('✅ WebSocket conectado');
                this.reconnectAttempts = 0;
                this.notifyConnectionChange(true);
            };

            this.ws.onmessage = (event) => {
                try {
                    const message: WebSocketMessage = JSON.parse(event.data);
                    
                    // Guardar clientId si viene en el mensaje
                    if (message.type === 'clients_count' && message.data.clientId) {
                        this.clientId = message.data.clientId;
                    }

                    this.handleMessage(message);
                } catch (error) {
                    console.error('Error al parsear mensaje WebSocket:', error);
                }
            };

            this.ws.onerror = (error) => {
                console.error('❌ Error WebSocket:', error);
            };

            this.ws.onclose = () => {
                console.log('WebSocket desconectado');
                this.notifyConnectionChange(false);
                
                // Solo reintentar si no fue un cierre intencional
                if (!this.isIntentionalClose) {
                    this.attemptReconnect();
                }
            };
        } catch (error) {
            console.error('Error al conectar WebSocket:', error);
            this.attemptReconnect();
        }
    }

    private handleMessage(message: WebSocketMessage) {
        const listeners = this.listeners.get(message.type);
        if (listeners) {
            listeners.forEach(callback => callback(message.data));
        }
    }

    private attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Máximo de intentos de reconexión alcanzado');
            return;
        }

        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
        
        console.log(`Reintentando conexión en ${delay}ms (intento ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        
        this.reconnectTimeout = setTimeout(() => {
            this.connect();
        }, delay);
    }

    on(type: WebSocketMessageType, callback: (data: any) => void) {
        if (!this.listeners.has(type)) {
            this.listeners.set(type, new Set());
        }
        this.listeners.get(type)!.add(callback);
    }

    off(type: WebSocketMessageType, callback: (data: any) => void) {
        const listeners = this.listeners.get(type);
        if (listeners) {
            listeners.delete(callback);
        }
    }

    onConnectionChange(callback: (connected: boolean) => void) {
        this.connectionListeners.add(callback);
    }

    offConnectionChange(callback: (connected: boolean) => void) {
        this.connectionListeners.delete(callback);
    }

    private notifyConnectionChange(connected: boolean) {
        this.connectionListeners.forEach(callback => callback(connected));
    }

    send(type: string, data: any) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type, data }));
        } else {
            console.warn('WebSocket no está conectado');
        }
    }

    disconnect() {
        this.isIntentionalClose = true;
        
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
        
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        
        this.listeners.clear();
        this.connectionListeners.clear();
    }

    get isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }
}

// Instancia singleton
export const webSocketService = new WebSocketService();

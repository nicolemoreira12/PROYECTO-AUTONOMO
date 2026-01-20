// Configuración centralizada de microservicios
export const MICROSERVICES = {
    // WebSocket Server - Tiempo Real
    WEBSOCKET: import.meta.env.VITE_WEBSOCKET_URL || 'ws://127.0.0.1:8000',
    
    // Marketplace API - Productos, Órdenes
    MARKETPLACE: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    
    // Auth Service - Autenticación
    AUTH: import.meta.env.VITE_AUTH_URL || 'http://localhost:4000',
    
    // Payment Service - Pagos
    PAYMENT: import.meta.env.VITE_PAYMENT_URL || 'http://localhost:5000',
    
    // AI Orchestrator - Asistente IA
    AI_ORCHESTRATOR: import.meta.env.VITE_AI_ORCHESTRATOR_URL || 'http://localhost:6000',
    
    // n8n - Workflows automáticos
    N8N: import.meta.env.VITE_N8N_URL || 'http://localhost:5678',
    
    // GraphQL Endpoint
    GRAPHQL: import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:3000/graphql',
} as const;

export type MicroserviceKey = keyof typeof MICROSERVICES;

export interface ServiceHealth {
    name: string;
    status: 'online' | 'offline' | 'checking';
    url: string;
    lastCheck?: Date;
}

"use strict";
/**
 * Servicio de Integración Marketplace ↔ WebSocket
 *
 * Este archivo facilita la comunicación entre el Marketplace TypeScript
 * y el servidor WebSocket integrado
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.marketplaceWS = exports.MarketplaceWebSocketIntegration = void 0;
const WebSocket = __importStar(require("ws"));
class MarketplaceWebSocketIntegration {
    constructor(config = {}) {
        this.ws = null;
        this.eventHandlers = new Map();
        this.reconnectAttempts = 0;
        this.clientId = null;
        this.reconnectTimeout = null;
        this.config = {
            url: config.url || "ws://localhost:3000",
            reconnectAttempts: config.reconnectAttempts || 5,
            reconnectDelay: config.reconnectDelay || 3000,
            debug: config.debug || true
        };
    }
    /**
     * Conectar al servidor WebSocket
     */
    connect() {
        return new Promise((resolve, reject) => {
            try {
                this.log(`🔄 Conectando a ${this.config.url}...`);
                this.ws = new WebSocket(this.config.url);
                this.ws.on("open", () => {
                    this.reconnectAttempts = 0;
                    this.log("✅ Conectado al servidor WebSocket");
                    resolve();
                });
                this.ws.on("message", (message) => {
                    this.handleMessage(message);
                });
                this.ws.on("close", () => {
                    this.log("❌ Desconectado del servidor");
                    this.attemptReconnect();
                });
                this.ws.on("error", (error) => {
                    this.log(`❌ Error: ${error.message}`);
                    reject(error);
                });
            }
            catch (error) {
                this.log(`❌ Error conectando: ${error}`);
                reject(error);
            }
        });
    }
    /**
     * Desconectar del servidor
     */
    disconnect() {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.log("🔌 Desconectado");
    }
    /**
     * Inicializar cliente
     */
    init(userId, emprendedorId) {
        this.send({
            action: "init",
            user_id: userId,
            emprendedor_id: emprendedorId
        });
    }
    /**
     * Suscribirse a un canal
     */
    subscribe(channel) {
        this.send({
            action: "subscribe",
            channel
        });
    }
    /**
     * Desuscribirse de un canal
     */
    unsubscribe(channel) {
        this.send({
            action: "unsubscribe",
            channel
        });
    }
    /**
     * Enviar un mensaje
     */
    sendMessage(eventType, data) {
        this.send({
            action: "send_message",
            data: {
                event_type: eventType,
                ...data
            }
        });
    }
    /**
     * Obtener estadísticas
     */
    getStats() {
        this.send({
            action: "get_stats"
        });
    }
    /**
     * Ping para mantener viva la conexión
     */
    ping() {
        this.send({
            action: "ping"
        });
    }
    /**
     * Registrar un manejador de evento
     */
    on(eventType, handler) {
        if (!this.eventHandlers.has(eventType)) {
            this.eventHandlers.set(eventType, new Set());
        }
        this.eventHandlers.get(eventType).add(handler);
    }
    /**
     * Desregistrar un manejador de evento
     */
    off(eventType, handler) {
        this.eventHandlers.get(eventType)?.delete(handler);
    }
    /**
     * Enviar datos al servidor
     */
    send(data) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            this.log("⚠️ WebSocket no está conectado");
            return;
        }
        try {
            this.ws.send(JSON.stringify(data));
            this.log(`📤 Enviado: ${data.action || data.type}`);
        }
        catch (error) {
            this.log(`❌ Error enviando: ${error}`);
        }
    }
    /**
     * Manejar mensaje del servidor
     */
    handleMessage(message) {
        try {
            const data = JSON.parse(message);
            this.log(`📥 Recibido: ${data.type || data.event_type}`);
            // Ejecutar manejadores globales
            this.executeHandlers("*", data);
            // Ejecutar manejadores específicos
            if (data.type) {
                this.executeHandlers(data.type, data);
            }
            if (data.event_type) {
                this.executeHandlers(data.event_type, data);
            }
            // Guardar client_id si viene en la respuesta
            if (data.client_id) {
                this.clientId = data.client_id;
            }
        }
        catch (error) {
            this.log(`❌ Error parseando mensaje: ${error}`);
        }
    }
    /**
     * Ejecutar manejadores de evento
     */
    executeHandlers(eventType, data) {
        const handlers = this.eventHandlers.get(eventType);
        if (handlers) {
            handlers.forEach((handler) => {
                try {
                    handler(data);
                }
                catch (error) {
                    this.log(`❌ Error en manejador de ${eventType}: ${error}`);
                }
            });
        }
    }
    /**
     * Intentar reconectar
     */
    attemptReconnect() {
        if (this.reconnectAttempts >= this.config.reconnectAttempts) {
            this.log(`❌ Máximo de intentos de reconexión alcanzado (${this.config.reconnectAttempts})`);
            return;
        }
        this.reconnectAttempts++;
        const delay = this.config.reconnectDelay * this.reconnectAttempts;
        this.log(`🔄 Reintentando conexión en ${delay}ms (intento ${this.reconnectAttempts}/${this.config.reconnectAttempts})`);
        this.reconnectTimeout = setTimeout(() => {
            this.connect().catch((error) => {
                this.log(`❌ Error en reconexión: ${error}`);
            });
        }, delay);
    }
    /**
     * Logging
     */
    log(message) {
        if (this.config.debug) {
            console.log(`[WebSocket] ${message}`);
        }
    }
    /**
     * Obtener estado actual
     */
    getStatus() {
        return {
            connected: this.ws?.readyState === WebSocket.OPEN,
            clientId: this.clientId,
            url: this.config.url,
            reconnectAttempts: this.reconnectAttempts
        };
    }
}
exports.MarketplaceWebSocketIntegration = MarketplaceWebSocketIntegration;
// Exportar instancia singleton
exports.marketplaceWS = new MarketplaceWebSocketIntegration({
    url: process.env.WEBSOCKET_URL || "ws://localhost:3000",
    debug: true
});

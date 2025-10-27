"use strict";
/**
 * PUENTE DE INTEGRACIÓN: Marketplace ↔ Websoker
 *
 * Este servicio permite que:
 * 1. Marketplace (Node.js) y Websoker (Python) se comuniquen
 * 2. Los eventos se sincronicen entre ambos servidores
 * 3. Los clientes se conecten a cualquiera de los dos
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bridge = exports.MarketplaceWebsokerBridge = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
class MarketplaceWebsokerBridge {
    constructor(config = {}) {
        this.eventQueue = [];
        this.syncInterval = null;
        this.config = {
            marketplaceUrl: config.marketplaceUrl || "http://localhost:3000",
            websokerUrl: config.websokerUrl || "http://localhost:8000",
            debug: config.debug || true
        };
    }
    /**
     * Iniciar sincronización entre servidores
     */
    startSync(intervalMs = 5000) {
        this.log("🔄 Iniciando sincronización entre Marketplace y Websoker");
        this.syncInterval = setInterval(async () => {
            try {
                await this.syncServers();
            }
            catch (error) {
                this.log(`❌ Error en sincronización: ${error}`);
            }
        }, intervalMs);
    }
    /**
     * Detener sincronización
     */
    stopSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
            this.log("🛑 Sincronización detenida");
        }
    }
    /**
     * Sincronizar estadísticas entre servidores
     */
    async syncServers() {
        try {
            // Obtener stats de ambos servidores
            const marketplaceStats = await this.getMarketplaceStats();
            const websokerStats = await this.getWebsokerStats();
            if (this.config.debug && (marketplaceStats || websokerStats)) {
                this.log(`📊 Marketplace: ${marketplaceStats?.total_clients || 0} clientes`);
                this.log(`📊 Websoker: ${websokerStats?.total_clients || 0} clientes`);
            }
            // Procesar eventos encolados
            await this.processEventQueue();
        }
        catch (error) {
            this.log(`⚠️ Error sincronizando: ${error}`);
        }
    }
    /**
     * Obtener estadísticas de Marketplace
     */
    async getMarketplaceStats() {
        try {
            const response = await (0, node_fetch_1.default)(`${this.config.marketplaceUrl}/api/stats`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });
            if (!response.ok)
                return null;
            return await response.json();
        }
        catch (error) {
            return null;
        }
    }
    /**
     * Obtener estadísticas de Websoker
     */
    async getWebsokerStats() {
        try {
            const response = await (0, node_fetch_1.default)(`${this.config.websokerUrl}/stats`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });
            if (!response.ok)
                return null;
            return await response.json();
        }
        catch (error) {
            return null;
        }
    }
    /**
     * Procesar eventos encolados
     */
    async processEventQueue() {
        while (this.eventQueue.length > 0) {
            const event = this.eventQueue.shift();
            if (event) {
                await this.forwardEvent(event);
            }
        }
    }
    /**
     * Encolar un evento para sincronizar
     */
    queueEvent(event) {
        const bridgeEvent = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            ...event
        };
        this.eventQueue.push(bridgeEvent);
        this.log(`📤 Evento encolado: ${event.type}`);
    }
    /**
     * Enviar evento a través del puente
     */
    async forwardEvent(event) {
        const targetUrl = event.source === "marketplace"
            ? `${this.config.websokerUrl}/api/events`
            : `${this.config.marketplaceUrl}/api/events`;
        try {
            const response = await (0, node_fetch_1.default)(targetUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(event)
            });
            if (response.ok) {
                this.log(`✅ Evento reenviado: ${event.type}`);
            }
            else {
                this.log(`⚠️ No se pudo reenviar evento: ${event.type}`);
            }
        }
        catch (error) {
            this.log(`❌ Error reenviando evento: ${error}`);
        }
    }
    /**
     * Obtener estado de ambos servidores
     */
    async getStatus() {
        return {
            marketplace: await this.getMarketplaceStats(),
            websoker: await this.getWebsokerStats(),
            queuedEvents: this.eventQueue.length,
            syncRunning: this.syncInterval !== null
        };
    }
    /**
     * Logging
     */
    log(message) {
        if (this.config.debug) {
            console.log(`[Bridge] ${message}`);
        }
    }
}
exports.MarketplaceWebsokerBridge = MarketplaceWebsokerBridge;
// Exportar instancia singleton
exports.bridge = new MarketplaceWebsokerBridge({
    marketplaceUrl: process.env.MARKETPLACE_URL || "http://localhost:3000",
    websokerUrl: process.env.WEBSOKER_URL || "http://localhost:8000",
    debug: true
});

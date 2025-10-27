"use strict";
/**
 * SERVIDOR MARKETPLACE MEJORADO
 * Integración completa con Websoker usando el puente
 *
 * Este servidor combina:
 * - REST API (Express)
 * - WebSocket (ws)
 * - Puente de sincronización con Websoker
 *
 * Comando: npm run start-bridge
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.channels = exports.connectedClients = exports.wss = exports.server = exports.app = void 0;
exports.broadcastToChannel = broadcastToChannel;
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const ws_1 = __importDefault(require("ws"));
const data_source_1 = require("./config/data-source");
const marketplace_websoker_bridge_1 = require("./services/marketplace-websoker.bridge");
const routes = __importStar(require("./routes"));
const app = (0, express_1.default)();
exports.app = app;
const server = (0, http_1.createServer)(app);
exports.server = server;
const wss = new ws_1.default.Server({ server });
exports.wss = wss;
// ==================== MIDDLEWARE ====================
app.use(express_1.default.json());
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});
// ==================== ESTADO GLOBAL ====================
const connectedClients = new Map();
exports.connectedClients = connectedClients;
const channels = new Map();
exports.channels = channels;
// ==================== GESTIÓN DE CONEXIONES ====================
wss.on("connection", (ws, req) => {
    const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const client = {
        ws,
        clientId,
        channels: new Set(),
        connectedAt: new Date()
    };
    connectedClients.set(clientId, client);
    console.log(`✅ Cliente conectado: ${clientId} (Total: ${connectedClients.size})`);
    // ==================== MANEJADOR DE MENSAJES ====================
    ws.on("message", async (data) => {
        try {
            const message = JSON.parse(data);
            await handleWebSocketMessage(client, message);
        }
        catch (error) {
            console.error(`❌ Error procesando mensaje: ${error}`);
            ws.send(JSON.stringify({
                type: "error",
                message: "Invalid message format"
            }));
        }
    });
    // ==================== MANEJADOR DE DESCONEXIÓN ====================
    ws.on("close", () => {
        connectedClients.delete(clientId);
        // Remover cliente de todos los canales
        for (const [channelName, clients] of channels.entries()) {
            clients.delete(clientId);
            if (clients.size === 0) {
                channels.delete(channelName);
            }
        }
        // Notificar desconexión
        if (client.userId) {
            broadcastToChannel("notifications", {
                type: "user:offline",
                data: {
                    userId: client.userId,
                    timestamp: new Date().toISOString()
                }
            });
        }
        console.log(`❌ Cliente desconectado: ${clientId} (Total: ${connectedClients.size})`);
    });
    ws.on("error", (error) => {
        console.error(`❌ Error WebSocket: ${error}`);
    });
    // Enviar confirmación de conexión
    ws.send(JSON.stringify({
        type: "connected",
        clientId,
        message: "Connected to Marketplace WebSocket Bridge"
    }));
});
// ==================== MANEJADOR DE MENSAJES ====================
async function handleWebSocketMessage(client, message) {
    const { action, userId, emprendedorId, channel, channels: channelList, type, eventType, data } = message;
    console.log(`📨 Acción: ${action} (Cliente: ${client.clientId})`);
    switch (action) {
        case "init":
            client.userId = userId;
            client.emprendedorId = emprendedorId;
            client.ws.send(JSON.stringify({
                type: "init_success",
                clientId: client.clientId,
                userId,
                emprendedorId,
                timestamp: new Date().toISOString()
            }));
            console.log(`✅ Cliente inicializado: ${userId || emprendedorId}`);
            break;
        case "subscribe":
            if (channel) {
                client.channels.add(channel);
                if (!channels.has(channel)) {
                    channels.set(channel, new Set());
                }
                channels.get(channel).add(client.clientId);
                client.ws.send(JSON.stringify({
                    type: "subscribed",
                    channel,
                    totalInChannel: channels.get(channel).size
                }));
                console.log(`📡 Cliente suscrito a canal: ${channel}`);
            }
            break;
        case "unsubscribe":
            if (channel) {
                client.channels.delete(channel);
                const channelClients = channels.get(channel);
                if (channelClients) {
                    channelClients.delete(client.clientId);
                }
                client.ws.send(JSON.stringify({
                    type: "unsubscribed",
                    channel
                }));
                console.log(`❌ Cliente desuscrito de canal: ${channel}`);
            }
            break;
        case "ping":
            client.ws.send(JSON.stringify({
                type: "pong",
                timestamp: new Date().toISOString()
            }));
            break;
        case "get_stats":
            const stats = {
                type: "stats",
                totalClients: connectedClients.size,
                totalChannels: channels.size,
                clientChannels: Array.from(client.channels),
                timestamp: new Date().toISOString()
            };
            client.ws.send(JSON.stringify(stats));
            break;
        case "send_message":
            if (eventType && data) {
                // Generar evento y enviarlo a Websoker
                marketplace_websoker_bridge_1.bridge.queueEvent({
                    type: eventType,
                    eventType,
                    data,
                    source: "marketplace"
                });
                // Broadcast a canal si está especificado
                if (channel) {
                    broadcastToChannel(channel, {
                        type: eventType,
                        data,
                        from: client.clientId,
                        timestamp: new Date().toISOString()
                    });
                }
                console.log(`📤 Mensaje enviado: ${eventType}`);
            }
            break;
        default:
            console.warn(`⚠️ Acción desconocida: ${action}`);
    }
}
// ==================== FUNCIONES DE BROADCAST ====================
function broadcastToChannel(channelName, message) {
    const channelClients = channels.get(channelName);
    if (channelClients) {
        const payload = JSON.stringify(message);
        let sent = 0;
        for (const clientId of channelClients) {
            const client = connectedClients.get(clientId);
            if (client && client.ws.readyState === ws_1.default.OPEN) {
                client.ws.send(payload);
                sent++;
            }
        }
        console.log(`📡 Broadcast a canal '${channelName}': ${sent} clientes`);
    }
}
// ==================== RUTAS REST ====================
// Ruta de diagnóstico
app.get("/api/bridge/status", async (req, res) => {
    try {
        const status = await marketplace_websoker_bridge_1.bridge.getStatus();
        res.json({
            server: "marketplace-websoker-bridge",
            port: 3000,
            connectedClients: connectedClients.size,
            activeChannels: channels.size,
            bridge: status,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(500).json({ error: String(error) });
    }
});
// Ruta para enviar eventos
app.post("/api/events", (req, res) => {
    try {
        const { type, eventType, data } = req.body;
        console.log(`📨 Evento recibido: ${type || eventType}`);
        // Determinar canal objetivo
        let targetChannel = "global";
        if (type?.includes("product"))
            targetChannel = "products:feed";
        if (type?.includes("order"))
            targetChannel = "orders:feed";
        if (type?.includes("payment"))
            targetChannel = "payments:feed";
        // Broadcast a canal
        broadcastToChannel(targetChannel, {
            type: type || eventType,
            data,
            source: req.body.source || "bridge",
            timestamp: new Date().toISOString()
        });
        res.json({ success: true, channel: targetChannel });
    }
    catch (error) {
        res.status(500).json({ error: String(error) });
    }
});
// Ruta para obtener estadísticas
app.get("/api/stats", (req, res) => {
    try {
        const stats = {
            total_clients: connectedClients.size,
            total_channels: channels.size,
            channels_detail: Array.from(channels.entries()).map(([name, clients]) => ({
                name,
                client_count: clients.size
            })),
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        };
        res.json(stats);
    }
    catch (error) {
        res.status(500).json({ error: String(error) });
    }
});
// Rutas REST originales (importadas)
app.use("/api/auth", routes.authRoutes);
app.use("/api/categorias", routes.categoriaRoutes);
app.use("/api/usuarios", routes.usuarioRoutes);
app.use("/api/emprendedores", routes.emprendedorRoutes);
app.use("/api/orden", routes.ordenRoutes);
app.use("/api/productos", routes.productoRoutes);
app.use("/api/tarjetas", routes.tarjetaVirtualRoutes);
app.use("/api/transacciones", routes.transaccionRoutes);
app.use("/api/carrito", routes.carritoCompraRoutes);
app.use("/api/detallecarrito", routes.detalleCarritoRoutes);
app.use("/api/detalleorden", routes.detalleOrdenRoutes);
app.use("/api/pagos", routes.pagoRoutes);
app.use("/api/reportes", routes.reportesRoutes);
// ==================== INICIALIZACIÓN ====================
async function bootstrap() {
    try {
        // Inicializar base de datos
        await (0, data_source_1.initializeDataSource)();
        console.log("✅ Base de datos inicializada");
        // Iniciar puente de sincronización
        marketplace_websoker_bridge_1.bridge.startSync(5000); // Sincronizar cada 5 segundos
        console.log("🌉 Puente Marketplace ↔ Websoker iniciado");
        // Iniciar servidor
        const PORT = process.env.PORT || 3000;
        server.listen(PORT, () => {
            console.log("\n╔════════════════════════════════════════════╗");
            console.log("║  🚀 MARKETPLACE WEBSOKER BRIDGE INICIADO  ║");
            console.log("╠════════════════════════════════════════════╣");
            console.log(`║  REST API:  http://localhost:${PORT}            ║`);
            console.log(`║  WebSocket: ws://localhost:${PORT}              ║`);
            console.log("║  Status:    http://localhost:3000/api/bridge/status");
            console.log("╚════════════════════════════════════════════╝\n");
        });
        // Graceful shutdown
        process.on("SIGINT", () => {
            console.log("\n🛑 Deteniendo servidor...");
            marketplace_websoker_bridge_1.bridge.stopSync();
            server.close(() => {
                console.log("✅ Servidor detenido");
                process.exit(0);
            });
        });
    }
    catch (error) {
        console.error("❌ Error iniciando servidor:", error);
        process.exit(1);
    }
}
bootstrap();

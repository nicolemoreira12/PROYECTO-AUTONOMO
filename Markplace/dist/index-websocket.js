"use strict";
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
exports.channels = exports.connectedClients = exports.wss = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const data_source_1 = require("./config/data-source");
const error_middleware_1 = require("./middlewares/error.middleware");
const WebSocket = __importStar(require("ws"));
const Auth_routes_1 = __importDefault(require("./routes/Auth.routes"));
const Producto_routes_1 = __importDefault(require("./routes/Producto.routes"));
const Categoria_routes_1 = __importDefault(require("./routes/Categoria.routes"));
const Usuario_routes_1 = __importDefault(require("./routes/Usuario.routes"));
const Emprendedor_routes_1 = __importDefault(require("./routes/Emprendedor.routes"));
const Orden_routes_1 = __importDefault(require("./routes/Orden.routes"));
const TarjetaVirtual_routes_1 = __importDefault(require("./routes/TarjetaVirtual.routes"));
const Transaccion_routes_1 = __importDefault(require("./routes/Transaccion.routes"));
const CarritoCompra_routes_1 = __importDefault(require("./routes/CarritoCompra.routes"));
const Dellatecarrito_routes_1 = __importDefault(require("./routes/Dellatecarrito.routes"));
const DetalleOrden_routes_1 = __importDefault(require("./routes/DetalleOrden.routes"));
const Pago_routes_1 = __importDefault(require("./routes/Pago.routes"));
const Reportes_routes_1 = __importDefault(require("./routes/Reportes.routes"));
const http_1 = __importDefault(require("http"));
// ========== CONFIGURACIÓN EXPRESS ==========
const app = (0, express_1.default)();
exports.app = app;
const httpServer = http_1.default.createServer(app);
const connectedClients = new Map();
exports.connectedClients = connectedClients;
const channels = new Map();
exports.channels = channels;
let clientCounter = 0;
// ========== MIDDLEWARE EXPRESS ==========
app.use(express_1.default.json());
// ========== RUTAS API ==========
app.get("/", (_req, res) => {
    res.send("✅ Servidor Marketplace + WebSocket funcionando");
});
app.use("/api/auth", Auth_routes_1.default);
app.use("/api/categorias", Categoria_routes_1.default);
app.use("/api/usuarios", Usuario_routes_1.default);
app.use("/api/emprendedores", Emprendedor_routes_1.default);
app.use("/api/orden", Orden_routes_1.default);
app.use("/api/productos", Producto_routes_1.default);
app.use("/api/tarjetas", TarjetaVirtual_routes_1.default);
app.use("/api/transacciones", Transaccion_routes_1.default);
app.use("/api/carrito", CarritoCompra_routes_1.default);
app.use("/api/detallecarrito", Dellatecarrito_routes_1.default);
app.use("/api/detalleorden", DetalleOrden_routes_1.default);
app.use("/api/pagos", Pago_routes_1.default);
app.use("/api/reportes", Reportes_routes_1.default);
// Middleware de errores
app.use(error_middleware_1.errorHandler);
// ========== SETUP WEBSOCKET ==========
const wss = new WebSocket.Server({ server: httpServer });
exports.wss = wss;
wss.on("connection", (ws) => {
    clientCounter++;
    const clientId = `client_${Date.now()}_${clientCounter}`;
    console.log(`✅ Cliente conectado: ${clientId}`);
    const client = {
        ws,
        clientId,
        channels: new Set(),
        connectedAt: new Date()
    };
    connectedClients.set(clientId, client);
    // Enviar mensaje de bienvenida
    ws.send(JSON.stringify({
        type: "connection:established",
        client_id: clientId,
        timestamp: new Date().toISOString(),
        message: "Conectado al servidor Marketplace + WebSocket"
    }));
    // ========== MANEJO DE MENSAJES ==========
    ws.on("message", (message) => {
        try {
            const data = JSON.parse(message);
            const action = data.action;
            console.log(`📨 ${clientId} - Acción: ${action}`);
            // Inicializar cliente
            if (action === "init") {
                client.userId = data.user_id;
                client.emprendedorId = data.emprendedor_id;
                ws.send(JSON.stringify({
                    type: "init:success",
                    client_id: clientId,
                    user_id: client.userId,
                    emprendedor_id: client.emprendedorId,
                    message: "Cliente inicializado correctamente"
                }));
                console.log(`✅ ${clientId} inicializado - Usuario: ${client.userId}`);
            }
            // Suscribirse a canal
            else if (action === "subscribe") {
                const channel = data.channel;
                client.channels.add(channel);
                if (!channels.has(channel)) {
                    channels.set(channel, new Set());
                }
                channels.get(channel).add(clientId);
                ws.send(JSON.stringify({
                    type: "subscribe:success",
                    channel,
                    channels: Array.from(client.channels),
                    message: `Suscrito a canal: ${channel}`
                }));
                console.log(`✅ ${clientId} suscrito a: ${channel}`);
            }
            // Desuscribirse de canal
            else if (action === "unsubscribe") {
                const channel = data.channel;
                client.channels.delete(channel);
                channels.get(channel)?.delete(clientId);
                ws.send(JSON.stringify({
                    type: "unsubscribe:success",
                    channel,
                    message: `Desuscrito de canal: ${channel}`
                }));
            }
            // Heartbeat
            else if (action === "ping") {
                ws.send(JSON.stringify({
                    type: "pong",
                    timestamp: new Date().toISOString()
                }));
            }
            // Obtener estadísticas
            else if (action === "get_stats") {
                ws.send(JSON.stringify({
                    type: "stats",
                    total_clients: connectedClients.size,
                    total_channels: channels.size,
                    channels: Array.from(channels.keys()),
                    client_id: clientId,
                    timestamp: new Date().toISOString()
                }));
            }
            // Enviar mensaje a canal
            else if (action === "send_message") {
                const msgData = data.data || {};
                const eventType = msgData.event_type;
                // Determinar canales de destino
                let targetChannels = ["global"];
                if (eventType === "product:added") {
                    targetChannels.push("products:feed", "dashboard");
                }
                else if (eventType === "order:created") {
                    targetChannels.push("orders:feed", "dashboard");
                }
                else if (eventType === "payment:received") {
                    targetChannels.push("dashboard", "payments:feed");
                }
                // Broadcast a todos los clientes en los canales
                const response = {
                    type: "message:received",
                    from: clientId,
                    event_type: eventType,
                    data: msgData,
                    timestamp: new Date().toISOString()
                };
                targetChannels.forEach((channel) => {
                    const channelClients = channels.get(channel) || new Set();
                    channelClients.forEach((cid) => {
                        const targetClient = connectedClients.get(cid);
                        if (targetClient && targetClient.ws.readyState === WebSocket.OPEN) {
                            targetClient.ws.send(JSON.stringify(response));
                        }
                    });
                });
                console.log(`📢 ${eventType} broadcast a ${targetChannels.join(", ")}`);
            }
            // Acción desconocida
            else {
                ws.send(JSON.stringify({
                    type: "error",
                    message: `Acción desconocida: ${action}`
                }));
            }
        }
        catch (error) {
            console.error(`❌ Error procesando mensaje:`, error);
            ws.send(JSON.stringify({
                type: "error",
                message: "Error procesando mensaje",
                error: String(error)
            }));
        }
    });
    // ========== DESCONEXIÓN ==========
    ws.on("close", () => {
        console.log(`❌ Cliente desconectado: ${clientId}`);
        // Limpiar de todos los canales
        client.channels.forEach((channel) => {
            channels.get(channel)?.delete(clientId);
        });
        // Eliminar del mapa de clientes
        connectedClients.delete(clientId);
        // Notificar a otros clientes
        const notification = {
            type: "user:offline",
            client_id: clientId,
            total_connected: connectedClients.size,
            timestamp: new Date().toISOString()
        };
        connectedClients.forEach((otherClient) => {
            if (otherClient.ws.readyState === WebSocket.OPEN) {
                otherClient.ws.send(JSON.stringify(notification));
            }
        });
    });
    // ========== ERRORES ==========
    ws.on("error", (error) => {
        console.error(`❌ Error WebSocket [${clientId}]:`, error);
    });
});
// ========== INICIALIZACIÓN ==========
data_source_1.AppDataSource.initialize()
    .then(() => {
    console.log("📦 Conectado a la base de datos");
    httpServer.listen(3000, () => {
        console.log("🚀 Servidor REST corriendo en http://localhost:3000");
        console.log("🔌 Servidor WebSocket corriendo en ws://localhost:3000");
        console.log("✅ Sistema Marketplace + WebSocket completamente operativo");
    });
})
    .catch((error) => {
    console.error("❌ Error de conexión:", error);
    process.exit(1);
});

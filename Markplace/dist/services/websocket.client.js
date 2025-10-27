"use strict";
/**
 * Cliente WebSocket para el Marketplace
 * Gestiona conexiones, canales, eventos y notificaciones en tiempo real
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.wsClient = exports.MarketplaceWebSocketClient = exports.ChannelType = exports.EventType = void 0;
var EventType;
(function (EventType) {
    // Productos
    EventType["PRODUCT_ADDED"] = "product:added";
    EventType["PRODUCT_UPDATED"] = "product:updated";
    EventType["PRODUCT_DELETED"] = "product:deleted";
    // Órdenes
    EventType["ORDER_CREATED"] = "order:created";
    EventType["ORDER_UPDATED"] = "order:updated";
    EventType["ORDER_COMPLETED"] = "order:completed";
    // Pagos
    EventType["PAYMENT_RECEIVED"] = "payment:received";
    EventType["PAYMENT_FAILED"] = "payment:failed";
    // Carrito
    EventType["CART_UPDATED"] = "cart:updated";
    EventType["CART_CLEARED"] = "cart:cleared";
    // Notificaciones
    EventType["NOTIFICATION"] = "notification:sent";
    EventType["USER_ONLINE"] = "user:online";
    EventType["USER_OFFLINE"] = "user:offline";
    // Dashboard
    EventType["DASHBOARD_UPDATE"] = "dashboard:update";
    // Emprendedores
    EventType["EMPRENDEDOR_STATS"] = "emprendedor:stats";
    // Transacciones
    EventType["TRANSACTION_CREATED"] = "transaction:created";
})(EventType || (exports.EventType = EventType = {}));
var ChannelType;
(function (ChannelType) {
    ChannelType["GLOBAL"] = "global";
    ChannelType["NOTIFICATIONS"] = "notifications";
    ChannelType["DASHBOARD"] = "dashboard";
    ChannelType["USER"] = "user";
    ChannelType["EMPRENDEDOR"] = "emprendedor";
    ChannelType["PRODUCT"] = "product";
    ChannelType["ORDER"] = "order";
    ChannelType["PRODUCTS_FEED"] = "products:feed";
    ChannelType["ORDERS_FEED"] = "orders:feed";
    ChannelType["TRANSACTIONS_FEED"] = "transactions:feed";
})(ChannelType || (exports.ChannelType = ChannelType = {}));
class MarketplaceWebSocketClient {
    constructor(url = "ws://localhost:8000") {
        this.ws = null;
        this.clientId = "";
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000; // 3 segundos
        this.heartbeatInterval = null;
        this.messageQueue = [];
        this.isConnected = false;
        this.eventHandlers = new Map();
        this.globalHandlers = [];
        this.url = url;
    }
    /**
     * Conectar al servidor WebSocket
     */
    async connect(userId, emprendedorId) {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(this.url);
                this.ws.onopen = () => {
                    console.log("✅ Conectado al servidor WebSocket");
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    // Enviar mensaje de inicialización
                    this.send({
                        action: "init",
                        user_id: userId,
                        emprendedor_id: emprendedorId,
                    });
                    // Iniciar heartbeat
                    this.startHeartbeat();
                    // Procesar cola de mensajes
                    this.processMessageQueue();
                    resolve();
                };
                this.ws.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        this.handleMessage(message);
                    }
                    catch (error) {
                        console.error("Error procesando mensaje:", error);
                    }
                };
                this.ws.onerror = (error) => {
                    console.error("❌ Error WebSocket:", error);
                    this.isConnected = false;
                    reject(error);
                };
                this.ws.onclose = () => {
                    console.log("❌ Desconectado del servidor WebSocket");
                    this.isConnected = false;
                    this.stopHeartbeat();
                    this.attemptReconnect(userId, emprendedorId);
                };
            }
            catch (error) {
                reject(error);
            }
        });
    }
    /**
     * Desconectar del servidor
     */
    disconnect() {
        this.stopHeartbeat();
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.isConnected = false;
    }
    /**
     * Suscribirse a un canal
     */
    subscribe(channel) {
        this.send({
            action: "subscribe",
            channel: channel,
        });
    }
    /**
     * Desuscribirse de un canal
     */
    unsubscribe(channel) {
        this.send({
            action: "unsubscribe",
            channel: channel,
        });
    }
    /**
     * Registrar handler para un tipo de evento
     */
    on(eventType, handler) {
        const handlers = this.eventHandlers.get(eventType) || [];
        handlers.push(handler);
        this.eventHandlers.set(eventType, handlers);
    }
    /**
     * Registrar handler global para todos los eventos
     */
    onAny(handler) {
        this.globalHandlers.push(handler);
    }
    /**
     * Desregistrar handler
     */
    off(eventType, handler) {
        const handlers = this.eventHandlers.get(eventType) || [];
        const index = handlers.indexOf(handler);
        if (index > -1) {
            handlers.splice(index, 1);
        }
    }
    /**
     * Enviar mensaje al servidor
     */
    send(data) {
        if (this.isConnected && this.ws) {
            this.ws.send(JSON.stringify(data));
        }
        else {
            // Encolar mensaje si no está conectado
            this.messageQueue.push(data);
        }
    }
    /**
     * Procesar cola de mensajes pendientes
     */
    processMessageQueue() {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            if (message && this.ws) {
                this.ws.send(JSON.stringify(message));
            }
        }
    }
    /**
     * Manejar mensaje recibido
     */
    handleMessage(message) {
        // Ejecutar handlers globales
        this.globalHandlers.forEach((handler) => {
            try {
                handler(message);
            }
            catch (error) {
                console.error("Error en handler global:", error);
            }
        });
        // Ejecutar handlers específicos
        const handlers = this.eventHandlers.get(message.type) || [];
        handlers.forEach((handler) => {
            try {
                handler(message);
            }
            catch (error) {
                console.error(`Error en handler para ${message.type}:`, error);
            }
        });
        // Guardar cliente_id si viene en init:success
        if (message.type === "init:success") {
            this.clientId = message.data.client_id;
            this.userId = message.data.user_id;
            this.emprendedorId = message.data.emprendedor_id;
        }
    }
    /**
     * Iniciar heartbeat (ping periódico)
     */
    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            this.send({ action: "ping" });
        }, 30000); // cada 30 segundos
    }
    /**
     * Detener heartbeat
     */
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }
    /**
     * Intentar reconectar
     */
    attemptReconnect(userId, emprendedorId) {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error("❌ Máximo número de intentos de reconexión alcanzado");
            return;
        }
        this.reconnectAttempts++;
        const delay = this.reconnectDelay * this.reconnectAttempts;
        console.log(`🔄 Intentando reconectar en ${delay}ms (intento ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        setTimeout(() => {
            this.connect(userId, emprendedorId).catch((error) => {
                console.error("Error en reconexión:", error);
            });
        }, delay);
    }
    /**
     * ==================== MÉTODOS DE PRODUCTOS ====================
     */
    requestProducts() {
        this.send({ action: "get_products" });
    }
    addProduct(product) {
        this.send({
            action: "add_product",
            product: product,
        });
    }
    updateProduct(productId, data) {
        this.send({
            action: "update_product",
            product_id: productId,
            data: data,
        });
    }
    deleteProduct(productId) {
        this.send({
            action: "delete_product",
            product_id: productId,
        });
    }
    /**
     * ==================== MÉTODOS DE ÓRDENES ====================
     */
    createOrder(order) {
        this.send({
            action: "order_created",
            order: order,
        });
    }
    updateOrder(orderId, data) {
        this.send({
            action: "order_updated",
            order_id: orderId,
            data: data,
        });
    }
    /**
     * ==================== MÉTODOS DE PAGOS ====================
     */
    sendPayment(payment) {
        this.send({
            action: "payment_received",
            payment: payment,
        });
    }
    /**
     * ==================== MÉTODOS DE NOTIFICACIONES ====================
     */
    sendNotification(title, message, targetUserId, targetEmprendedorId) {
        this.send({
            action: "send_notification",
            notification: {
                title,
                message,
                target_user_id: targetUserId,
                target_emprendedor_id: targetEmprendedorId,
            },
        });
    }
    /**
     * ==================== MÉTODOS DE DASHBOARD ====================
     */
    subscribeToDashboard() {
        this.send({ action: "dashboard:subscribe" });
    }
    unsubscribeFromDashboard() {
        this.send({ action: "dashboard:unsubscribe" });
    }
    /**
     * ==================== MÉTODOS DE INFORMACIÓN ====================
     */
    getStats() {
        this.send({ action: "get_stats" });
    }
    getChannels() {
        this.send({ action: "get_channels" });
    }
    /**
     * ==================== GETTERS ====================
     */
    isConnectedStatus() {
        return this.isConnected;
    }
    getClientId() {
        return this.clientId;
    }
    getUserId() {
        return this.userId;
    }
    getEmprendedorId() {
        return this.emprendedorId;
    }
    getConnectionStatus() {
        return this.isConnected ? "connected" : "disconnected";
    }
}
exports.MarketplaceWebSocketClient = MarketplaceWebSocketClient;
// Exportar instancia singleton
exports.wsClient = new MarketplaceWebSocketClient();

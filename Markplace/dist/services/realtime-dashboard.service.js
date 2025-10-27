"use strict";
/**
 * Ejemplo de Dashboard en tiempo real
 * Conecta con el servidor WebSocket y muestra actualizaciones en vivo
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeDashboard = void 0;
const websocket_client_1 = require("../services/websocket.client");
class RealtimeDashboard {
    constructor(userId, emprendedorId) {
        this.userId = userId;
        this.emprendedorId = emprendedorId;
        this.stats = null;
        this.products = [];
        this.orders = [];
        this.notifications = [];
    }
    /**
     * Inicializar el dashboard
     */
    async initialize() {
        try {
            // Conectar al WebSocket
            await websocket_client_1.wsClient.connect(this.userId, this.emprendedorId);
            // Suscribirse a canales
            this.setupChannelSubscriptions();
            // Registrar handlers de eventos
            this.setupEventHandlers();
            console.log("✅ Dashboard inicializado");
        }
        catch (error) {
            console.error("❌ Error inicializando dashboard:", error);
            throw error;
        }
    }
    /**
     * Configurar suscripciones a canales
     */
    setupChannelSubscriptions() {
        // Dashboard
        websocket_client_1.wsClient.subscribe(websocket_client_1.ChannelType.DASHBOARD);
        // Productos
        websocket_client_1.wsClient.subscribe(websocket_client_1.ChannelType.PRODUCTS_FEED);
        // Órdenes
        websocket_client_1.wsClient.subscribe(websocket_client_1.ChannelType.ORDERS_FEED);
        // Transacciones
        websocket_client_1.wsClient.subscribe(websocket_client_1.ChannelType.TRANSACTIONS_FEED);
        // Notificaciones
        websocket_client_1.wsClient.subscribe(websocket_client_1.ChannelType.NOTIFICATIONS);
        // Canal específico del usuario si existe
        if (this.userId) {
            websocket_client_1.wsClient.subscribe(`${websocket_client_1.ChannelType.USER}:${this.userId}`);
        }
        // Canal específico del emprendedor si existe
        if (this.emprendedorId) {
            websocket_client_1.wsClient.subscribe(`${websocket_client_1.ChannelType.EMPRENDEDOR}:${this.emprendedorId}`);
        }
    }
    /**
     * Configurar handlers de eventos
     */
    setupEventHandlers() {
        // Dashboard stats
        websocket_client_1.wsClient.on(websocket_client_1.EventType.DASHBOARD_UPDATE, (message) => {
            this.handleDashboardUpdate(message);
        });
        // Productos
        websocket_client_1.wsClient.on(websocket_client_1.EventType.PRODUCT_ADDED, (message) => {
            this.handleProductAdded(message);
        });
        websocket_client_1.wsClient.on(websocket_client_1.EventType.PRODUCT_UPDATED, (message) => {
            this.handleProductUpdated(message);
        });
        websocket_client_1.wsClient.on(websocket_client_1.EventType.PRODUCT_DELETED, (message) => {
            this.handleProductDeleted(message);
        });
        // Órdenes
        websocket_client_1.wsClient.on(websocket_client_1.EventType.ORDER_CREATED, (message) => {
            this.handleOrderCreated(message);
        });
        websocket_client_1.wsClient.on(websocket_client_1.EventType.ORDER_UPDATED, (message) => {
            this.handleOrderUpdated(message);
        });
        // Pagos
        websocket_client_1.wsClient.on(websocket_client_1.EventType.PAYMENT_RECEIVED, (message) => {
            this.handlePaymentReceived(message);
        });
        // Notificaciones
        websocket_client_1.wsClient.on(websocket_client_1.EventType.NOTIFICATION, (message) => {
            this.handleNotification(message);
        });
        // Handler genérico para todos los eventos
        websocket_client_1.wsClient.onAny((message) => {
            console.log("📨 Evento recibido:", message);
        });
    }
    /**
     * ==================== HANDLERS DE EVENTOS ====================
     */
    handleDashboardUpdate(message) {
        this.stats = message.data;
        console.log("📊 Estadísticas del dashboard actualizadas:", this.stats);
        this.renderDashboard();
    }
    handleProductAdded(message) {
        const product = message.data.product;
        this.products.push(product);
        console.log("✨ Nuevo producto agregado:", product);
        this.renderProducts();
    }
    handleProductUpdated(message) {
        const productId = message.data.product_id;
        const updatedIndex = this.products.findIndex((p) => p.idproducto === productId);
        if (updatedIndex !== -1) {
            this.products[updatedIndex] = {
                ...this.products[updatedIndex],
                ...message.data.updates,
            };
            console.log("🔄 Producto actualizado:", this.products[updatedIndex]);
            this.renderProducts();
        }
    }
    handleProductDeleted(message) {
        const productId = message.data.product_id;
        this.products = this.products.filter((p) => p.idproducto !== productId);
        console.log("🗑️ Producto eliminado:", productId);
        this.renderProducts();
    }
    handleOrderCreated(message) {
        const order = message.data.order;
        this.orders.push(order);
        console.log("📦 Nueva orden creada:", order);
        this.renderOrders();
    }
    handleOrderUpdated(message) {
        const orderId = message.data.order_id;
        const updatedIndex = this.orders.findIndex((o) => o.idorden === orderId);
        if (updatedIndex !== -1) {
            this.orders[updatedIndex] = {
                ...this.orders[updatedIndex],
                ...message.data.updates,
            };
            console.log("🔄 Orden actualizada:", this.orders[updatedIndex]);
            this.renderOrders();
        }
    }
    handlePaymentReceived(message) {
        const payment = message.data.payment;
        console.log("💳 Pago recibido:", payment);
        this.addNotification("Pago recibido", `Monto: $${payment.monto}`);
    }
    handleNotification(message) {
        const notification = message.data;
        this.notifications.push(notification);
        console.log("🔔 Notificación:", notification);
        this.renderNotifications();
    }
    /**
     * ==================== MÉTODOS DE OPERACIÓN ====================
     */
    async addNewProduct(productData) {
        websocket_client_1.wsClient.addProduct(productData);
    }
    async updateProduct(productId, updates) {
        websocket_client_1.wsClient.updateProduct(productId, updates);
    }
    async deleteProduct(productId) {
        websocket_client_1.wsClient.deleteProduct(productId);
    }
    async createOrder(orderData) {
        websocket_client_1.wsClient.createOrder(orderData);
    }
    async updateOrder(orderId, updates) {
        websocket_client_1.wsClient.updateOrder(orderId, updates);
    }
    async processPayment(paymentData) {
        websocket_client_1.wsClient.sendPayment(paymentData);
    }
    sendNotification(title, message, targetUserId) {
        websocket_client_1.wsClient.sendNotification(title, message, targetUserId);
    }
    /**
     * ==================== MÉTODOS DE RENDERIZADO ====================
     */
    renderDashboard() {
        if (!this.stats)
            return;
        const html = `
      <div class="dashboard-stats">
        <h2>📊 Estadísticas en Tiempo Real</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-label">Conexiones Activas</span>
            <span class="stat-value">${this.stats.active_connections}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Total de Conexiones</span>
            <span class="stat-value">${this.stats.total_connections}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Mensajes Enviados</span>
            <span class="stat-value">${this.stats.messages_sent}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Eventos Emitidos</span>
            <span class="stat-value">${this.stats.events_emitted}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Canales Activos</span>
            <span class="stat-value">${this.stats.channels}</span>
          </div>
        </div>
        <p class="timestamp">Actualizado: ${new Date(this.stats.timestamp).toLocaleTimeString()}</p>
      </div>
    `;
        this.updateElement("dashboard-container", html);
    }
    renderProducts() {
        const html = `
      <div class="products-list">
        <h3>📦 Productos (${this.products.length})</h3>
        <div class="products-grid">
          ${this.products
            .map((p) => `
            <div class="product-card">
              <h4>${p.nombre}</h4>
              <p>${p.descripcion}</p>
              <p class="price">$${p.precio}</p>
              <p class="stock">Stock: ${p.stock}</p>
            </div>
          `)
            .join("")}
        </div>
      </div>
    `;
        this.updateElement("products-container", html);
    }
    renderOrders() {
        const html = `
      <div class="orders-list">
        <h3>📋 Órdenes (${this.orders.length})</h3>
        <div class="orders-table">
          <table>
            <thead>
              <tr>
                <th>ID Orden</th>
                <th>Usuario</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${this.orders
            .map((o) => `
                <tr>
                  <td>${o.idorden}</td>
                  <td>${o.idusuario}</td>
                  <td>$${o.total}</td>
                  <td><span class="status ${o.estado}">${o.estado}</span></td>
                </tr>
              `)
            .join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
        this.updateElement("orders-container", html);
    }
    renderNotifications() {
        const html = `
      <div class="notifications-list">
        <h3>🔔 Notificaciones Recientes</h3>
        <div class="notifications">
          ${this.notifications
            .slice(-5)
            .reverse()
            .map((n) => `
            <div class="notification">
              <strong>${n.title}</strong>
              <p>${n.message}</p>
              <small>${new Date(n.timestamp).toLocaleTimeString()}</small>
            </div>
          `)
            .join("")}
        </div>
      </div>
    `;
        this.updateElement("notifications-container", html);
    }
    addNotification(title, message) {
        this.notifications.push({
            title,
            message,
            timestamp: new Date().toISOString(),
        });
        this.renderNotifications();
    }
    updateElement(elementId, html) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = html;
        }
    }
    /**
     * Desconectar y limpiar
     */
    disconnect() {
        websocket_client_1.wsClient.disconnect();
        console.log("🔌 Dashboard desconectado");
    }
    /**
     * Getters
     */
    getStats() {
        return this.stats;
    }
    getProducts() {
        return this.products;
    }
    getOrders() {
        return this.orders;
    }
    getNotifications() {
        return this.notifications;
    }
}
exports.RealtimeDashboard = RealtimeDashboard;
// Ejemplo de uso:
// const dashboard = new RealtimeDashboard(userId, emprendedorId);
// await dashboard.initialize();
// dashboard.addNewProduct({ nombre: "Test", precio: 100, stock: 50 });

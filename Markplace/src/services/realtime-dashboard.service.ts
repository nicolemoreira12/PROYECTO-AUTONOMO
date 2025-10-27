/**
 * Ejemplo de Dashboard en tiempo real
 * Conecta con el servidor WebSocket y muestra actualizaciones en vivo
 */

import { wsClient, EventType, ChannelType } from "../services/websocket.client";

interface DashboardStats {
  total_connections: number;
  active_connections: number;
  messages_sent: number;
  messages_received: number;
  events_emitted: number;
  channels: number;
  timestamp: string;
}

interface Product {
  idproducto: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  [key: string]: any;
}

interface Order {
  idorden: string;
  idusuario: string;
  total: number;
  estado: string;
  [key: string]: any;
}

class RealtimeDashboard {
  private stats: DashboardStats | null = null;
  private products: Product[] = [];
  private orders: Order[] = [];
  private notifications: any[] = [];

  constructor(private userId?: string, private emprendedorId?: string) {}

  /**
   * Inicializar el dashboard
   */
  public async initialize(): Promise<void> {
    try {
      // Conectar al WebSocket
      await wsClient.connect(this.userId, this.emprendedorId);

      // Suscribirse a canales
      this.setupChannelSubscriptions();

      // Registrar handlers de eventos
      this.setupEventHandlers();

      console.log("✅ Dashboard inicializado");
    } catch (error) {
      console.error("❌ Error inicializando dashboard:", error);
      throw error;
    }
  }

  /**
   * Configurar suscripciones a canales
   */
  private setupChannelSubscriptions(): void {
    // Dashboard
    wsClient.subscribe(ChannelType.DASHBOARD);

    // Productos
    wsClient.subscribe(ChannelType.PRODUCTS_FEED);

    // Órdenes
    wsClient.subscribe(ChannelType.ORDERS_FEED);

    // Transacciones
    wsClient.subscribe(ChannelType.TRANSACTIONS_FEED);

    // Notificaciones
    wsClient.subscribe(ChannelType.NOTIFICATIONS);

    // Canal específico del usuario si existe
    if (this.userId) {
      wsClient.subscribe(`${ChannelType.USER}:${this.userId}`);
    }

    // Canal específico del emprendedor si existe
    if (this.emprendedorId) {
      wsClient.subscribe(`${ChannelType.EMPRENDEDOR}:${this.emprendedorId}`);
    }
  }

  /**
   * Configurar handlers de eventos
   */
  private setupEventHandlers(): void {
    // Dashboard stats
    wsClient.on(EventType.DASHBOARD_UPDATE, (message) => {
      this.handleDashboardUpdate(message);
    });

    // Productos
    wsClient.on(EventType.PRODUCT_ADDED, (message) => {
      this.handleProductAdded(message);
    });

    wsClient.on(EventType.PRODUCT_UPDATED, (message) => {
      this.handleProductUpdated(message);
    });

    wsClient.on(EventType.PRODUCT_DELETED, (message) => {
      this.handleProductDeleted(message);
    });

    // Órdenes
    wsClient.on(EventType.ORDER_CREATED, (message) => {
      this.handleOrderCreated(message);
    });

    wsClient.on(EventType.ORDER_UPDATED, (message) => {
      this.handleOrderUpdated(message);
    });

    // Pagos
    wsClient.on(EventType.PAYMENT_RECEIVED, (message) => {
      this.handlePaymentReceived(message);
    });

    // Notificaciones
    wsClient.on(EventType.NOTIFICATION, (message) => {
      this.handleNotification(message);
    });

    // Handler genérico para todos los eventos
    wsClient.onAny((message) => {
      console.log("📨 Evento recibido:", message);
    });
  }

  /**
   * ==================== HANDLERS DE EVENTOS ====================
   */

  private handleDashboardUpdate(message: any): void {
    this.stats = message.data;
    console.log("📊 Estadísticas del dashboard actualizadas:", this.stats);
    this.renderDashboard();
  }

  private handleProductAdded(message: any): void {
    const product = message.data.product;
    this.products.push(product);
    console.log("✨ Nuevo producto agregado:", product);
    this.renderProducts();
  }

  private handleProductUpdated(message: any): void {
    const productId = message.data.product_id;
    const updatedIndex = this.products.findIndex(
      (p) => p.idproducto === productId
    );
    if (updatedIndex !== -1) {
      this.products[updatedIndex] = {
        ...this.products[updatedIndex],
        ...message.data.updates,
      };
      console.log("🔄 Producto actualizado:", this.products[updatedIndex]);
      this.renderProducts();
    }
  }

  private handleProductDeleted(message: any): void {
    const productId = message.data.product_id;
    this.products = this.products.filter((p) => p.idproducto !== productId);
    console.log("🗑️ Producto eliminado:", productId);
    this.renderProducts();
  }

  private handleOrderCreated(message: any): void {
    const order = message.data.order;
    this.orders.push(order);
    console.log("📦 Nueva orden creada:", order);
    this.renderOrders();
  }

  private handleOrderUpdated(message: any): void {
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

  private handlePaymentReceived(message: any): void {
    const payment = message.data.payment;
    console.log("💳 Pago recibido:", payment);
    this.addNotification("Pago recibido", `Monto: $${payment.monto}`);
  }

  private handleNotification(message: any): void {
    const notification = message.data;
    this.notifications.push(notification);
    console.log("🔔 Notificación:", notification);
    this.renderNotifications();
  }

  /**
   * ==================== MÉTODOS DE OPERACIÓN ====================
   */

  public async addNewProduct(productData: any): Promise<void> {
    wsClient.addProduct(productData);
  }

  public async updateProduct(productId: string, updates: any): Promise<void> {
    wsClient.updateProduct(productId, updates);
  }

  public async deleteProduct(productId: string): Promise<void> {
    wsClient.deleteProduct(productId);
  }

  public async createOrder(orderData: any): Promise<void> {
    wsClient.createOrder(orderData);
  }

  public async updateOrder(orderId: string, updates: any): Promise<void> {
    wsClient.updateOrder(orderId, updates);
  }

  public async processPayment(paymentData: any): Promise<void> {
    wsClient.sendPayment(paymentData);
  }

  public sendNotification(
    title: string,
    message: string,
    targetUserId?: string
  ): void {
    wsClient.sendNotification(title, message, targetUserId);
  }

  /**
   * ==================== MÉTODOS DE RENDERIZADO ====================
   */

  private renderDashboard(): void {
    if (!this.stats) return;

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

  private renderProducts(): void {
    const html = `
      <div class="products-list">
        <h3>📦 Productos (${this.products.length})</h3>
        <div class="products-grid">
          ${this.products
            .map(
              (p) => `
            <div class="product-card">
              <h4>${p.nombre}</h4>
              <p>${p.descripcion}</p>
              <p class="price">$${p.precio}</p>
              <p class="stock">Stock: ${p.stock}</p>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;

    this.updateElement("products-container", html);
  }

  private renderOrders(): void {
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
                .map(
                  (o) => `
                <tr>
                  <td>${o.idorden}</td>
                  <td>${o.idusuario}</td>
                  <td>$${o.total}</td>
                  <td><span class="status ${o.estado}">${o.estado}</span></td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.updateElement("orders-container", html);
  }

  private renderNotifications(): void {
    const html = `
      <div class="notifications-list">
        <h3>🔔 Notificaciones Recientes</h3>
        <div class="notifications">
          ${this.notifications
            .slice(-5)
            .reverse()
            .map(
              (n) => `
            <div class="notification">
              <strong>${n.title}</strong>
              <p>${n.message}</p>
              <small>${new Date(n.timestamp).toLocaleTimeString()}</small>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;

    this.updateElement("notifications-container", html);
  }

  private addNotification(title: string, message: string): void {
    this.notifications.push({
      title,
      message,
      timestamp: new Date().toISOString(),
    });
    this.renderNotifications();
  }

  private updateElement(elementId: string, html: string): void {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = html;
    }
  }

  /**
   * Desconectar y limpiar
   */
  public disconnect(): void {
    wsClient.disconnect();
    console.log("🔌 Dashboard desconectado");
  }

  /**
   * Getters
   */
  public getStats(): DashboardStats | null {
    return this.stats;
  }

  public getProducts(): Product[] {
    return this.products;
  }

  public getOrders(): Order[] {
    return this.orders;
  }

  public getNotifications(): any[] {
    return this.notifications;
  }
}

// Exportar para usar en otros módulos
export { RealtimeDashboard };

// Ejemplo de uso:
// const dashboard = new RealtimeDashboard(userId, emprendedorId);
// await dashboard.initialize();
// dashboard.addNewProduct({ nombre: "Test", precio: 100, stock: 50 });

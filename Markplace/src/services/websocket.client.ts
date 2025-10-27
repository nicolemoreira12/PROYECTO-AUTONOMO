/**
 * Cliente WebSocket para el Marketplace
 * Gestiona conexiones, canales, eventos y notificaciones en tiempo real
 */

export enum EventType {
  // Productos
  PRODUCT_ADDED = "product:added",
  PRODUCT_UPDATED = "product:updated",
  PRODUCT_DELETED = "product:deleted",

  // Órdenes
  ORDER_CREATED = "order:created",
  ORDER_UPDATED = "order:updated",
  ORDER_COMPLETED = "order:completed",

  // Pagos
  PAYMENT_RECEIVED = "payment:received",
  PAYMENT_FAILED = "payment:failed",

  // Carrito
  CART_UPDATED = "cart:updated",
  CART_CLEARED = "cart:cleared",

  // Notificaciones
  NOTIFICATION = "notification:sent",
  USER_ONLINE = "user:online",
  USER_OFFLINE = "user:offline",

  // Dashboard
  DASHBOARD_UPDATE = "dashboard:update",

  // Emprendedores
  EMPRENDEDOR_STATS = "emprendedor:stats",

  // Transacciones
  TRANSACTION_CREATED = "transaction:created",
}

export enum ChannelType {
  GLOBAL = "global",
  NOTIFICATIONS = "notifications",
  DASHBOARD = "dashboard",
  USER = "user", // user:{user_id}
  EMPRENDEDOR = "emprendedor", // emprendedor:{emprendedor_id}
  PRODUCT = "product", // product:{product_id}
  ORDER = "order", // order:{order_id}
  PRODUCTS_FEED = "products:feed",
  ORDERS_FEED = "orders:feed",
  TRANSACTIONS_FEED = "transactions:feed",
}

export interface WSMessage {
  type: string;
  channel: string;
  data: any;
  timestamp: string;
}

export interface ClientInfo {
  client_id: string;
  user_id?: string;
  emprendedor_id?: string;
  connected_at: string;
  channels: string[];
}

export interface Stats {
  total_connections: number;
  active_connections: number;
  messages_sent: number;
  messages_received: number;
  events_emitted: number;
  channels: number;
  timestamp: string;
}

export type EventHandler = (message: WSMessage) => void;

export class MarketplaceWebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private clientId: string = "";
  private userId?: string;
  private emprendedorId?: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000; // 3 segundos
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private messageQueue: WSMessage[] = [];
  private isConnected = false;
  private eventHandlers: Map<string, EventHandler[]> = new Map();
  private globalHandlers: EventHandler[] = [];

  constructor(url: string = "ws://localhost:8000") {
    this.url = url;
  }

  /**
   * Conectar al servidor WebSocket
   */
  public async connect(userId?: string, emprendedorId?: string): Promise<void> {
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
            const message: WSMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
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
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Desconectar del servidor
   */
  public disconnect(): void {
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
  public subscribe(channel: string): void {
    this.send({
      action: "subscribe",
      channel: channel,
    });
  }

  /**
   * Desuscribirse de un canal
   */
  public unsubscribe(channel: string): void {
    this.send({
      action: "unsubscribe",
      channel: channel,
    });
  }

  /**
   * Registrar handler para un tipo de evento
   */
  public on(eventType: EventType | string, handler: EventHandler): void {
    const handlers = this.eventHandlers.get(eventType) || [];
    handlers.push(handler);
    this.eventHandlers.set(eventType, handlers);
  }

  /**
   * Registrar handler global para todos los eventos
   */
  public onAny(handler: EventHandler): void {
    this.globalHandlers.push(handler);
  }

  /**
   * Desregistrar handler
   */
  public off(eventType: EventType | string, handler: EventHandler): void {
    const handlers = this.eventHandlers.get(eventType) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  /**
   * Enviar mensaje al servidor
   */
  private send(data: any): void {
    if (this.isConnected && this.ws) {
      this.ws.send(JSON.stringify(data));
    } else {
      // Encolar mensaje si no está conectado
      this.messageQueue.push(data as WSMessage);
    }
  }

  /**
   * Procesar cola de mensajes pendientes
   */
  private processMessageQueue(): void {
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
  private handleMessage(message: WSMessage): void {
    // Ejecutar handlers globales
    this.globalHandlers.forEach((handler) => {
      try {
        handler(message);
      } catch (error) {
        console.error("Error en handler global:", error);
      }
    });

    // Ejecutar handlers específicos
    const handlers = this.eventHandlers.get(message.type) || [];
    handlers.forEach((handler) => {
      try {
        handler(message);
      } catch (error) {
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
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.send({ action: "ping" });
    }, 30000); // cada 30 segundos
  }

  /**
   * Detener heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Intentar reconectar
   */
  private attemptReconnect(userId?: string, emprendedorId?: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(
        "❌ Máximo número de intentos de reconexión alcanzado"
      );
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;

    console.log(
      `🔄 Intentando reconectar en ${delay}ms (intento ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    setTimeout(() => {
      this.connect(userId, emprendedorId).catch((error) => {
        console.error("Error en reconexión:", error);
      });
    }, delay);
  }

  /**
   * ==================== MÉTODOS DE PRODUCTOS ====================
   */

  public requestProducts(): void {
    this.send({ action: "get_products" });
  }

  public addProduct(product: any): void {
    this.send({
      action: "add_product",
      product: product,
    });
  }

  public updateProduct(productId: string, data: any): void {
    this.send({
      action: "update_product",
      product_id: productId,
      data: data,
    });
  }

  public deleteProduct(productId: string): void {
    this.send({
      action: "delete_product",
      product_id: productId,
    });
  }

  /**
   * ==================== MÉTODOS DE ÓRDENES ====================
   */

  public createOrder(order: any): void {
    this.send({
      action: "order_created",
      order: order,
    });
  }

  public updateOrder(orderId: string, data: any): void {
    this.send({
      action: "order_updated",
      order_id: orderId,
      data: data,
    });
  }

  /**
   * ==================== MÉTODOS DE PAGOS ====================
   */

  public sendPayment(payment: any): void {
    this.send({
      action: "payment_received",
      payment: payment,
    });
  }

  /**
   * ==================== MÉTODOS DE NOTIFICACIONES ====================
   */

  public sendNotification(
    title: string,
    message: string,
    targetUserId?: string,
    targetEmprendedorId?: string
  ): void {
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

  public subscribeToDashboard(): void {
    this.send({ action: "dashboard:subscribe" });
  }

  public unsubscribeFromDashboard(): void {
    this.send({ action: "dashboard:unsubscribe" });
  }

  /**
   * ==================== MÉTODOS DE INFORMACIÓN ====================
   */

  public getStats(): void {
    this.send({ action: "get_stats" });
  }

  public getChannels(): void {
    this.send({ action: "get_channels" });
  }

  /**
   * ==================== GETTERS ====================
   */

  public isConnectedStatus(): boolean {
    return this.isConnected;
  }

  public getClientId(): string {
    return this.clientId;
  }

  public getUserId(): string | undefined {
    return this.userId;
  }

  public getEmprendedorId(): string | undefined {
    return this.emprendedorId;
  }

  public getConnectionStatus(): string {
    return this.isConnected ? "connected" : "disconnected";
  }
}

// Exportar instancia singleton
export const wsClient = new MarketplaceWebSocketClient();

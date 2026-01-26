import "dotenv/config";
import "dotenv/config";
import express, { Request, Response } from 'express';
import cors from 'cors';
import http, { ClientRequest } from 'http';
import { Socket } from 'net';
import { WebSocketServer } from "ws";
const useServer = (require("graphql-ws") as any).useServer || require("graphql-ws");
import { makeExecutableSchema } from "@graphql-tools/schema";
import { createHandler } from 'graphql-http/lib/use/express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { AppDataSource } from "./config/data-source";
import { errorHandler } from "./middlewares/error.middleware";
import productoRoutes from "./routes/Producto.routes";
import categoriaRoutes from "./routes/Categoria.routes";
import usuarioRoutes from "./routes/Usuario.routes";
import emprendedorRoutes from "./routes/Emprendedor.routes";
import ordenRoutes from "./routes/Orden.routes";
import tarjetaRoutes from "./routes/TarjetaVirtual.routes";
import transaccionRoutes from "./routes/Transaccion.routes";
import carritoRoutes from "./routes/CarritoCompra.routes";
import detallecarritoRoutes from "./routes/Dellatecarrito.routes";
import detalleordenRoutes from "./routes/DetalleOrden.routes";
import pagoRoutes from "./routes/Pago.routes";
import reportesRoutes from "./routes/Reportes.routes";
import aiRoutes from "./routes/AIRoutes";
import { typeDefs, resolvers } from "./graphql/schema";
import { pubsub } from "./graphql/pubsub";


const app = express();
app.use(express.json());

// CORS - Permitir solicitudes desde el frontend
app.use(cors({
  origin: '*', // O especifica el origen de tu frontend, ej: 'http://localhost:5173'
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Ruta de prueba raíz
app.get("/", (_req, res) => {
  res.send("✅ Servidor funcionando y conectado a la base de datos");
});

// Proxy para el servicio de autenticación
app.use('/api/auth', createProxyMiddleware({
  target: 'http://localhost:4000',
  changeOrigin: true,
  timeout: 60000,
  proxyTimeout: 60000,
  pathRewrite: {
    '^/api/auth': '/auth'
  },
  logLevel: 'debug',
  onProxyReq: (proxyReq: ClientRequest, req: Request, res: Response) => {
    console.log(`[PROXY] Redirigiendo ${req.method} ${req.originalUrl} -> http://localhost:4000${proxyReq.path}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[PROXY] Respuesta recibida para ${req.method} ${req.originalUrl}: ${proxyRes.statusCode}`);
  },
  onError: (err: Error, req: Request, res: Response | Socket) => {
    console.error('[PROXY] Error:', err.message);
    if ('status' in res) {
      res.status(500).json({ error: 'Error en el proxy de autenticación' });
    }
  },
}));

// Rutas API
app.use("/api/categorias", categoriaRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/emprendedores", emprendedorRoutes);
app.use("/api/orden", ordenRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/tarjetas", tarjetaRoutes);
app.use("/api/transacciones", transaccionRoutes);
app.use("/api/carrito", carritoRoutes);
app.use("/api/detallecarrito", detallecarritoRoutes);
app.use("/api/detalleorden", detalleordenRoutes);
app.use("/api/pagos", pagoRoutes);
app.use("/api/ai", aiRoutes);

// Middleware de errores 
app.use(errorHandler);

AppDataSource.initialize()
  .then(async () => {
    console.log("📦 Conectado a la base de datos");

    // Montar GraphQL HTTP (queries y mutations)
    const schema = makeExecutableSchema({ typeDefs, resolvers } as any);
    app.all('/graphql', createHandler({
      schema,
      graphiql: process.env.NODE_ENV !== 'production',
    } as any)); // Se castea a 'any' para evitar el error de tipado

    const PORT = Number(process.env.PORT) || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📡 GraphQL endpoint (GraphiQL): http://localhost:${PORT}/graphql`);
    });
  })
  .catch((error) => console.error("❌ Error de conexión:", error));

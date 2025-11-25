import "dotenv/config";
import "dotenv/config";
import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
const useServer = (require("graphql-ws") as any).useServer || require("graphql-ws");
import { makeExecutableSchema } from "@graphql-tools/schema";
import * as expressGraphql from "express-graphql";
const graphqlHTTP = (expressGraphql as any).graphqlHTTP || expressGraphql;
import { AppDataSource } from "./config/data-source";
import { errorHandler } from "./middlewares/error.middleware";
import authRoutes from "./routes/Auth.routes";
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
import { typeDefs, resolvers } from "./graphql/schema";
import { pubsub } from "./graphql/pubsub";


const app = express();
app.use(express.json());

// CORS - Permitir solicitudes desde el frontend
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Ruta de prueba raíz
app.get("/", (_req, res) => {
  res.send("✅ Servidor funcionando y conectado a la base de datos");
});

// Rutas API
app.use("/api/auth", authRoutes);  // ← Autenticación (Login y Registro)
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

// Middleware de errores 
app.use(errorHandler);

AppDataSource.initialize()
  .then(async () => {
    console.log("📦 Conectado a la base de datos");

    // Montar GraphQL HTTP (queries y mutations)
    const schema = makeExecutableSchema({ typeDefs, resolvers } as any);
    app.use(
      "/graphql",
      graphqlHTTP({
        schema,
        graphiql: true,
      })
    );

    const PORT = Number(process.env.PORT) || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📡 GraphQL endpoint (GraphiQL): http://localhost:${PORT}/graphql`);
    });
  })
  .catch((error) => console.error("❌ Error de conexión:", error));

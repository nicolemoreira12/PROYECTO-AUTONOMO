import express from "express";
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


const app = express();
app.use(express.json());

// Ruta de prueba raíz
app.get("/", (_req, res) => {
  res.send("✅ Servidor funcionando y conectado a la base de datos");
});

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

// Middleware de errores (debe ir al final)
app.use(errorHandler);

AppDataSource.initialize()
  .then(() => {
    console.log("📦 Conectado a la base de datos");
    app.listen(3000, () => {
      console.log("🚀 Servidor corriendo en http://localhost:3000");
    });
  })
  .catch((error) => console.error("❌ Error de conexión:", error));

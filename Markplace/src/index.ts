import express from "express";
import { AppDataSource } from "./config/data-source";
import productoRoutes from "./routes/Producto.routes";
import categoriaRoutes from "./routes/Categoria.routes";
import usuarioRoutes from "./routes/Usuario.routes";
import emprendedorRoutes from "./routes/Emprendedor.routes";
import ordenRoutes from "./routes/Orden.routes";

const app = express();
app.use(express.json());
app.use("/categorias", categoriaRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/emprendedores", emprendedorRoutes);
app.use("/orden", ordenRoutes);
app.use("/productos", productoRoutes);

// Ruta de prueba raíz
app.get("/", (_req, res) => {
  res.send("✅ Servidor funcionando y conectado a la base de datos");
});

// Rutas
app.use("/api/productos", productoRoutes);


AppDataSource.initialize()
  .then(() => {
    console.log("📦 Conectado a la base de datos");
    app.listen(3000, () => {
      console.log("🚀 Servidor corriendo en http://localhost:3000");
    });
  })
  .catch((error) => console.error("❌ Error de conexión:", error));

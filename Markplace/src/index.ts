import express from "express";
import { AppDataSource } from "./config/data-source";
import productoRoutes from "./routes/Producto.routes";
import categoriaRoutes from "./routes/Categoria.routes";

const app = express();
app.use(express.json());
app.use("/categorias", categoriaRoutes);

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

import express from "express";
import { AppDataSource } from "./data-source";

const app = express();
app.use(express.json());

AppDataSource.initialize()
  .then(() => {
    console.log("📌 Conexión a PostgreSQL establecida con éxito");

    app.get("/", (req, res) => {
      res.send("🚀 API funcionando con conexión a la BD");
    });

    app.listen(3000, () => {
      console.log("✅ Servidor corriendo en http://localhost:3000");
    });
  })
  .catch((error) => console.error("❌ Error de conexión:", error));

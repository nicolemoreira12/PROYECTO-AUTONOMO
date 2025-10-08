import express from "express";

const app = express();
app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("🚀 Servidor Express funcionando correctamente!");
});

// Servidor en puerto 3000
app.listen(3000, () => {
  console.log("✅ Servidor corriendo en http://localhost:3000");
});

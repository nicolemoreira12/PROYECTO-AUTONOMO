import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  crearProducto,
  listarProductos,
  obtenerProducto,
  actualizarProducto,
  eliminarProducto,
  buscarProductos,
} from "../controllers/Producto.controller";

const router = Router();

// Rutas públicas (sin autenticación)
router.get("/", listarProductos);      // Listar todos
router.get("/search", buscarProductos); // Buscar productos (debe ir antes de /:id)
router.get("/:id", obtenerProducto);   // Obtener uno

// Rutas protegidas (requieren autenticación)
router.post("/", authMiddleware, crearProducto);       // Crear (solo autenticados)
router.put("/:id", authMiddleware, actualizarProducto); // Actualizar (solo autenticados)
router.delete("/:id", authMiddleware, eliminarProducto); // Eliminar (solo autenticados)

export default router;

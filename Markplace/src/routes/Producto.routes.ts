import { Router } from "express";
import {
  crearProducto,
  listarProductos,
  obtenerProducto,
  actualizarProducto,
  eliminarProducto,
} from "../controllers/Producto.controller";

const router = Router();

router.post("/", crearProducto);       // Crear
router.get("/", listarProductos);      // Listar todos
router.get("/:id", obtenerProducto);   // Obtener uno
router.put("/:id", actualizarProducto); // Actualizar
router.delete("/:id", eliminarProducto); // Eliminar

export default router;

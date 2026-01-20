import { Router } from "express";
import { CarritoController } from "../controllers/carritocompra.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const carritoController = new CarritoController();

// Rutas del carrito (requieren autenticación)
router.get("/", authMiddleware, carritoController.getCarritoUsuario.bind(carritoController));
router.post("/items", authMiddleware, carritoController.addItem.bind(carritoController));
router.put("/items/:itemId", authMiddleware, carritoController.updateItem.bind(carritoController));
router.delete("/items/:itemId", authMiddleware, carritoController.removeItem.bind(carritoController));
router.delete("/", authMiddleware, carritoController.clearCarrito.bind(carritoController));

// Rutas admin (CRUD básico)
router.get("/all", carritoController.getAll.bind(carritoController));
router.get("/:id", carritoController.getById.bind(carritoController));
router.post("/admin", carritoController.create.bind(carritoController));
router.put("/:id", carritoController.update.bind(carritoController));
router.delete("/admin/:id", carritoController.delete.bind(carritoController));

export default router;

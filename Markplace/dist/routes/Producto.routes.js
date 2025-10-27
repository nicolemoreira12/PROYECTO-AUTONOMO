"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const Producto_controller_1 = require("../controllers/Producto.controller");
const router = (0, express_1.Router)();
// Rutas públicas (sin autenticación)
router.get("/", Producto_controller_1.listarProductos); // Listar todos
router.get("/:id", Producto_controller_1.obtenerProducto); // Obtener uno
// Rutas protegidas (requieren autenticación)
router.post("/", auth_middleware_1.authMiddleware, Producto_controller_1.crearProducto); // Crear (solo autenticados)
router.put("/:id", auth_middleware_1.authMiddleware, Producto_controller_1.actualizarProducto); // Actualizar (solo autenticados)
router.delete("/:id", auth_middleware_1.authMiddleware, Producto_controller_1.eliminarProducto); // Eliminar (solo autenticados)
exports.default = router;

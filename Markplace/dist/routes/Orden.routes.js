"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orden_controller_1 = require("../controllers/orden.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const controller = new orden_controller_1.OrdenController();
// Rutas CRUD
router.get("/", auth_middleware_1.authMiddleware, (req, res) => controller.getAll(req, res));
router.get("/:id", auth_middleware_1.authMiddleware, (req, res) => controller.getById(req, res));
router.post("/", auth_middleware_1.authMiddleware, (req, res) => controller.create(req, res));
router.put("/:id", auth_middleware_1.authMiddleware, (req, res) => controller.update(req, res));
router.delete("/:id", auth_middleware_1.authMiddleware, (req, res) => controller.delete(req, res));
exports.default = router;

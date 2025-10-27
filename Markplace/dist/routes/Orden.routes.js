"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orden_controller_1 = require("../controllers/orden.controller");
const router = (0, express_1.Router)();
const controller = new orden_controller_1.OrdenController();
// Rutas CRUD
router.get("/", (req, res) => controller.getAll(req, res));
router.get("/:id", (req, res) => controller.getById(req, res));
router.post("/", (req, res) => controller.create(req, res));
router.put("/:id", (req, res) => controller.update(req, res));
router.delete("/:id", (req, res) => controller.delete(req, res));
exports.default = router;

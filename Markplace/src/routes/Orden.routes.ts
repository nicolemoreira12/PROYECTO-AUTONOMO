import { Router } from "express";
import { OrdenController } from "../controllers/orden.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const controller = new OrdenController();

// Rutas CRUD
router.get("/", authMiddleware, (req, res) => controller.getAll(req, res));
router.get("/:id", authMiddleware, (req, res) => controller.getById(req, res));
router.post("/", authMiddleware, (req, res) => controller.create(req, res));
router.put("/:id", authMiddleware, (req, res) => controller.update(req, res));
router.delete("/:id", authMiddleware, (req, res) => controller.delete(req, res));

export default router;

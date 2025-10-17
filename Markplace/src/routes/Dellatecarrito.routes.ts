import { Router } from "express";
import { DetalleCarritoController } from "../controllers/detallecarrito.controller";

const router = Router();
const detalleController = new DetalleCarritoController();

router.get("/", detalleController.getAll.bind(detalleController));
router.get("/:id", detalleController.getById.bind(detalleController));
router.post("/", detalleController.create.bind(detalleController));
router.put("/:id", detalleController.update.bind(detalleController));
router.delete("/:id", detalleController.delete.bind(detalleController));

export default router;

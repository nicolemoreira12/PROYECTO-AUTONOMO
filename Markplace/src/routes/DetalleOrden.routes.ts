import { Router } from "express";
import { DetalleOrdenController } from "../controllers/detalleorden.controller";

const router = Router();
const controller = new DetalleOrdenController();

router.get("/", controller.getAll.bind(controller));
router.get("/:id", controller.getById.bind(controller));
router.post("/", controller.create.bind(controller));
router.put("/:id", controller.update.bind(controller));
router.delete("/:id", controller.delete.bind(controller));

export default router;

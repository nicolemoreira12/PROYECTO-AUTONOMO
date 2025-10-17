import { Router } from "express";
import { TransaccionController } from "../controllers/transaccion.controller";

const router = Router();
const controller = new TransaccionController();

router.get("/", (req, res) => controller.getAll(req, res));
router.get("/:id", (req, res) => controller.getById(req, res));
router.post("/", (req, res) => controller.create(req, res));

export default router;

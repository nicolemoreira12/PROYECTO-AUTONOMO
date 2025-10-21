import { Router } from "express";
import { getAll, getById, create, update, deleteCategoria } from "../controllers/categoria.controller";

const router = Router();

router.get("/", getAll);
router.get("/:id", getById);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", deleteCategoria);

export default router;

import { Router } from "express";
import {
  createUsuario,
  getUsuarios,
  getUsuarioById,
  getUsuarioByEmail,
  updateUsuario,
  deleteUsuario,
} from "../controllers/usuario.controller";

const router = Router();

router.post("/", createUsuario);
router.get("/", getUsuarios);
router.get("/email/:email", getUsuarioByEmail);
router.get("/:id", getUsuarioById);
router.put("/:id", updateUsuario);
router.delete("/:id", deleteUsuario);

export default router;

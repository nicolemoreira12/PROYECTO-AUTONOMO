import { Router } from 'express';
import { ToolController } from '../controllers/tool.controller';

const router = Router();
const toolController = new ToolController();

// Listar todas las herramientas disponibles
router.get('/', toolController.listTools.bind(toolController));

// Ejecutar herramienta manualmente (para testing)
router.post('/execute', toolController.executeTool.bind(toolController));

export { router as toolRoutes };

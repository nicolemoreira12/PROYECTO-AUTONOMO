import { Request, Response } from "express";
import { DetalleCarritoService } from "../services/detallecarrito.service";

const detalleService = new DetalleCarritoService();

export class DetalleCarritoController {
  async getAll(req: Request, res: Response) {
    try {
      const data = await detalleService.getAll();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener detalles", error });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const data = await detalleService.getById(Number(req.params.id));
      res.json(data);
    } catch (error) {
      res.status(404).json({ message: error instanceof Error ? error.message : "Detalle no encontrado" });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const data = await detalleService.create(req.body);
      res.status(201).json(data);
    } catch (error) {
      res.status(400).json({ message: "Error al crear detalle", error });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const data = await detalleService.update(Number(req.params.id), req.body);
      res.json(data);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Error al actualizar detalle" });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await detalleService.delete(Number(req.params.id));
      res.json({ message: "Detalle eliminado" });
    } catch (error) {
      res.status(404).json({ message: error instanceof Error ? error.message : "Error al eliminar detalle" });
    }
  }
}

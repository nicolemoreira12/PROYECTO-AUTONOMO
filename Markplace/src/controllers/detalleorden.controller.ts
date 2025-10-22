import { Request, Response } from "express";
import { DetalleOrdenService } from "../services/detalleorden.service";

const detalleOrdenService = new DetalleOrdenService();

export class DetalleOrdenController {
  async getAll(req: Request, res: Response) {
    try {
      const data = await detalleOrdenService.getAll();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener detalles de orden", error });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const data = await detalleOrdenService.getById(Number(req.params.id));
      res.json(data);
    } catch (error) {
      res.status(404).json({ message: error instanceof Error ? error.message : "Detalle de orden no encontrado" });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const data = await detalleOrdenService.create(req.body);
      res.status(201).json(data);
    } catch (error) {
      res.status(400).json({ message: "Error al crear detalle de orden", error });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const data = await detalleOrdenService.update(Number(req.params.id), req.body);
      res.json(data);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Error al actualizar detalle de orden" });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await detalleOrdenService.delete(Number(req.params.id));
      res.json({ message: "Detalle de orden eliminado correctamente" });
    } catch (error) {
      res.status(404).json({ message: error instanceof Error ? error.message : "Error al eliminar detalle de orden" });
    }
  }
}

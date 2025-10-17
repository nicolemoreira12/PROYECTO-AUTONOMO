import { Request, Response } from "express";
import { TransaccionService } from "../services/transaccion.service";

const service = new TransaccionService();

export class TransaccionController {
  async getAll(req: Request, res: Response) {
    try {
      const transacciones = await service.getAll();
      res.json(transacciones);
    } catch (err) {
      res.status(500).json({ error: "Error al obtener transacciones" });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const transaccion = await service.getById(id);
      if (!transaccion) return res.status(404).json({ message: "No encontrada" });
      res.json(transaccion);
    } catch (err) {
      res.status(500).json({ error: "Error al obtener transacción" });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const nueva = await service.create(req.body);
      res.status(201).json(nueva);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}

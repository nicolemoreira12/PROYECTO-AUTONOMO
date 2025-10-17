import { Request, Response } from "express";
import { DetalleCarritoService } from "../services/detallecarrito.service";

const detalleService = new DetalleCarritoService();

export class DetalleCarritoController {
  async getAll(req: Request, res: Response) {
    const data = await detalleService.getAll();
    res.json(data);
  }

  async getById(req: Request, res: Response) {
    const data = await detalleService.getById(Number(req.params.id));
    res.json(data);
  }

  async create(req: Request, res: Response) {
    const data = await detalleService.create(req.body);
    res.json(data);
  }

  async update(req: Request, res: Response) {
    const data = await detalleService.update(Number(req.params.id), req.body);
    res.json(data);
  }

  async delete(req: Request, res: Response) {
    await detalleService.delete(Number(req.params.id));
    res.json({ message: "Detalle eliminado" });
  }
}

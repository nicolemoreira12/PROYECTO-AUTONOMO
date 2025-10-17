import { Request, Response } from "express";
import { CarritoService } from "../services/carritocompra.service";

const carritoService = new CarritoService();

export class CarritoController {
  async getAll(req: Request, res: Response) {
    const data = await carritoService.getAll();
    res.json(data);
  }

  async getById(req: Request, res: Response) {
    const data = await carritoService.getById(Number(req.params.id));
    res.json(data);
  }

  async create(req: Request, res: Response) {
    const data = await carritoService.create(req.body);
    res.json(data);
  }

  async update(req: Request, res: Response) {
    const data = await carritoService.update(Number(req.params.id), req.body);
    res.json(data);
  }

  async delete(req: Request, res: Response) {
    await carritoService.delete(Number(req.params.id));
    res.json({ message: "Carrito eliminado" });
  }
}

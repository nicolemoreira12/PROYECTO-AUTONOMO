import { Request, Response } from "express";
import { EmprendedorService } from "../services/emprendedor.service";

const service = new EmprendedorService();

export class EmprendedorController {
  async getAll(req: Request, res: Response) {
    const data = await service.getAll();
    return res.json(data);
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const data = await service.getById(Number(id));
    if (!data) return res.status(404).json({ message: "Emprendedor no encontrado" });
    return res.json(data);
  }

  async create(req: Request, res: Response) {
    const data = await service.create(req.body);
    return res.status(201).json(data);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const data = await service.update(Number(id), req.body);
    return res.json(data);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    await service.delete(Number(id));
    return res.json({ message: "Emprendedor eliminado" });
  }
}

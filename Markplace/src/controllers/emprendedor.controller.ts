import { Request, Response } from "express";
import { EmprendedorService } from "../services/emprendedor.service";

const service = new EmprendedorService();

export class EmprendedorController {
  async getAll(req: Request, res: Response) {
    try {
      const data = await service.getAll();
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ message: "Error al obtener emprendedores", error });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await service.getById(Number(id));
      return res.json(data);
    } catch (error) {
      return res.status(404).json({ message: error instanceof Error ? error.message : "Emprendedor no encontrado" });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const data = await service.create(req.body);
      return res.status(201).json(data);
    } catch (error) {
      return res.status(400).json({ message: "Error al crear emprendedor", error });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await service.update(Number(id), req.body);
      return res.json(data);
    } catch (error) {
      return res.status(400).json({ message: error instanceof Error ? error.message : "Error al actualizar emprendedor" });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await service.delete(Number(id));
      return res.json({ message: "Emprendedor eliminado" });
    } catch (error) {
      return res.status(404).json({ message: error instanceof Error ? error.message : "Error al eliminar emprendedor" });
    }
  }
}

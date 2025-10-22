import { Request, Response } from "express";
import { PagoService } from "../services/pago.service";

const pagoService = new PagoService();

export class PagoController {
  async getAll(req: Request, res: Response) {
    try {
      const data = await pagoService.getAll();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener pagos", error });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const data = await pagoService.getById(Number(req.params.id));
      res.json(data);
    } catch (error) {
      res.status(404).json({ message: error instanceof Error ? error.message : "Pago no encontrado" });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const data = await pagoService.create(req.body);
      res.status(201).json(data);
    } catch (error) {
      res.status(400).json({ message: "Error al crear pago", error });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const data = await pagoService.update(Number(req.params.id), req.body);
      res.json(data);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Error al actualizar pago" });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await pagoService.delete(Number(req.params.id));
      res.json({ message: "Pago eliminado correctamente" });
    } catch (error) {
      res.status(404).json({ message: error instanceof Error ? error.message : "Error al eliminar pago" });
    }
  }
}

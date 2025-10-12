import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Categoria } from "../entities/Categoria";

const categoriaRepo = AppDataSource.getRepository(Categoria);

export class CategoriaController {
  static getAll = async (_req: Request, res: Response) => {
    try {
      const categorias = await categoriaRepo.find();
      res.json(categorias);
    } catch (error) {
      res.status(500).json({ message: "Error obteniendo categorías", error });
    }
  };

  static getById = async (req: Request, res: Response) => {
    try {
      const categoria = await categoriaRepo.findOneBy({
        idCategoria: parseInt(req.params.id),
      });
      if (!categoria) return res.status(404).json({ message: "Categoría no encontrada" });
      res.json(categoria);
    } catch (error) {
      res.status(500).json({ message: "Error obteniendo la categoría", error });
    }
  };

  static create = async (req: Request, res: Response) => {
    try {
      const { nombreCategoria, descripcion } = req.body;
      const categoria = categoriaRepo.create({ nombreCategoria, descripcion });
      await categoriaRepo.save(categoria);
      res.status(201).json(categoria);
    } catch (error) {
      res.status(500).json({ message: "Error creando la categoría", error });
    }
  };

  static update = async (req: Request, res: Response) => {
    try {
      const categoria = await categoriaRepo.findOneBy({
        idCategoria: parseInt(req.params.id),
      });
      if (!categoria) return res.status(404).json({ message: "Categoría no encontrada" });

      categoriaRepo.merge(categoria, req.body);
      await categoriaRepo.save(categoria);
      res.json(categoria);
    } catch (error) {
      res.status(500).json({ message: "Error actualizando categoría", error });
    }
  };

  static delete = async (req: Request, res: Response) => {
    try {
      const result = await categoriaRepo.delete(req.params.id);
      if (result.affected === 0) return res.status(404).json({ message: "Categoría no encontrada" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error eliminando categoría", error });
    }
  };
}

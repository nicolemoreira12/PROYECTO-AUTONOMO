import { Request, Response } from "express";
import { CategoriaService } from "../services/categoria.service";

const categoriaService = new CategoriaService();

export const getAll = async (_req: Request, res: Response) => {
  try {
    const categorias = await categoriaService.getAll();
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo categorías", error });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const categoria = await categoriaService.getById(parseInt(req.params.id));
    res.json(categoria);
  } catch (error) {
    res.status(404).json({ message: error instanceof Error ? error.message : "Categoría no encontrada" });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const categoria = await categoriaService.create(req.body);
    res.status(201).json(categoria);
  } catch (error) {
    res.status(500).json({ message: "Error creando la categoría", error });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const categoria = await categoriaService.update(parseInt(req.params.id), req.body);
    res.json(categoria);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Error actualizando categoría" });
  }
};

export const deleteCategoria = async (req: Request, res: Response) => {
  try {
    await categoriaService.delete(parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ message: error instanceof Error ? error.message : "Error eliminando categoría" });
  }
};

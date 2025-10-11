import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Producto } from "../entities/Producto";

const productoRepo = AppDataSource.getRepository(Producto);

// Crear producto
export const crearProducto = async (req: Request, res: Response) => {
  try {
    const producto = productoRepo.create(req.body);
    const result = await productoRepo.save(producto);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: "Error al crear producto", error });
  }
};

// Listar todos
export const listarProductos = async (_req: Request, res: Response) => {
  try {
    const productos = await productoRepo.find({ relations: ["emprendedor", "categoria"] });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener productos", error });
  }
};

// Obtener por ID
export const obtenerProducto = async (req: Request, res: Response) => {
  try {
    const producto = await productoRepo.findOne({
      where: { idProducto: parseInt(req.params.id) },
      relations: ["emprendedor", "categoria"],
    });
    if (!producto) return res.status(404).json({ message: "Producto no encontrado" });
    res.json(producto);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener producto", error });
  }
};

// Actualizar
export const actualizarProducto = async (req: Request, res: Response) => {
  try {
    const producto = await productoRepo.findOneBy({ idProducto: parseInt(req.params.id) });
    if (!producto) return res.status(404).json({ message: "Producto no encontrado" });

    productoRepo.merge(producto, req.body);
    const result = await productoRepo.save(producto);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: "Error al actualizar producto", error });
  }
};

// Eliminar
export const eliminarProducto = async (req: Request, res: Response) => {
  try {
    const result = await productoRepo.delete(req.params.id);
    if (result.affected === 0) return res.status(404).json({ message: "Producto no encontrado" });
    res.json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar producto", error });
  }
};

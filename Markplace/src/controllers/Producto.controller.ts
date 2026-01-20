import { Request, Response } from "express";
import { ProductoService } from "../services/Producto.service";

const productoService = new ProductoService();

// Crear producto
export const crearProducto = async (req: Request, res: Response) => {
  try {
    const producto = await productoService.create(req.body);
    res.status(201).json(producto);
  } catch (error) {
    res.status(400).json({ message: "Error al crear producto", error });
  }
};

// Listar todos
export const listarProductos = async (_req: Request, res: Response) => {
  try {
    const productos = await productoService.getAll();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener productos", error });
  }
};

// Obtener por ID
export const obtenerProducto = async (req: Request, res: Response) => {
  try {
    const producto = await productoService.getById(parseInt(req.params.id));
    res.json(producto);
  } catch (error) {
    res.status(404).json({ message: error instanceof Error ? error.message : "Producto no encontrado" });
  }
};

// Actualizar
export const actualizarProducto = async (req: Request, res: Response) => {
  try {
    const producto = await productoService.update(parseInt(req.params.id), req.body);
    res.json(producto);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Error al actualizar producto" });
  }
};

// Eliminar
export const eliminarProducto = async (req: Request, res: Response) => {
  try {
    await productoService.delete(parseInt(req.params.id));
    res.json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Error al eliminar producto" });
  }
};

// Buscar productos
export const buscarProductos = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ message: "La búsqueda debe tener al menos 2 caracteres" });
    }
    const productos = await productoService.search(query);
    res.json(productos);
  } catch (error) {
    res.status(500).json({ message: "Error al buscar productos", error });
  }
};

import { Request, Response } from "express";
import { CarritoService } from "../services/carritocompra.service";

const carritoService = new CarritoService();

export class CarritoController {
  // Métodos para el frontend (usuario autenticado)
  async getCarritoUsuario(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Usuario no autenticado" });
      }
      const carrito = await carritoService.getOrCreateByUsuario(userId);
      res.json(carrito);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener carrito", error });
    }
  }

  async addItem(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Usuario no autenticado" });
      }
      const { productoId, cantidad } = req.body;
      const carrito = await carritoService.addItem(userId, productoId, cantidad || 1);
      res.json(carrito);
    } catch (error) {
      res.status(400).json({ message: "Error al agregar item", error });
    }
  }

  async updateItem(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Usuario no autenticado" });
      }
      const { itemId } = req.params;
      const { cantidad } = req.body;
      const carrito = await carritoService.updateItem(userId, Number(itemId), cantidad);
      res.json(carrito);
    } catch (error) {
      res.status(400).json({ message: "Error al actualizar item", error });
    }
  }

  async removeItem(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Usuario no autenticado" });
      }
      const { itemId } = req.params;
      await carritoService.removeItem(userId, Number(itemId));
      res.json({ message: "Item eliminado del carrito" });
    } catch (error) {
      res.status(400).json({ message: "Error al eliminar item", error });
    }
  }

  async clearCarrito(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Usuario no autenticado" });
      }
      await carritoService.clearCarrito(userId);
      res.json({ message: "Carrito vaciado" });
    } catch (error) {
      res.status(400).json({ message: "Error al vaciar carrito", error });
    }
  }

  // Métodos CRUD admin
  async getAll(req: Request, res: Response) {
    try {
      const data = await carritoService.getAll();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener carritos", error });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const data = await carritoService.getById(Number(req.params.id));
      res.json(data);
    } catch (error) {
      res.status(404).json({ message: error instanceof Error ? error.message : "Carrito no encontrado" });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const data = await carritoService.create(req.body);
      res.status(201).json(data);
    } catch (error) {
      res.status(400).json({ message: "Error al crear carrito", error });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const data = await carritoService.update(Number(req.params.id), req.body);
      res.json(data);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Error al actualizar carrito" });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await carritoService.delete(Number(req.params.id));
      res.json({ message: "Carrito eliminado" });
    } catch (error) {
      res.status(404).json({ message: error instanceof Error ? error.message : "Error al eliminar carrito" });
    }
  }
}

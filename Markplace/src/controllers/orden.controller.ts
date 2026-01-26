import { Request, Response } from "express";
import { OrdenService } from "../services/orden.service";

const service = new OrdenService();

// Interfaz para el request con usuario autenticado
interface AuthRequest extends Request {
  user?: {
    userId?: string;
    sub?: string;
    email?: string;
  };
}

export class OrdenController {
  async getAll(req: Request, res: Response) {
    try {
      const ordenes = await service.getAll();
      res.json(ordenes);
    } catch (err) {
      res.status(500).json({ error: "Error al obtener órdenes" });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const orden = await service.getById(id);
      if (!orden) return res.status(404).json({ message: "Orden no encontrada" });
      res.json(orden);
    } catch (err) {
      res.status(500).json({ error: "Error al obtener orden" });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      // Debug: mostrar datos del usuario del token
      console.log("🔍 Usuario del token:", req.user);
      console.log("🔍 Body recibido:", req.body);

      // Obtener datos del token
      const tokenUserId = req.user?.userId || req.user?.sub;
      const tokenEmail = req.user?.email;
      
      if (!tokenUserId && !tokenEmail) {
        console.error("❌ No se encontró userId ni email en el token");
        return res.status(400).json({
          error: "Error de autenticación",
          details: "No se pudo identificar al usuario"
        });
      }

      const orderData = {
        ...req.body,
        // Usar el usuarioId del body si existe, si no del token
        usuarioId: req.body.usuarioId || req.body.usuarioIdUsuario || tokenUserId,
        // Pasar también el email para búsqueda alternativa
        email: req.body.email || tokenEmail
      };

      console.log("📦 Creando orden con datos finales:", {
        usuarioId: orderData.usuarioId,
        email: orderData.email,
        total: orderData.total,
        estado: orderData.estado
      });

      const nuevaOrden = await service.create(orderData);
      console.log("✅ Orden creada exitosamente:", nuevaOrden.idOrden);
      res.status(201).json(nuevaOrden);
    } catch (err: any) {
      console.error("❌ Error al crear orden:", err.message || err);
      res.status(400).json({
        error: "Error al crear orden",
        details: err.message || "Error desconocido"
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const actualizada = await service.update(id, req.body);
      if (!actualizada) return res.status(404).json({ message: "Orden no encontrada" });
      res.json(actualizada);
    } catch (err) {
      res.status(400).json({ error: "Error al actualizar orden" });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const resultado = await service.delete(id);
      if (!resultado.affected) return res.status(404).json({ message: "Orden no encontrada" });
      res.json({ message: "Orden eliminada correctamente" });
    } catch (err) {
      res.status(500).json({ error: "Error al eliminar orden" });
    }
  }
}

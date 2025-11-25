import { AppDataSource } from "../config/data-source";
import { Orden } from "../entities/Orden";
import { Usuario } from "../entities/Usuario";

const ordenRepo = AppDataSource.getRepository(Orden);
const usuarioRepo = AppDataSource.getRepository(Usuario);

export class OrdenService {
  async getAll() {
    return await ordenRepo.find({ relations: ["usuario", "detalles", "detalles.producto"] });
  }

  async getById(id: number) {
    const orden = await ordenRepo.findOne({
      where: { idOrden: id },
      relations: ["usuario", "detalles", "detalles.producto"],
    });

    if (!orden) {
      throw new Error("Orden no encontrada");
    }

    return orden;
  }

  async create(data: Partial<Orden> & { usuarioIdUsuario?: number; usuarioId?: number }) {
    // Obtener el ID del usuario
    const usuarioId = data.usuarioIdUsuario || data.usuarioId;

    if (!usuarioId) {
      throw new Error("Se requiere usuarioIdUsuario");
    }

    // Buscar el usuario
    const usuario = await usuarioRepo.findOneBy({ idUsuario: usuarioId });
    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }

    // Crear la orden con la relación correcta
    const nuevaOrden = ordenRepo.create({
      usuario,
      estado: data.estado || "pendiente",
      total: data.total,
      fechaOrden: new Date()
    });

    return await ordenRepo.save(nuevaOrden);
  }

  async update(id: number, data: Partial<Orden>) {
    const orden = await ordenRepo.findOneBy({ idOrden: id });

    if (!orden) {
      throw new Error("Orden no encontrada");
    }

    ordenRepo.merge(orden, data);
    return await ordenRepo.save(orden);
  }

  async delete(id: number) {
    const result = await ordenRepo.delete(id);

    if (result.affected === 0) {
      throw new Error("Orden no encontrada");
    }

    return result;
  }
}
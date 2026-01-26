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

  async create(data: Partial<Orden> & { 
    usuarioIdUsuario?: number; 
    usuarioId?: number | string;
    email?: string;
  }) {
    // Obtener el ID del usuario (puede ser numérico o email/UUID)
    const usuarioIdOrEmail = data.usuarioIdUsuario || data.usuarioId || data.email;

    if (!usuarioIdOrEmail) {
      throw new Error("Se requiere usuarioId o email");
    }

    let usuario: Usuario | null = null;

    // Si es un número, buscar por ID
    if (typeof usuarioIdOrEmail === 'number') {
      usuario = await usuarioRepo.findOneBy({ id: usuarioIdOrEmail });
    } 
    // Si es string, puede ser UUID o email
    else if (typeof usuarioIdOrEmail === 'string') {
      // Primero intentar buscar por email
      if (usuarioIdOrEmail.includes('@')) {
        usuario = await usuarioRepo.findOneBy({ email: usuarioIdOrEmail });
      } else {
        // Si no es email, intentar buscar por ID numérico parseado
        const numericId = parseInt(usuarioIdOrEmail, 10);
        if (!isNaN(numericId)) {
          usuario = await usuarioRepo.findOneBy({ id: numericId });
        }
      }
      
      // Si no encontró y hay email en data, buscar por ese email
      if (!usuario && data.email) {
        usuario = await usuarioRepo.findOneBy({ email: data.email });
      }
    }

    if (!usuario) {
      console.error("❌ Usuario no encontrado para:", { usuarioIdOrEmail, email: data.email });
      throw new Error(`Usuario no encontrado. ID/Email: ${usuarioIdOrEmail}`);
    }

    console.log("✅ Usuario encontrado:", usuario.id, usuario.email);

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
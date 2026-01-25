import { AppDataSource } from "../config/data-source";
import { Usuario } from "../entities/Usuario";

const usuarioRepo = AppDataSource.getRepository(Usuario);

export class UsuarioService {
  async getAll() {
    return await usuarioRepo.find();
  }

  async getById(id: number) {
    const usuario = await usuarioRepo.findOne({ where: { id } });
    
    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }
    
    return usuario;
  }

  async getByEmail(email: string) {
    return await usuarioRepo.findOne({ where: { email } });
  }

  async create(data: Partial<Usuario>) {
    try {
      // Verificar si el email ya existe
      if (data.email) {
        const existing = await usuarioRepo.findOne({ where: { email: data.email } });
        if (existing) {
          console.log('⚠️ Usuario ya existe con email:', data.email);
          throw new Error(`Usuario con email ${data.email} ya existe`);
        }
      }

      const nuevo = usuarioRepo.create(data);
      const saved = await usuarioRepo.save(nuevo);
      console.log('✅ Usuario guardado en BD:', { id: saved.id, email: saved.email });
      return saved;
    } catch (error: any) {
      console.error('❌ Error en usuario.service.create:', error);
      // Re-lanzar con información útil
      if (error.code === '23505') { // PostgreSQL unique violation
        throw new Error(`Usuario con email ${data.email} ya existe (duplicate key)`);
      }
      throw error;
    }
  }

  async update(id: number, data: Partial<Usuario>) {
    const usuario = await usuarioRepo.findOneBy({ id });
    
    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }
    
    usuarioRepo.merge(usuario, data);
    return await usuarioRepo.save(usuario);
  }

  async delete(id: number) {
    const result = await usuarioRepo.delete(id);
    
    if (result.affected === 0) {
      throw new Error("Usuario no encontrado");
    }
    
    return result;
  }
}
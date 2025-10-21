import { AppDataSource } from "../config/data-source";
import { Usuario } from "../entities/Usuario";

const usuarioRepo = AppDataSource.getRepository(Usuario);

export class UsuarioService {
  async getAll() {
    return await usuarioRepo.find();
  }

  async getById(id: number) {
    const usuario = await usuarioRepo.findOne({ where: { idUsuario: id } });
    
    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }
    
    return usuario;
  }

  async create(data: Partial<Usuario>) {
    const nuevo = usuarioRepo.create(data);
    return await usuarioRepo.save(nuevo);
  }

  async update(id: number, data: Partial<Usuario>) {
    const usuario = await usuarioRepo.findOneBy({ idUsuario: id });
    
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
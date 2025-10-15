import { AppDataSource } from "../config/data-source";
import { Usuario } from "../entities/Usuario";

const usuarioRepo = AppDataSource.getRepository(Usuario);

export class UsuarioService {
  async getAll() {
    return await usuarioRepo.find();
  }

  async getById(id: number) {
    return await usuarioRepo.findOne({ where: { idUsuario: id } });
  }

  async create(data: Partial<Usuario>) {
    const nuevo = usuarioRepo.create(data);
    return await usuarioRepo.save(nuevo);
  }

  async update(id: number, data: Partial<Usuario>) {
    await usuarioRepo.update(id, data);
    return await this.getById(id);
  }

  async delete(id: number) {
    return await usuarioRepo.delete(id);
  }
}
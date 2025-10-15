import { AppDataSource } from "../config/data-source";
import { Categoria } from "../entities/Categoria";

const categoriaRepo = AppDataSource.getRepository(Categoria);

export class CategoriaService {
  async getAll() {
    return await categoriaRepo.find({ relations: ["productos"] });
  }

  async getById(id: number) {
    return await categoriaRepo.findOne({ where: { idCategoria: id }, relations: ["productos"] });
  }

  async create(data: Partial<Categoria>) {
    const nueva = categoriaRepo.create(data);
    return await categoriaRepo.save(nueva);
  }

  async update(id: number, data: Partial<Categoria>) {
    await categoriaRepo.update(id, data);
    return await this.getById(id);
  }

  async delete(id: number) {
    return await categoriaRepo.delete(id);
  }
}

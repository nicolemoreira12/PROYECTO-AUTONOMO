import { AppDataSource } from "../config/data-source";
import { Categoria } from "../entities/Categoria";

const categoriaRepo = AppDataSource.getRepository(Categoria);

export class CategoriaService {
  async getAll() {
    return await categoriaRepo.find({ relations: ["productos"] });
  }

  async getById(id: number) {
    const categoria = await categoriaRepo.findOne({ 
      where: { idCategoria: id }, 
      relations: ["productos"] 
    });
    
    if (!categoria) {
      throw new Error("Categoría no encontrada");
    }
    
    return categoria;
  }

  async create(data: Partial<Categoria>) {
    const nueva = categoriaRepo.create(data);
    return await categoriaRepo.save(nueva);
  }

  async update(id: number, data: Partial<Categoria>) {
    const categoria = await categoriaRepo.findOneBy({ idCategoria: id });
    
    if (!categoria) {
      throw new Error("Categoría no encontrada");
    }
    
    categoriaRepo.merge(categoria, data);
    return await categoriaRepo.save(categoria);
  }

  async delete(id: number) {
    const result = await categoriaRepo.delete(id);
    
    if (result.affected === 0) {
      throw new Error("Categoría no encontrada");
    }
    
    return result;
  }
}

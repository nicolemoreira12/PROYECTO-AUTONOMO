import { AppDataSource } from "../config/data-source";
import { Emprendedor } from "../entities/Emprendedor";

const emprendedorRepo = AppDataSource.getRepository(Emprendedor);

export class EmprendedorService {
  async getAll() {
    return await emprendedorRepo.find({ relations: ["productos"] });
  }

  async getById(id: number) {
    const emprendedor = await emprendedorRepo.findOne({
      where: { idEmprendedor: id },
      relations: ["productos"],
    });
    
    if (!emprendedor) {
      throw new Error("Emprendedor no encontrado");
    }
    
    return emprendedor;
  }

  async create(data: Partial<Emprendedor>) {
    const nuevo = emprendedorRepo.create(data);
    return await emprendedorRepo.save(nuevo);
  }

  async update(id: number, data: Partial<Emprendedor>) {
    const emprendedor = await emprendedorRepo.findOneBy({ idEmprendedor: id });
    
    if (!emprendedor) {
      throw new Error("Emprendedor no encontrado");
    }
    
    emprendedorRepo.merge(emprendedor, data);
    return await emprendedorRepo.save(emprendedor);
  }

  async delete(id: number) {
    const result = await emprendedorRepo.delete(id);
    
    if (result.affected === 0) {
      throw new Error("Emprendedor no encontrado");
    }
    
    return result;
  }
}

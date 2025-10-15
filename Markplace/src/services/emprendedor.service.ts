import { AppDataSource } from "../config/data-source";
import { Emprendedor } from "../entities/Emprendedor";

const emprendedorRepo = AppDataSource.getRepository(Emprendedor);

export class EmprendedorService {
  async getAll() {
    return await emprendedorRepo.find({ relations: ["productos"] });
  }

  async getById(id: number) {
    return await emprendedorRepo.findOne({
      where: { idEmprendedor: id },
      relations: ["productos"],
    });
  }

  async create(data: Partial<Emprendedor>) {
    const nuevo = emprendedorRepo.create(data);
    return await emprendedorRepo.save(nuevo);
  }

  async update(id: number, data: Partial<Emprendedor>) {
    await emprendedorRepo.update(id, data);
    return await this.getById(id);
  }

  async delete(id: number) {
    return await emprendedorRepo.delete(id);
  }
}

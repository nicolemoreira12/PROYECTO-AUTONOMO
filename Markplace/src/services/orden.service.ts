import { AppDataSource } from "../config/data-source";
import { Orden } from "../entities/Orden";

const ordenRepo = AppDataSource.getRepository(Orden);

export class OrdenService {
  async getAll() {
    return await ordenRepo.find({ relations: ["usuario", "detalles", "detalles.producto"] });
  }
  async getById(id: number) {
    return await ordenRepo.findOne({
        where: { idOrden: id },
        relations: ["usuario", "detalles", "detalles.producto"],
    });
  }

  async create(data: Partial<Orden>) {
    const nuevo = ordenRepo.create(data);
    return await ordenRepo.save(nuevo);
  } 

  async update(id: number, data: Partial<Orden>) {
    await ordenRepo.update(id, data);
    return await this.getById(id);
  } 
    async delete(id: number) {
    return await ordenRepo.delete(id);
  } 
}
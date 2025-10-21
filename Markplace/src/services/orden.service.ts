import { AppDataSource } from "../config/data-source";
import { Orden } from "../entities/Orden";

const ordenRepo = AppDataSource.getRepository(Orden);

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

  async create(data: Partial<Orden>) {
    const nuevo = ordenRepo.create(data);
    return await ordenRepo.save(nuevo);
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
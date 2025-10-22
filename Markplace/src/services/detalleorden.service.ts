import { AppDataSource } from "../config/data-source";
import { DetalleOrden } from "../entities/DetalleOrden";

const detalleOrdenRepo = AppDataSource.getRepository(DetalleOrden);

export class DetalleOrdenService {
  async getAll() {
    return await detalleOrdenRepo.find({ relations: ["orden", "producto"] });
  }

  async getById(id: number) {
    const detalle = await detalleOrdenRepo.findOne({ 
      where: { idDetalleOrden: id }, 
      relations: ["orden", "producto"] 
    });
    
    if (!detalle) {
      throw new Error("Detalle de orden no encontrado");
    }
    
    return detalle;
  }

  async create(data: Partial<DetalleOrden>) {
    const nuevo = detalleOrdenRepo.create(data);
    return await detalleOrdenRepo.save(nuevo);
  }

  async update(id: number, data: Partial<DetalleOrden>) {
    const detalle = await detalleOrdenRepo.findOneBy({ idDetalleOrden: id });
    
    if (!detalle) {
      throw new Error("Detalle de orden no encontrado");
    }
    
    detalleOrdenRepo.merge(detalle, data);
    return await detalleOrdenRepo.save(detalle);
  }

  async delete(id: number) {
    const result = await detalleOrdenRepo.delete(id);
    
    if (result.affected === 0) {
      throw new Error("Detalle de orden no encontrado");
    }
    
    return result;
  }
}

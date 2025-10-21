import { AppDataSource } from "../config/data-source";
import { DetalleCarrito } from "../entities/DetalleCarrito";

const detalleRepo = AppDataSource.getRepository(DetalleCarrito);

export class DetalleCarritoService {
  async getAll() {
    return await detalleRepo.find({ relations: ["carrito", "producto"] });
  }

  async getById(id: number) {
    const detalle = await detalleRepo.findOne({ 
      where: { idDetalleCarrito: id }, 
      relations: ["carrito", "producto"] 
    });
    
    if (!detalle) {
      throw new Error("Detalle de carrito no encontrado");
    }
    
    return detalle;
  }

  async create(data: Partial<DetalleCarrito>) {
    const nuevo = detalleRepo.create(data);
    return await detalleRepo.save(nuevo);
  }

  async update(id: number, data: Partial<DetalleCarrito>) {
    const detalle = await detalleRepo.findOneBy({ idDetalleCarrito: id });
    
    if (!detalle) {
      throw new Error("Detalle de carrito no encontrado");
    }
    
    detalleRepo.merge(detalle, data);
    return await detalleRepo.save(detalle);
  }

  async delete(id: number) {
    const result = await detalleRepo.delete(id);
    
    if (result.affected === 0) {
      throw new Error("Detalle de carrito no encontrado");
    }
    
    return result;
  }
}

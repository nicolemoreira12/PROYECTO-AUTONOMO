import { AppDataSource } from "../config/data-source";
import { CarritoCompra } from "../entities/CarritoCompra";

const carritoRepo = AppDataSource.getRepository(CarritoCompra);

export class CarritoService {
  async getAll() {
    return await carritoRepo.find({ relations: ["usuario", "detalles", "detalles.producto"] });
  }

  async getById(id: number) {
    const carrito = await carritoRepo.findOne({ 
      where: { idCarrito: id }, 
      relations: ["usuario", "detalles", "detalles.producto"] 
    });
    
    if (!carrito) {
      throw new Error("Carrito no encontrado");
    }
    
    return carrito;
  }

  async create(data: Partial<CarritoCompra>) {
    const nuevo = carritoRepo.create(data);
    return await carritoRepo.save(nuevo);
  }

  async update(id: number, data: Partial<CarritoCompra>) {
    const carrito = await carritoRepo.findOneBy({ idCarrito: id });
    
    if (!carrito) {
      throw new Error("Carrito no encontrado");
    }
    
    carritoRepo.merge(carrito, data);
    return await carritoRepo.save(carrito);
  }

  async delete(id: number) {
    const result = await carritoRepo.delete(id);
    
    if (result.affected === 0) {
      throw new Error("Carrito no encontrado");
    }
    
    return result;
  }
}

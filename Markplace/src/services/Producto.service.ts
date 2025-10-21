import { AppDataSource } from "../config/data-source";
import { Producto } from "../entities/Producto";

const productoRepo = AppDataSource.getRepository(Producto);

export class ProductoService {
  async getAll() {
    return await productoRepo.find({ relations: ["emprendedor", "categoria"] });
  }

  async getById(id: number) {
    const producto = await productoRepo.findOne({ 
      where: { idProducto: id }, 
      relations: ["emprendedor", "categoria"] 
    });
    
    if (!producto) {
      throw new Error("Producto no encontrado");
    }
    
    return producto;
  }

  async create(data: Partial<Producto>) {
    const nuevo = productoRepo.create(data);
    return await productoRepo.save(nuevo);
  }

  async update(id: number, data: Partial<Producto>) {
    const producto = await productoRepo.findOneBy({ idProducto: id });
    
    if (!producto) {
      throw new Error("Producto no encontrado");
    }
    
    productoRepo.merge(producto, data);
    return await productoRepo.save(producto);
  }

  async delete(id: number) {
    const result = await productoRepo.delete(id);
    
    if (result.affected === 0) {
      throw new Error("Producto no encontrado");
    }
    
    return result;
  }
}

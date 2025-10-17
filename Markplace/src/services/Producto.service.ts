import { AppDataSource } from "../config/data-source";
import { Producto } from "../entities/Producto";

const productoRepo = AppDataSource.getRepository(Producto);

export class ProductoService {
  async getAll() {
    return await productoRepo.find({ relations: ["emprendedor", "categoria"] });
  }

  async getById(id: number) {
    return await productoRepo.findOne({ where: { idProducto: id }, relations: ["emprendedor", "categoria"] });
  }

  async create(data: Partial<Producto>) {
    return await productoRepo.save(data);
  }

  async update(id: number, data: Partial<Producto>) {
    await productoRepo.update(id, data);
    return await this.getById(id);
  }

  async delete(id: number) {
    return await productoRepo.delete(id);
  }
}

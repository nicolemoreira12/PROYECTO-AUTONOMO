import { AppDataSource } from "../config/data-source";
import { CarritoCompra } from "../entities/CarritoCompra";

const carritoRepo = AppDataSource.getRepository(CarritoCompra);

export class CarritoService {
  async getAll() {
    return await carritoRepo.find({ relations: ["usuario", "detalles", "detalles.producto"] });
  }

  async getById(id: number) {
    return await carritoRepo.findOne({ where: { idCarrito: id }, relations: ["usuario", "detalles", "detalles.producto"] });
  }

  async create(data: Partial<CarritoCompra>) {
    const nuevo = carritoRepo.create(data);
    return await carritoRepo.save(nuevo);
  }

  async update(id: number, data: Partial<CarritoCompra>) {
    await carritoRepo.update(id, data);
    return await this.getById(id);
  }

  async delete(id: number) {
    return await carritoRepo.delete(id);
  }
}

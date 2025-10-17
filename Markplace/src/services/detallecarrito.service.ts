import { AppDataSource } from "../config/data-source";
import { DetalleCarrito } from "../entities/DetalleCarrito";

const detalleRepo = AppDataSource.getRepository(DetalleCarrito);

export class DetalleCarritoService {
  async getAll() {
    return await detalleRepo.find({ relations: ["carrito", "producto"] });
  }

  async getById(id: number) {
    return await detalleRepo.findOne({ where: { idDetalleCarrito: id }, relations: ["carrito", "producto"] });
  }

  async create(data: Partial<DetalleCarrito>) {
    const nuevo = detalleRepo.create(data);
    return await detalleRepo.save(nuevo);
  }

  async update(id: number, data: Partial<DetalleCarrito>) {
    await detalleRepo.update(id, data);
    return await this.getById(id);
  }

  async delete(id: number) {
    return await detalleRepo.delete(id);
  }
}

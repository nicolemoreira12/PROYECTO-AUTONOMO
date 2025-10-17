import { AppDataSource } from "../config/data-source";
import { TarjetaVirtual } from "../entities/TarjetaVirtual";

const tarjetaRepo = AppDataSource.getRepository(TarjetaVirtual);

export class TarjetaVirtualService {
  async getAll() {
    return await tarjetaRepo.find({ relations: ["usuario"] });
  }

  async getById(id: number) {
    return await tarjetaRepo.findOne({ where: { idTarjeta: id }, relations: ["usuario"] });
  }

  async create(data: Partial<TarjetaVirtual>) {
    const nueva = tarjetaRepo.create(data);
    return await tarjetaRepo.save(nueva);
  }

  async update(id: number, data: Partial<TarjetaVirtual>) {
    await tarjetaRepo.update(id, data);
    return await this.getById(id);
  }

  async delete(id: number) {
    return await tarjetaRepo.delete(id);
  }
}

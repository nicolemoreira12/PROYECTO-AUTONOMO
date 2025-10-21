import { AppDataSource } from "../config/data-source";
import { TarjetaVirtual } from "../entities/TarjetaVirtual";

const tarjetaRepo = AppDataSource.getRepository(TarjetaVirtual);

export class TarjetaVirtualService {
  async getAll() {
    return await tarjetaRepo.find({ relations: ["usuario"] });
  }

  async getById(id: number) {
    const tarjeta = await tarjetaRepo.findOne({ 
      where: { idTarjeta: id }, 
      relations: ["usuario"] 
    });
    
    if (!tarjeta) {
      throw new Error("Tarjeta no encontrada");
    }
    
    return tarjeta;
  }

  async create(data: Partial<TarjetaVirtual>) {
    const nueva = tarjetaRepo.create(data);
    return await tarjetaRepo.save(nueva);
  }

  async update(id: number, data: Partial<TarjetaVirtual>) {
    const tarjeta = await tarjetaRepo.findOneBy({ idTarjeta: id });
    
    if (!tarjeta) {
      throw new Error("Tarjeta no encontrada");
    }
    
    tarjetaRepo.merge(tarjeta, data);
    return await tarjetaRepo.save(tarjeta);
  }

  async delete(id: number) {
    const result = await tarjetaRepo.delete(id);
    
    if (result.affected === 0) {
      throw new Error("Tarjeta no encontrada");
    }
    
    return result;
  }
}

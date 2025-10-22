import { AppDataSource } from "../config/data-source";
import { Pago } from "../entities/Pago";

const pagoRepo = AppDataSource.getRepository(Pago);

export class PagoService {
  async getAll() {
    return await pagoRepo.find({ relations: ["orden"] });
  }

  async getById(id: number) {
    const pago = await pagoRepo.findOne({ 
      where: { idPago: id }, 
      relations: ["orden"] 
    });
    
    if (!pago) {
      throw new Error("Pago no encontrado");
    }
    
    return pago;
  }

  async create(data: Partial<Pago>) {
    const nuevo = pagoRepo.create(data);
    return await pagoRepo.save(nuevo);
  }

  async update(id: number, data: Partial<Pago>) {
    const pago = await pagoRepo.findOneBy({ idPago: id });
    
    if (!pago) {
      throw new Error("Pago no encontrado");
    }
    
    pagoRepo.merge(pago, data);
    return await pagoRepo.save(pago);
  }

  async delete(id: number) {
    const result = await pagoRepo.delete(id);
    
    if (result.affected === 0) {
      throw new Error("Pago no encontrado");
    }
    
    return result;
  }
}

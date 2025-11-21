import { AppDataSource } from "../config/data-source";
import { Orden } from "../entities/Orden";
import { pubsub, ORDER_CREATED } from "../graphql/pubsub";
import { wsClient } from "./websocket.client";

const ordenRepo = AppDataSource.getRepository(Orden);

export class OrdenService {
  async getAll() {
    return await ordenRepo.find({ relations: ["usuario", "detalles", "detalles.producto"] });
  }
  
  async getById(id: number) {
    const orden = await ordenRepo.findOne({
        where: { idOrden: id },
        relations: ["usuario", "detalles", "detalles.producto"],
    });
    
    if (!orden) {
      throw new Error("Orden no encontrada");
    }
    
    return orden;
  }

  async create(data: Partial<Orden>) {
    const nuevo = ordenRepo.create(data);
    const saved = await ordenRepo.save(nuevo);
    try { pubsub.publish(ORDER_CREATED, { orderCreated: saved }); } catch (e) { console.warn(e); }
    try { wsClient.createOrder(saved); } catch (e) { }
    return saved;
  } 

  async update(id: number, data: Partial<Orden>) {
    const orden = await ordenRepo.findOneBy({ idOrden: id });
    
    if (!orden) {
      throw new Error("Orden no encontrada");
    }
    
    ordenRepo.merge(orden, data);
    const saved = await ordenRepo.save(orden);
    try { pubsub.publish(ORDER_CREATED, { orderCreated: saved }); } catch {}
    try { wsClient.updateOrder(String(id), saved); } catch {}
    return saved;
  } 
  
  async delete(id: number) {
    const result = await ordenRepo.delete(id);
    
    if (result.affected === 0) {
      throw new Error("Orden no encontrada");
    }
    
    return result;
  } 
}
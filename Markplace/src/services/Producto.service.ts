import { AppDataSource } from "../config/data-source";
import { Producto } from "../entities/Producto";
import { pubsub, PRODUCT_ADDED } from "../graphql/pubsub";
import { wsClient } from "./websocket.client";

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
    const saved = await productoRepo.save(nuevo);
    // Publicar evento para GraphQL subscriptions
    try {
      pubsub.publish(PRODUCT_ADDED, { productAdded: saved });
    } catch (e) {
      console.warn("Could not publish PRODUCT_ADDED", e);
    }
    // Enviar al WebSocket externo si está conectado
    try {
      wsClient.addProduct(saved);
    } catch (e) {
      // no bloquear si falla WS
    }
    return saved;
  }

  async update(id: number, data: Partial<Producto>) {
    const producto = await productoRepo.findOneBy({ idProducto: id });
    
    if (!producto) {
      throw new Error("Producto no encontrado");
    }
    
    productoRepo.merge(producto, data);
    const saved = await productoRepo.save(producto);
    try { pubsub.publish(PRODUCT_ADDED, { productAdded: saved }); } catch {}
    try { wsClient.updateProduct(String(id), saved); } catch {}
    return saved;
  }

  async delete(id: number) {
    const result = await productoRepo.delete(id);
    
    if (result.affected === 0) {
      throw new Error("Producto no encontrado");
    }
    
    return result;
  }

  async search(query: string) {
    return await productoRepo
      .createQueryBuilder("producto")
      .leftJoinAndSelect("producto.emprendedor", "emprendedor")
      .leftJoinAndSelect("producto.categoria", "categoria")
      .where("LOWER(producto.nombreProducto) LIKE LOWER(:query)", { query: `%${query}%` })
      .orWhere("LOWER(producto.descripcion) LIKE LOWER(:query)", { query: `%${query}%` })
      .getMany();
  }
}

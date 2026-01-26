import { AppDataSource } from "../config/data-source";
import { DetalleOrden } from "../entities/DetalleOrden";
import { Producto } from "../entities/Producto";
import { Orden } from "../entities/Orden";

const detalleOrdenRepo = AppDataSource.getRepository(DetalleOrden);
const productoRepo = AppDataSource.getRepository(Producto);
const ordenRepo = AppDataSource.getRepository(Orden);

export class DetalleOrdenService {
  async getAll() {
    return await detalleOrdenRepo.find({ relations: ["orden", "producto"] });
  }

  async getById(id: number) {
    const detalle = await detalleOrdenRepo.findOne({
      where: { idDetalleOrden: id },
      relations: ["orden", "producto"]
    });

    if (!detalle) {
      throw new Error("Detalle de orden no encontrado");
    }

    return detalle;
  }

  async create(data: Partial<DetalleOrden> & {
    productoId?: number;
    ordenId?: number;
  }) {
    // Obtener el producto
    const productoId = data.productoId || (data.producto as any)?.idProducto;
    if (!productoId) {
      throw new Error("Se requiere el ID del producto");
    }

    const producto = await productoRepo.findOneBy({ idProducto: productoId });
    if (!producto) {
      throw new Error("Producto no encontrado");
    }

    // Verificar stock disponible
    const cantidad = data.cantidad || 1;
    if (producto.stock < cantidad) {
      throw new Error(`Stock insuficiente. Disponible: ${producto.stock}, Solicitado: ${cantidad}`);
    }

    // Obtener la orden
    const ordenId = data.ordenId || (data.orden as any)?.idOrden;
    if (!ordenId) {
      throw new Error("Se requiere el ID de la orden");
    }

    const orden = await ordenRepo.findOneBy({ idOrden: ordenId });
    if (!orden) {
      throw new Error("Orden no encontrada");
    }

    // Crear el detalle de orden
    const nuevo = detalleOrdenRepo.create({
      orden,
      producto,
      cantidad,
      precioUnitario: data.precioUnitario || producto.precio,
      subtotal: data.subtotal || (data.precioUnitario || producto.precio) * cantidad
    });

    const detalleGuardado = await detalleOrdenRepo.save(nuevo);

    // Descontar del inventario
    producto.stock -= cantidad;
    await productoRepo.save(producto);
    console.log(`📦 Stock actualizado para ${producto.nombreProducto}: ${producto.stock + cantidad} -> ${producto.stock}`);

    return detalleGuardado;
  }

  async update(id: number, data: Partial<DetalleOrden>) {
    const detalle = await detalleOrdenRepo.findOneBy({ idDetalleOrden: id });

    if (!detalle) {
      throw new Error("Detalle de orden no encontrado");
    }

    detalleOrdenRepo.merge(detalle, data);
    return await detalleOrdenRepo.save(detalle);
  }

  async delete(id: number) {
    const result = await detalleOrdenRepo.delete(id);

    if (result.affected === 0) {
      throw new Error("Detalle de orden no encontrado");
    }

    return result;
  }
}

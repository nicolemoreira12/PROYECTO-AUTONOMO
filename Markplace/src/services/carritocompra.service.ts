import { AppDataSource } from "../config/data-source";
import { CarritoCompra } from "../entities/CarritoCompra";
import { DetalleCarrito } from "../entities/DetalleCarrito";
import { Producto } from "../entities/Producto";
import { Usuario } from "../entities/Usuario";

const carritoRepo = AppDataSource.getRepository(CarritoCompra);
const detalleCarritoRepo = AppDataSource.getRepository(DetalleCarrito);
const productoRepo = AppDataSource.getRepository(Producto);
const usuarioRepo = AppDataSource.getRepository(Usuario);

export class CarritoService {
  // Métodos para el frontend
  async getOrCreateByUsuario(userIdOrEmail: number | string) {
    let usuario;

    // Si es número, buscar por ID
    if (typeof userIdOrEmail === 'number') {
      usuario = await usuarioRepo.findOneBy({ id: userIdOrEmail });
    }
    // Si es string, puede ser email o ID numérico como string
    else if (typeof userIdOrEmail === 'string') {
      if (userIdOrEmail.includes('@')) {
        // Buscar por email
        usuario = await usuarioRepo.findOneBy({ email: userIdOrEmail });
      } else {
        // Intentar como ID numérico
        const numericId = parseInt(userIdOrEmail, 10);
        if (!isNaN(numericId)) {
          usuario = await usuarioRepo.findOneBy({ id: numericId });
        }
      }
    }

    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }

    let carrito = await carritoRepo.findOne({
      where: { usuario: { id: usuario.id } },
      relations: ["detalles", "detalles.producto", "detalles.producto.categoria", "detalles.producto.emprendedor"]
    });

    if (!carrito) {
      // Crear carrito nuevo si no existe
      carrito = carritoRepo.create({
        usuario,
        total: 0,
        fechaCreacion: new Date()
      });
      carrito = await carritoRepo.save(carrito);
    }

    return carrito;
  }

  async addItem(userId: number | string, productoId: number, cantidad: number) {
    const carrito = await this.getOrCreateByUsuario(userId);
    const producto = await productoRepo.findOne({
      where: { idProducto: productoId },
      relations: ["categoria", "emprendedor"]
    });

    if (!producto) {
      throw new Error("Producto no encontrado");
    }

    if (producto.stock < cantidad) {
      throw new Error("Stock insuficiente");
    }

    // Verificar si el producto ya está en el carrito
    let detalle = await detalleCarritoRepo.findOne({
      where: {
        carrito: { idCarrito: carrito.idCarrito },
        producto: { idProducto: productoId }
      }
    });

    if (detalle) {
      // Actualizar cantidad
      detalle.cantidad += cantidad;
      detalle.subtotal = detalle.cantidad * detalle.precioUnitario;
      await detalleCarritoRepo.save(detalle);
    } else {
      // Crear nuevo detalle
      detalle = detalleCarritoRepo.create({
        carrito,
        producto,
        cantidad,
        precioUnitario: producto.precio,
        subtotal: producto.precio * cantidad
      });
      await detalleCarritoRepo.save(detalle);
    }

    // Recalcular total del carrito
    await this.recalcularTotal(carrito.idCarrito);

    return await this.getOrCreateByUsuario(userId);
  }

  async updateItem(userId: number | string, itemId: number, cantidad: number) {
    const carrito = await this.getOrCreateByUsuario(userId);
    const detalle = await detalleCarritoRepo.findOne({
      where: {
        idDetalle: itemId,
        carrito: { idCarrito: carrito.idCarrito }
      },
      relations: ["producto"]
    });

    if (!detalle) {
      throw new Error("Item no encontrado en el carrito");
    }

    if (detalle.producto.stock < cantidad) {
      throw new Error("Stock insuficiente");
    }

    detalle.cantidad = cantidad;
    detalle.subtotal = detalle.cantidad * detalle.precioUnitario;
    await detalleCarritoRepo.save(detalle);

    await this.recalcularTotal(carrito.idCarrito);

    return await this.getOrCreateByUsuario(userId);
  }

  async removeItem(userId: number | string, itemId: number) {
    const carrito = await this.getOrCreateByUsuario(userId);
    const detalle = await detalleCarritoRepo.findOne({
      where: {
        idDetalle: itemId,
        carrito: { idCarrito: carrito.idCarrito }
      }
    });

    if (!detalle) {
      throw new Error("Item no encontrado en el carrito");
    }

    await detalleCarritoRepo.remove(detalle);
    await this.recalcularTotal(carrito.idCarrito);
  }

  async clearCarrito(userId: number | string) {
    const carrito = await this.getOrCreateByUsuario(userId);
    await detalleCarritoRepo.delete({ carrito: { idCarrito: carrito.idCarrito } });
    carrito.total = 0;
    await carritoRepo.save(carrito);
  }

  private async recalcularTotal(carritoId: number) {
    const carrito = await carritoRepo.findOne({
      where: { idCarrito: carritoId },
      relations: ["detalles"]
    });

    if (carrito) {
      carrito.total = carrito.detalles.reduce((sum, detalle) => sum + Number(detalle.subtotal), 0);
      await carritoRepo.save(carrito);
    }
  }

  // Métodos CRUD admin
  async getAll() {
    return await carritoRepo.find({ relations: ["usuario", "detalles", "detalles.producto"] });
  }

  async getById(id: number) {
    const carrito = await carritoRepo.findOne({
      where: { idCarrito: id },
      relations: ["usuario", "detalles", "detalles.producto"]
    });

    if (!carrito) {
      throw new Error("Carrito no encontrado");
    }

    return carrito;
  }

  async create(data: Partial<CarritoCompra>) {
    const nuevo = carritoRepo.create(data);
    return await carritoRepo.save(nuevo);
  }

  async update(id: number, data: Partial<CarritoCompra>) {
    const carrito = await carritoRepo.findOneBy({ idCarrito: id });

    if (!carrito) {
      throw new Error("Carrito no encontrado");
    }

    carritoRepo.merge(carrito, data);
    return await carritoRepo.save(carrito);
  }

  async delete(id: number) {
    const result = await carritoRepo.delete(id);

    if (result.affected === 0) {
      throw new Error("Carrito no encontrado");
    }

    return result;
  }
}

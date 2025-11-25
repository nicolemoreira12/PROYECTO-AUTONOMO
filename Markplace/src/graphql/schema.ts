const GraphQLJSON: any = require("graphql-type-json");
import { ProductoService } from "../services/Producto.service";
import { OrdenService } from "../services/orden.service";
import { UsuarioService } from "../services/usuario.service";
import { CategoriaService } from "../services/categoria.service";
import { EmprendedorService } from "../services/emprendedor.service";
import { CarritoService } from "../services/carritocompra.service";
import { DetalleCarritoService } from "../services/detallecarrito.service";
import { DetalleOrdenService } from "../services/detalleorden.service";
import { PagoService } from "../services/pago.service";
import { TarjetaVirtualService } from "../services/TarjetaVirtual.service";
import { TransaccionService } from "../services/transaccion.service";
import { pubsub, PRODUCT_ADDED, ORDER_CREATED } from "./pubsub";

const productoService = new ProductoService();
const ordenService = new OrdenService();
const usuarioService = new UsuarioService();
const categoriaService = new CategoriaService();
const emprendedorService = new EmprendedorService();
const carritoService = new CarritoService();
const detalleCarritoService = new DetalleCarritoService();
const detalleOrdenService = new DetalleOrdenService();
const pagoService = new PagoService();
const tarjetaService = new TarjetaVirtualService();
const transaccionService = new TransaccionService();

export const typeDefs = `
  type Producto {
    idProducto: Int
    nombreProducto: String
    descripcion: String
    precio: Float
    stock: Int
    imagenURL: String
    emprendedor: JSON
    categoria: JSON
  }

  type Orden {
    idOrden: Int
    fechaOrden: String
    estado: String
    total: Float
    usuario: JSON
    detalles: JSON
  }

  scalar JSON

  type Query {
    productos: [Producto]
    producto(id: Int!): Producto
    ordenes: [Orden]
    orden(id: Int!): Orden
    usuarios: [JSON]
    usuario(id: Int!): JSON
    categorias: [JSON]
    categoria(id: Int!): JSON
    emprendedores: [JSON]
    emprendedor(id: Int!): JSON
    carritos: [JSON]
    carrito(id: Int!): JSON
    detalleCarritos: [JSON]
    detalleCarrito(id: Int!): JSON
    detalleOrdenes: [JSON]
    detalleOrden(id: Int!): JSON
    pagos: [JSON]
    pago(id: Int!): JSON
    tarjetas: [JSON]
    tarjeta(id: Int!): JSON
    transacciones: [JSON]
    transaccion(id: Int!): JSON
  }

  type Mutation {
    crearProducto(nombreProducto: String!, descripcion: String, precio: Float, stock: Int, imagenURL: String): Producto
    crearOrden(input: JSON): Orden
  }

  type Subscription {
    productAdded: Producto
    orderCreated: Orden
  }
`;

export const resolvers = {
  JSON: GraphQLJSON,
  Query: {
    productos: async () => await productoService.getAll(),
    producto: async (_: any, { id }: { id: number }) => await productoService.getById(id),
    ordenes: async () => await ordenService.getAll(),
    orden: async (_: any, { id }: { id: number }) => await ordenService.getById(id),
  },
  Mutation: {
    crearProducto: async (_: any, args: any) => {
      const data = {
        nombreProducto: args.nombreProducto,
        descripcion: args.descripcion,
        precio: args.precio,
        stock: args.stock,
        imagenURL: args.imagenURL,
      };
      const creado = await productoService.create(data);
      // publicar evento
      pubsub.publish(PRODUCT_ADDED, { productAdded: creado });
      return creado;
    },
    crearOrden: async (_: any, { input }: any) => {
      // Normalizar relaciones: usuario y productos en detalles
      try {
        if (input && input.usuario && input.usuario.idUsuario) {
          const user = await usuarioService.getById(input.usuario.idUsuario);
          input.usuario = user;
        }

        if (input && Array.isArray(input.detalles)) {
          const detalles = [] as any[];
          for (const d of input.detalles) {
            const det: any = { ...d };
            if (d.producto && d.producto.idProducto) {
              const prod = await productoService.getById(d.producto.idProducto);
              det.producto = prod;
            }
            detalles.push(det);
          }
          input.detalles = detalles;
        }
      } catch (e) {
        // si alguna relación no existe, lanzar error para que el cliente lo vea
        throw e;
      }

      // Construir objeto de orden con tipos correctos para TypeORM
      const ordenPayload: any = {
        fechaOrden: input && input.fechaOrden ? new Date(input.fechaOrden) : new Date(),
        estado: input && input.estado ? String(input.estado) : "PENDIENTE",
        total: input && input.total ? Number(input.total) : 0,
        usuario: input && input.usuario ? input.usuario : undefined,
        detalles: input && input.detalles ? input.detalles : [],
      };

      const creado = await ordenService.create(ordenPayload);
      pubsub.publish(ORDER_CREATED, { orderCreated: creado });
      return creado;
    }
  },
  Subscription: {
    productAdded: {
      subscribe: () => (pubsub as any).asyncIterator([PRODUCT_ADDED])
    },
    orderCreated: {
      subscribe: () => (pubsub as any).asyncIterator([ORDER_CREATED])
    }
  }
};

// Extender resolvers con nuevas queries
(module.exports = module.exports || {});
exports.resolvers = {
  ...module.exports.resolvers,
  JSON: GraphQLJSON,
  Query: {
    ...(module.exports.resolvers && module.exports.resolvers.Query),
    usuarios: async () => await usuarioService.getAll(),
    usuario: async (_: any, { id }: { id: number }) => await usuarioService.getById(id),
    categorias: async () => await categoriaService.getAll(),
    categoria: async (_: any, { id }: { id: number }) => await categoriaService.getById(id),
    emprendedores: async () => await emprendedorService.getAll(),
    emprendedor: async (_: any, { id }: { id: number }) => await emprendedorService.getById(id),
    carritos: async () => await carritoService.getAll(),
    carrito: async (_: any, { id }: { id: number }) => await carritoService.getById(id),
    detalleCarritos: async () => await detalleCarritoService.getAll(),
    detalleCarrito: async (_: any, { id }: { id: number }) => await detalleCarritoService.getById(id),
    detalleOrdenes: async () => await detalleOrdenService.getAll(),
    detalleOrden: async (_: any, { id }: { id: number }) => await detalleOrdenService.getById(id),
    pagos: async () => await pagoService.getAll(),
    pago: async (_: any, { id }: { id: number }) => await pagoService.getById(id),
    tarjetas: async () => await tarjetaService.getAll(),
    tarjeta: async (_: any, { id }: { id: number }) => await tarjetaService.getById(id),
    transacciones: async () => await transaccionService.getAll(),
    transaccion: async (_: any, { id }: { id: number }) => await transaccionService.getById(id),
  }
};

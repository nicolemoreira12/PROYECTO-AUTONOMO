import "reflect-metadata";
import { DataSource } from "typeorm";
import { Usuario } from "../entities/Usuario";
import { Producto } from "../entities/Producto";
import { Emprendedor } from "../entities/Emprendedor";
import { Categoria } from "../entities/Categoria";
import { CarritoCompra } from "../entities/CarritoCompra";
import { DetalleCarrito } from "../entities/DetalleCarrito";
import { Orden } from "../entities/Orden";
import { DetalleOrden } from "../entities/DetalleOrden";
import { Pago } from "../entities/Pago";
import { TarjetaVirtual } from "../entities/TarjetaVirtual";
import { Transaccion } from "../entities/Transaccion";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "admin",
  database: process.env.DB_NAME || "marketplace",
  synchronize: true,
  logging: true,
  // Configuración SSL condicional
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  extra: process.env.DB_SSL === "true" ? { ssl: { rejectUnauthorized: false } } : {},
  entities: [
    Usuario,
    Producto,
    Emprendedor,
    Categoria,
    CarritoCompra,
    DetalleCarrito,
    Orden,
    DetalleOrden,
    Pago,
    TarjetaVirtual,
    Transaccion
  ],
  subscribers: [],
  migrations: [],
});

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
  host: process.env.DB_HOST || "aws-0-us-east-1.pooler.supabase.com",
  port: Number(process.env.DB_PORT) || 6543,
  username: process.env.DB_USER || "postgres.rvyietphxsbrrehlaeji",
  password: process.env.DB_PASS || "XNxVcxgoKwhzv60G",
  database: process.env.DB_NAME || "postgres",
  synchronize: true,
  logging: true,
  // Configuración SSL para Supabase (requerido para conexiones remotas)
  ssl: { rejectUnauthorized: false },
  // A veces los poolers (ej. Supabase) requieren pasar ssl también en `extra` para el cliente pg
  extra: { ssl: { rejectUnauthorized: false } },
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

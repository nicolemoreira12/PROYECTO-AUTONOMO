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
  host: "localhost",
  port: 5432,
  username: "postgres",   
  password: "120994",     
  database: "postgres",  
  synchronize: true,      
  logging: true,
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

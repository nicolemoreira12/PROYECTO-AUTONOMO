"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const Usuario_1 = require("../entities/Usuario");
const Producto_1 = require("../entities/Producto");
const Emprendedor_1 = require("../entities/Emprendedor");
const Categoria_1 = require("../entities/Categoria");
const CarritoCompra_1 = require("../entities/CarritoCompra");
const DetalleCarrito_1 = require("../entities/DetalleCarrito");
const Orden_1 = require("../entities/Orden");
const DetalleOrden_1 = require("../entities/DetalleOrden");
const Pago_1 = require("../entities/Pago");
const TarjetaVirtual_1 = require("../entities/TarjetaVirtual");
const Transaccion_1 = require("../entities/Transaccion");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "120994",
    database: "postgres",
    synchronize: true,
    logging: true,
    entities: [
        Usuario_1.Usuario,
        Producto_1.Producto,
        Emprendedor_1.Emprendedor,
        Categoria_1.Categoria,
        CarritoCompra_1.CarritoCompra,
        DetalleCarrito_1.DetalleCarrito,
        Orden_1.Orden,
        DetalleOrden_1.DetalleOrden,
        Pago_1.Pago,
        TarjetaVirtual_1.TarjetaVirtual,
        Transaccion_1.Transaccion
    ],
    subscribers: [],
    migrations: [],
});

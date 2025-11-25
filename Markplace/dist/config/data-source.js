"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
// Cargar .env explícitamente
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
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
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASS || "password",
    database: process.env.DB_NAME || "postgres",
    synchronize: true,
    logging: true,
    // Configuración SSL para Supabase (requerido para conexiones remotas)
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
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

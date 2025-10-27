"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const data_source_1 = require("./config/data-source");
const error_middleware_1 = require("./middlewares/error.middleware");
const Auth_routes_1 = __importDefault(require("./routes/Auth.routes"));
const Producto_routes_1 = __importDefault(require("./routes/Producto.routes"));
const Categoria_routes_1 = __importDefault(require("./routes/Categoria.routes"));
const Usuario_routes_1 = __importDefault(require("./routes/Usuario.routes"));
const Emprendedor_routes_1 = __importDefault(require("./routes/Emprendedor.routes"));
const Orden_routes_1 = __importDefault(require("./routes/Orden.routes"));
const TarjetaVirtual_routes_1 = __importDefault(require("./routes/TarjetaVirtual.routes"));
const Transaccion_routes_1 = __importDefault(require("./routes/Transaccion.routes"));
const CarritoCompra_routes_1 = __importDefault(require("./routes/CarritoCompra.routes"));
const Dellatecarrito_routes_1 = __importDefault(require("./routes/Dellatecarrito.routes"));
const DetalleOrden_routes_1 = __importDefault(require("./routes/DetalleOrden.routes"));
const Pago_routes_1 = __importDefault(require("./routes/Pago.routes"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Ruta de prueba raíz
app.get("/", (_req, res) => {
    res.send("✅ Servidor funcionando y conectado a la base de datos");
});
// Rutas API
app.use("/api/auth", Auth_routes_1.default); // ← Autenticación (Login y Registro)
app.use("/api/categorias", Categoria_routes_1.default);
app.use("/api/usuarios", Usuario_routes_1.default);
app.use("/api/emprendedores", Emprendedor_routes_1.default);
app.use("/api/orden", Orden_routes_1.default);
app.use("/api/productos", Producto_routes_1.default);
app.use("/api/tarjetas", TarjetaVirtual_routes_1.default);
app.use("/api/transacciones", Transaccion_routes_1.default);
app.use("/api/carrito", CarritoCompra_routes_1.default);
app.use("/api/detallecarrito", Dellatecarrito_routes_1.default);
app.use("/api/detalleorden", DetalleOrden_routes_1.default);
app.use("/api/pagos", Pago_routes_1.default);
// Middleware de errores (debe ir al final)
app.use(error_middleware_1.errorHandler);
data_source_1.AppDataSource.initialize()
    .then(() => {
    console.log("📦 Conectado a la base de datos");
    app.listen(3000, () => {
        console.log("🚀 Servidor corriendo en http://localhost:3000");
    });
})
    .catch((error) => console.error("❌ Error de conexión:", error));

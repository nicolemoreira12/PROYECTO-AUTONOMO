"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eliminarProducto = exports.actualizarProducto = exports.obtenerProducto = exports.listarProductos = exports.crearProducto = void 0;
const Producto_service_1 = require("../services/Producto.service");
const productoService = new Producto_service_1.ProductoService();
// Crear producto
const crearProducto = async (req, res) => {
    try {
        const producto = await productoService.create(req.body);
        res.status(201).json(producto);
    }
    catch (error) {
        res.status(400).json({ message: "Error al crear producto", error });
    }
};
exports.crearProducto = crearProducto;
// Listar todos
const listarProductos = async (_req, res) => {
    try {
        const productos = await productoService.getAll();
        res.json(productos);
    }
    catch (error) {
        res.status(500).json({ message: "Error al obtener productos", error });
    }
};
exports.listarProductos = listarProductos;
// Obtener por ID
const obtenerProducto = async (req, res) => {
    try {
        const producto = await productoService.getById(parseInt(req.params.id));
        res.json(producto);
    }
    catch (error) {
        res.status(404).json({ message: error instanceof Error ? error.message : "Producto no encontrado" });
    }
};
exports.obtenerProducto = obtenerProducto;
// Actualizar
const actualizarProducto = async (req, res) => {
    try {
        const producto = await productoService.update(parseInt(req.params.id), req.body);
        res.json(producto);
    }
    catch (error) {
        res.status(400).json({ message: error instanceof Error ? error.message : "Error al actualizar producto" });
    }
};
exports.actualizarProducto = actualizarProducto;
// Eliminar
const eliminarProducto = async (req, res) => {
    try {
        await productoService.delete(parseInt(req.params.id));
        res.json({ message: "Producto eliminado correctamente" });
    }
    catch (error) {
        res.status(404).json({ message: error instanceof Error ? error.message : "Error al eliminar producto" });
    }
};
exports.eliminarProducto = eliminarProducto;

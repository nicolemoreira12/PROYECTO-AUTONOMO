"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategoria = exports.update = exports.create = exports.getById = exports.getAll = void 0;
const categoria_service_1 = require("../services/categoria.service");
const categoriaService = new categoria_service_1.CategoriaService();
const getAll = async (_req, res) => {
    try {
        const categorias = await categoriaService.getAll();
        res.json(categorias);
    }
    catch (error) {
        res.status(500).json({ message: "Error obteniendo categorías", error });
    }
};
exports.getAll = getAll;
const getById = async (req, res) => {
    try {
        const categoria = await categoriaService.getById(parseInt(req.params.id));
        res.json(categoria);
    }
    catch (error) {
        res.status(404).json({ message: error instanceof Error ? error.message : "Categoría no encontrada" });
    }
};
exports.getById = getById;
const create = async (req, res) => {
    try {
        const categoria = await categoriaService.create(req.body);
        res.status(201).json(categoria);
    }
    catch (error) {
        res.status(500).json({ message: "Error creando la categoría", error });
    }
};
exports.create = create;
const update = async (req, res) => {
    try {
        const categoria = await categoriaService.update(parseInt(req.params.id), req.body);
        res.json(categoria);
    }
    catch (error) {
        res.status(400).json({ message: error instanceof Error ? error.message : "Error actualizando categoría" });
    }
};
exports.update = update;
const deleteCategoria = async (req, res) => {
    try {
        await categoriaService.delete(parseInt(req.params.id));
        res.status(204).send();
    }
    catch (error) {
        res.status(404).json({ message: error instanceof Error ? error.message : "Error eliminando categoría" });
    }
};
exports.deleteCategoria = deleteCategoria;

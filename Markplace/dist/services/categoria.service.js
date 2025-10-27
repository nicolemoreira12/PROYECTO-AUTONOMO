"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriaService = void 0;
const data_source_1 = require("../config/data-source");
const Categoria_1 = require("../entities/Categoria");
const categoriaRepo = data_source_1.AppDataSource.getRepository(Categoria_1.Categoria);
class CategoriaService {
    async getAll() {
        return await categoriaRepo.find({ relations: ["productos"] });
    }
    async getById(id) {
        const categoria = await categoriaRepo.findOne({
            where: { idCategoria: id },
            relations: ["productos"]
        });
        if (!categoria) {
            throw new Error("Categoría no encontrada");
        }
        return categoria;
    }
    async create(data) {
        const nueva = categoriaRepo.create(data);
        return await categoriaRepo.save(nueva);
    }
    async update(id, data) {
        const categoria = await categoriaRepo.findOneBy({ idCategoria: id });
        if (!categoria) {
            throw new Error("Categoría no encontrada");
        }
        categoriaRepo.merge(categoria, data);
        return await categoriaRepo.save(categoria);
    }
    async delete(id) {
        const result = await categoriaRepo.delete(id);
        if (result.affected === 0) {
            throw new Error("Categoría no encontrada");
        }
        return result;
    }
}
exports.CategoriaService = CategoriaService;

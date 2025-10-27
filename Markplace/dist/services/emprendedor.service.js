"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmprendedorService = void 0;
const data_source_1 = require("../config/data-source");
const Emprendedor_1 = require("../entities/Emprendedor");
const emprendedorRepo = data_source_1.AppDataSource.getRepository(Emprendedor_1.Emprendedor);
class EmprendedorService {
    async getAll() {
        return await emprendedorRepo.find({ relations: ["productos"] });
    }
    async getById(id) {
        const emprendedor = await emprendedorRepo.findOne({
            where: { idEmprendedor: id },
            relations: ["productos"],
        });
        if (!emprendedor) {
            throw new Error("Emprendedor no encontrado");
        }
        return emprendedor;
    }
    async create(data) {
        const nuevo = emprendedorRepo.create(data);
        return await emprendedorRepo.save(nuevo);
    }
    async update(id, data) {
        const emprendedor = await emprendedorRepo.findOneBy({ idEmprendedor: id });
        if (!emprendedor) {
            throw new Error("Emprendedor no encontrado");
        }
        emprendedorRepo.merge(emprendedor, data);
        return await emprendedorRepo.save(emprendedor);
    }
    async delete(id) {
        const result = await emprendedorRepo.delete(id);
        if (result.affected === 0) {
            throw new Error("Emprendedor no encontrado");
        }
        return result;
    }
}
exports.EmprendedorService = EmprendedorService;

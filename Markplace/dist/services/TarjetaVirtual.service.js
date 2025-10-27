"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TarjetaVirtualService = void 0;
const data_source_1 = require("../config/data-source");
const TarjetaVirtual_1 = require("../entities/TarjetaVirtual");
const tarjetaRepo = data_source_1.AppDataSource.getRepository(TarjetaVirtual_1.TarjetaVirtual);
class TarjetaVirtualService {
    async getAll() {
        return await tarjetaRepo.find({ relations: ["usuario"] });
    }
    async getById(id) {
        const tarjeta = await tarjetaRepo.findOne({
            where: { idTarjeta: id },
            relations: ["usuario"]
        });
        if (!tarjeta) {
            throw new Error("Tarjeta no encontrada");
        }
        return tarjeta;
    }
    async create(data) {
        const nueva = tarjetaRepo.create(data);
        return await tarjetaRepo.save(nueva);
    }
    async update(id, data) {
        const tarjeta = await tarjetaRepo.findOneBy({ idTarjeta: id });
        if (!tarjeta) {
            throw new Error("Tarjeta no encontrada");
        }
        tarjetaRepo.merge(tarjeta, data);
        return await tarjetaRepo.save(tarjeta);
    }
    async delete(id) {
        const result = await tarjetaRepo.delete(id);
        if (result.affected === 0) {
            throw new Error("Tarjeta no encontrada");
        }
        return result;
    }
}
exports.TarjetaVirtualService = TarjetaVirtualService;

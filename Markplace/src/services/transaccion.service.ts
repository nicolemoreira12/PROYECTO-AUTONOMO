import { AppDataSource } from "../config/data-source";
import { Transaccion } from "../entities/Transaccion";
import { TarjetaVirtual } from "../entities/TarjetaVirtual";

const transaccionRepo = AppDataSource.getRepository(Transaccion);
const tarjetaRepo = AppDataSource.getRepository(TarjetaVirtual);

export class TransaccionService {
  async getAll() {
    return await transaccionRepo.find({ relations: ["tarjeta"] });
  }

  async getById(id: number) {
    return await transaccionRepo.findOne({ where: { idTransaccion: id }, relations: ["tarjeta"] });
  }

async create(data: Partial<Transaccion>) {
  // buscamos la tarjeta
  const tarjeta = await tarjetaRepo.findOne({ where: { idTarjeta: data.idTarjeta } });
  if (!tarjeta) throw new Error("Tarjeta no encontrada");

  // si es depósito -> aumenta saldo
  if (data.tipo === "DEPOSITO") {
    tarjeta.saldoDisponible += Number(data.monto);
  }

  // si es compra -> disminuye saldo
  if (data.tipo === "COMPRA") {
    if (tarjeta.saldoDisponible < Number(data.monto)) {
      throw new Error("Saldo insuficiente");
    }
    tarjeta.saldoDisponible -= Number(data.monto);
  }


  if ("fecha" in data) delete data.fecha;

  // guardamos transacción
  const nuevaTransaccion = transaccionRepo.create(data);
  await transaccionRepo.save(nuevaTransaccion);

  // actualizamos saldo de la tarjeta
  await tarjetaRepo.save(tarjeta);

  return nuevaTransaccion;
}

}

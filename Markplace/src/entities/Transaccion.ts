import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { TarjetaVirtual } from "./TarjetaVirtual";

@Entity("transaccion")
export class Transaccion {
  @PrimaryGeneratedColumn()
  idTransaccion!: number;

  @ManyToOne(() => TarjetaVirtual, (tarjeta) => tarjeta.transacciones)
  @JoinColumn({ name: "idTarjeta" })
  tarjeta!: TarjetaVirtual;

  @Column()
  idTarjeta!: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  monto!: number;

  @Column({ length: 50 })
  tipo!: string; //"DEPOSITO" | "COMPRA"

  @CreateDateColumn({type : "date"})
  fecha!: Date;
}

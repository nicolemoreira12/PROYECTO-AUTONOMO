import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Orden } from "./Orden";

@Entity()
export class Pago {
  @PrimaryGeneratedColumn()
  idPago!: number;

  @Column("decimal", { precision: 10, scale: 2 })
  monto!: number;

  @Column({ length: 50 })
  metodoPago!: string;

  @Column({ length: 50 })
  estadoPago!: string;

  @Column({ type: "date" })
  fechaPago!: Date;

  @Column({ length: 100 })
  hashTransaccion!: string;

  @ManyToOne(() => Orden, (orden) => orden.pagos)
  orden!: Orden;
}

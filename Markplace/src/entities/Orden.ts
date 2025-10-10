import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { Usuario } from "./Usuario";
import { DetalleOrden } from "./DetalleOrden";
import { Pago } from "./Pago";

@Entity()
export class Orden {
  @PrimaryGeneratedColumn()
  idOrden!: number;

  @Column({ type: "date" })
  fechaOrden!: Date;

  @Column({ length: 50 })
  estado!: string;

  @Column("decimal", { precision: 10, scale: 2 })
  total!: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.ordenes)
  usuario!: Usuario;

  @OneToMany(() => DetalleOrden, (detalle) => detalle.orden)
  detalles!: DetalleOrden[];

  @OneToMany(() => Pago, (pago) => pago.orden)
  pagos!: Pago[];
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Usuario } from "./Usuario";

@Entity()
export class TarjetaVirtual {
  @PrimaryGeneratedColumn()
  idTarjeta!: number;

  @Column({ length: 20 })
  numeroTarjeta!: string;

  @Column("decimal", { precision: 10, scale: 2 })
  saldoDisponible!: number;

  @Column({ type: "date" })
  fechaExpiracion!: Date;

  @Column({ length: 50 })
  estado!: string;

  @ManyToOne(() => Usuario, (usuario) => usuario.tarjetas)
  usuario!: Usuario;
}

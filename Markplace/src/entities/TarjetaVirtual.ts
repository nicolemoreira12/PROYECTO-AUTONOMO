import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Usuario } from "./Usuario";
import { Transaccion } from "./Transaccion";

@Entity("tarjetavirtual")
export class TarjetaVirtual {
  @PrimaryGeneratedColumn()
  idTarjeta!: number;

  @Column()
  idUsuario!: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.tarjetas)
  @JoinColumn({ name: "idUsuario" })
  usuario!: Usuario;

  @Column({ length: 20 })
  numeroTarjeta!: string;

  @Column("decimal", { precision: 10, scale: 2 })
  saldoDisponible!: number;

  @Column({ type: "date" })
  fechaExpiracion!: Date;

  @Column({ length: 50 })
  estado!: string;

  @OneToMany(() => Transaccion, (transaccion) => transaccion.tarjeta)
  transacciones!: Transaccion[];
}

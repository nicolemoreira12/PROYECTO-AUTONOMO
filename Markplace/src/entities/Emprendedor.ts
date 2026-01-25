import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn } from "typeorm";
import { Producto } from "./Producto";
import { Usuario } from "./Usuario";

@Entity()
export class Emprendedor {
  @PrimaryGeneratedColumn()
  idEmprendedor!: number;

  @Column({ length: 100 })
  nombreTienda!: string;

  @Column({ length: 250, default: '' })
  descripcionTienda!: string;

  @Column("float", { default: 5.0 })
  rating!: number;

  @Column({ nullable: true })
  usuarioId?: number;

  @OneToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: "usuarioId" })
  usuario?: Usuario;

  @OneToMany(() => Producto, (producto) => producto.emprendedor)
  productos!: Producto[];
}

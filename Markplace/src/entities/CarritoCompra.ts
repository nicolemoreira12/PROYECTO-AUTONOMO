import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { Usuario } from "./Usuario";
import { DetalleCarrito } from "./DetalleCarrito";

@Entity()
export class CarritoCompra {
  @PrimaryGeneratedColumn()
  idCarrito!: number;

  @Column({ type: "date" })
  fechaCreacion!: Date;

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  total!: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.carritos)
  usuario!: Usuario;

  @OneToMany(() => DetalleCarrito, (detalle: DetalleCarrito) => detalle.carrito)
  detalles!: DetalleCarrito[];
}

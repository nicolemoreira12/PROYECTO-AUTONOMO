import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { Usuario } from "./Usuario";
import { DetalleCarrito } from "./DetalleCarrito";

@Entity()
export class CarritoCompra {
  @PrimaryGeneratedColumn()
  idCarrito!: number;

  @Column({ type: "date" })
  fechaCreacion!: Date;

  @ManyToOne(() => Usuario, (usuario) => usuario.carritos)
  usuario!: Usuario;

  @OneToMany(() => DetalleCarrito, (detalle: DetalleCarrito) => detalle.carrito)
  detalles!: DetalleCarrito[];
}

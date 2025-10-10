import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Orden } from "./Orden";
import { CarritoCompra } from "./CarritoCompra";
import { TarjetaVirtual } from "./TarjetaVirtual";

@Entity()
export class Usuario {
  @PrimaryGeneratedColumn()
  idUsuario!: number;

  @Column({ length: 100 })
  nombre!: string;

  @Column({ length: 100 })
  apellido!: string;

  @Column({ length: 100, unique: true })
  email!: string;

  @Column({ length: 100 })
  contrasena!: string;

  @Column({ length: 200, nullable: true })
  direccion?: string;

  @Column({ length: 20, nullable: true })
  telefono?: string;

  @Column({ length: 50, nullable: true })
  rol?: string;

  @Column({ type: "date" })
  fechaRegistro!: Date;

  @OneToMany(() => Orden, (orden) => orden.usuario)
  ordenes!: Orden[];

  @OneToMany(() => CarritoCompra, (carrito) => carrito.usuario)
  carritos!: CarritoCompra[];

  @OneToMany(() => TarjetaVirtual, (tarjeta) => tarjeta.usuario)
  tarjetas!: TarjetaVirtual[];
}

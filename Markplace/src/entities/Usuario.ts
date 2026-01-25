import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Orden } from "./Orden";
import { CarritoCompra } from "./CarritoCompra";
import { TarjetaVirtual } from "./TarjetaVirtual";

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  nombre!: string;

  @Column({ length: 100 })
  apellido!: string;

  @Column({ length: 100, unique: true })
  email!: string;

  @Column({ length: 100, nullable: true })
  contrasena?: string;

  @Column({ length: 200, nullable: true })
  direccion?: string;

  @Column({ length: 20, nullable: true })
  telefono?: string;

  @Column({ length: 50, default: 'usuario' })
  rol!: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  fechaRegistro!: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updated_at!: Date;

  @Column({ default: true })
  activo!: boolean;

  @OneToMany(() => Orden, (orden) => orden.usuario)
  ordenes!: Orden[];

  @OneToMany(() => CarritoCompra, (carrito) => carrito.usuario)
  carritos!: CarritoCompra[];

  @OneToMany(() => TarjetaVirtual, (tarjeta) => tarjeta.usuario)
  tarjetas!: TarjetaVirtual[];
}

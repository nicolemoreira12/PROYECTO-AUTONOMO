import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Producto } from "./Producto";

@Entity()
export class Emprendedor {
  @PrimaryGeneratedColumn()
  idEmprendedor!: number;

  @Column({ length: 100 })
  nombreTienda!: string;

  @Column({ length: 250 })
  descripcionTienda!: string;

  @Column("float")
  rating!: number;

  @OneToMany(() => Producto, (producto) => producto.emprendedor)
  productos!: Producto[];
}

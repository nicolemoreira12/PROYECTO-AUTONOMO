import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Producto } from "./Producto";

@Entity()
export class Categoria {
  @PrimaryGeneratedColumn()
  idCategoria!: number;

  @Column({ length: 100 })
  nombreCategoria!: string;

  @Column({ length: 250 })
  descripcion!: string;

  @OneToMany(() => Producto, (producto) => producto.categoria)
  productos!: Producto[];
}

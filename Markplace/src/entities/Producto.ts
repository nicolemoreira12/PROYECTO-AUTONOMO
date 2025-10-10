import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Emprendedor } from "./Emprendedor";
import { Categoria } from "./Categoria";

@Entity()
export class Producto {
  @PrimaryGeneratedColumn()
  idProducto!: number;

  @Column({ length: 100 })
  nombreProducto!: string;

  @Column({ length: 250 })
  descripcion!: string;

  @Column("decimal", { precision: 10, scale: 2 })
  precio!: number;

  @Column("int")
  stock!: number;

  @Column({ length: 200 })
  imagenURL!: string;

  @ManyToOne(() => Emprendedor, (emprendedor) => emprendedor.productos, { eager: true })
  emprendedor!: Emprendedor;

  @ManyToOne(() => Categoria, (categoria) => categoria.productos, { eager: true })
  categoria!: Categoria;
}


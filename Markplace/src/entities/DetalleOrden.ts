import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Orden } from "./Orden";
import { Producto } from "./Producto";

@Entity()
export class DetalleOrden {
  @PrimaryGeneratedColumn()
  idDetalleOrden!: number;

  @Column("int")
  cantidad!: number;

  @Column("decimal", { precision: 10, scale: 2 })
  precioUnitario!: number;

  @Column("decimal", { precision: 10, scale: 2 })
  subtotal!: number;

  @ManyToOne(() => Orden, (orden) => orden.detalles)
  orden!: Orden;

  @ManyToOne(() => Producto, { eager: true })
  producto!: Producto;
}

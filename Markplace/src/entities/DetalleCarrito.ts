import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { CarritoCompra } from "./CarritoCompra";
import { Producto } from "./Producto";

@Entity()
export class DetalleCarrito {
  @PrimaryGeneratedColumn()
  idDetalleCarrito!: number;

  @Column("int")
  cantidad!: number;

  @Column("decimal", { precision: 10, scale: 2 })
  subtotal!: number;

  @ManyToOne(() => CarritoCompra, (carrito) => carrito.detalles)
  carrito!: CarritoCompra;

  @ManyToOne(() => Producto, { eager: true })
  producto!: Producto;
}

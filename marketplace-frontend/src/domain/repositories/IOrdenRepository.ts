import { Orden, CarritoCompra, ItemCarrito } from '../entities/Orden';

export interface IOrdenRepository {
    create(orden: CreateOrdenData): Promise<Orden>;
    getById(id: number): Promise<Orden | null>;
    getByUsuario(usuarioId: number): Promise<Orden[]>;
    updateEstado(id: number, estado: Orden['estado']): Promise<Orden>;
}

export interface ICarritoRepository {
    getByUsuario(usuarioId: number): Promise<CarritoCompra | null>;
    addItem(usuarioId: number, productoId: number, cantidad: number): Promise<CarritoCompra>;
    updateItem(itemId: number, cantidad: number): Promise<CarritoCompra>;
    removeItem(itemId: number): Promise<void>;
    clear(usuarioId: number): Promise<void>;
}

export interface CreateOrdenData {
    usuarioId: number;
    items: Array<{
        productoId: number;
        cantidad: number;
        precioUnitario: number;
    }>;
}

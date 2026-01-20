import { Producto } from '../entities/Producto';

export interface IProductoRepository {
    getAll(filters?: ProductoFilters): Promise<Producto[]>;
    getById(id: number): Promise<Producto | null>;
    create(producto: CreateProductoData): Promise<Producto>;
    update(id: number, producto: Partial<CreateProductoData>): Promise<Producto>;
    delete(id: number): Promise<void>;
    searchByName(query: string): Promise<Producto[]>;
}

export interface ProductoFilters {
    categoriaId?: number;
    emprendedorId?: number;
    minPrecio?: number;
    maxPrecio?: number;
    activo?: boolean;
}

export interface CreateProductoData {
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
    imagen?: string;
    categoriaId: number;
    emprendedorId: number;
}

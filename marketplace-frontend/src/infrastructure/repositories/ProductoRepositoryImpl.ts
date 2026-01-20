import { IProductoRepository, ProductoFilters, CreateProductoData } from '@domain/repositories/IProductoRepository';
import { Producto } from '@domain/entities/Producto';
import { httpClient, API_ENDPOINTS } from '../api';

// Helper para normalizar los datos del producto
const normalizeProducto = (data: any): Producto => {
    return {
        ...data,
        precio: typeof data.precio === 'string' ? parseFloat(data.precio) : data.precio,
        stock: typeof data.stock === 'string' ? parseInt(data.stock) : data.stock,
    };
};

const normalizeProductos = (data: any[]): Producto[] => {
    return data.map(normalizeProducto);
};

export class ProductoRepositoryImpl implements IProductoRepository {
    async getAll(filters?: ProductoFilters): Promise<Producto[]> {
        const response = await httpClient.get<Producto[]>(API_ENDPOINTS.PRODUCTOS);
        return normalizeProductos(response);
    }

    async getById(id: number): Promise<Producto | null> {
        try {
            const response = await httpClient.get<Producto>(API_ENDPOINTS.PRODUCTO_BY_ID(id));
            return normalizeProducto(response);
        } catch (error) {
            return null;
        }
    }

    async create(producto: CreateProductoData): Promise<Producto> {
        const response = await httpClient.post<Producto>(API_ENDPOINTS.PRODUCTOS, producto);
        return normalizeProducto(response);
    }

    async update(id: number, producto: Partial<CreateProductoData>): Promise<Producto> {
        const response = await httpClient.put<Producto>(API_ENDPOINTS.PRODUCTO_BY_ID(id), producto);
        return normalizeProducto(response);
    }

    async delete(id: number): Promise<void> {
        await httpClient.delete(API_ENDPOINTS.PRODUCTO_BY_ID(id));
    }

    async searchByName(query: string): Promise<Producto[]> {
        const response = await httpClient.get<Producto[]>(`${API_ENDPOINTS.SEARCH_PRODUCTOS}?q=${query}`);
        return normalizeProductos(response);
    }
}

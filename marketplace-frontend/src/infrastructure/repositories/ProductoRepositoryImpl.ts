import { IProductoRepository, ProductoFilters, CreateProductoData } from '@domain/repositories/IProductoRepository';
import { Producto } from '@domain/entities/Producto';
import { httpClient, API_ENDPOINTS } from '../api';
import { productosEjemplo, getProductoEjemploPorId, buscarProductosEjemplo } from '../data/productos-ejemplo';

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
        try {
            const response = await httpClient.get<Producto[]>(API_ENDPOINTS.PRODUCTOS);
            const productos = normalizeProductos(response);
            
            // Si el backend no tiene productos, usar los de ejemplo
            if (!productos || productos.length === 0) {
                console.log('📦 Usando productos de ejemplo (backend vacío)');
                return productosEjemplo;
            }
            
            return productos;
        } catch (error) {
            console.warn('⚠️ Error al obtener productos del backend, usando productos de ejemplo:', error);
            return productosEjemplo;
        }
    }

    async getById(id: number): Promise<Producto | null> {
        try {
            const response = await httpClient.get<Producto>(API_ENDPOINTS.PRODUCTO_BY_ID(id));
            return normalizeProducto(response);
        } catch (error) {
            console.warn(`⚠️ Error al obtener producto ${id} del backend, usando producto de ejemplo`);
            return getProductoEjemploPorId(id);
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
        try {
            const response = await httpClient.get<Producto[]>(`${API_ENDPOINTS.SEARCH_PRODUCTOS}?q=${query}`);
            const productos = normalizeProductos(response);
            
            // Si no hay resultados en el backend, buscar en productos de ejemplo
            if (!productos || productos.length === 0) {
                console.log('🔍 Buscando en productos de ejemplo');
                return buscarProductosEjemplo(query);
            }
            
            return productos;
        } catch (error) {
            console.warn('⚠️ Error en búsqueda del backend, usando productos de ejemplo');
            return buscarProductosEjemplo(query);
        }
    }
}

import { IProductoRepository, ProductoFilters } from '@domain/repositories/IProductoRepository';
import { Producto } from '@domain/entities/Producto';

export class GetProductosUseCase {
    constructor(private productoRepository: IProductoRepository) { }

    async execute(filters?: ProductoFilters): Promise<Producto[]> {
        return await this.productoRepository.getAll(filters);
    }
}

export class GetProductoByIdUseCase {
    constructor(private productoRepository: IProductoRepository) { }

    async execute(id: number): Promise<Producto | null> {
        if (!id || id <= 0) {
            throw new Error('ID de producto inválido');
        }
        return await this.productoRepository.getById(id);
    }
}

export class SearchProductosUseCase {
    constructor(private productoRepository: IProductoRepository) { }

    async execute(query: string): Promise<Producto[]> {
        if (!query || query.trim().length < 2) {
            throw new Error('La búsqueda debe tener al menos 2 caracteres');
        }
        return await this.productoRepository.searchByName(query);
    }
}

import { ICarritoRepository, IOrdenRepository, CreateOrdenData } from '@domain/repositories/IOrdenRepository';
import { CarritoCompra, Orden } from '@domain/entities/Orden';

export class AddToCarritoUseCase {
    constructor(private carritoRepository: ICarritoRepository) { }

    async execute(usuarioId: number, productoId: number, cantidad: number): Promise<CarritoCompra> {
        if (cantidad <= 0) {
            throw new Error('La cantidad debe ser mayor a 0');
        }
        return await this.carritoRepository.addItem(usuarioId, productoId, cantidad);
    }
}

export class GetCarritoUseCase {
    constructor(private carritoRepository: ICarritoRepository) { }

    async execute(usuarioId: number): Promise<CarritoCompra | null> {
        return await this.carritoRepository.getByUsuario(usuarioId);
    }
}

export class RemoveFromCarritoUseCase {
    constructor(private carritoRepository: ICarritoRepository) { }

    async execute(itemId: number): Promise<void> {
        await this.carritoRepository.removeItem(itemId);
    }
}

export class CreateOrdenUseCase {
    constructor(
        private ordenRepository: IOrdenRepository,
        private carritoRepository: ICarritoRepository
    ) { }

    async execute(data: CreateOrdenData): Promise<Orden> {
        if (!data.items || data.items.length === 0) {
            throw new Error('La orden debe tener al menos un producto');
        }

        const orden = await this.ordenRepository.create(data);

        // Limpiar el carrito después de crear la orden
        await this.carritoRepository.clear(data.usuarioId);

        return orden;
    }
}

export class GetOrdenesUsuarioUseCase {
    constructor(private ordenRepository: IOrdenRepository) { }

    async execute(usuarioId: number): Promise<Orden[]> {
        return await this.ordenRepository.getByUsuario(usuarioId);
    }
}

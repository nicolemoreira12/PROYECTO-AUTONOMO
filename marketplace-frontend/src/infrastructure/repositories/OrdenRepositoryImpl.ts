import {
    IOrdenRepository,
    ICarritoRepository,
    CreateOrdenData
} from '@domain/repositories/IOrdenRepository';
import { Orden, CarritoCompra } from '@domain/entities/Orden';
import { httpClient, API_ENDPOINTS } from '../api';

export class OrdenRepositoryImpl implements IOrdenRepository {
    async create(orden: CreateOrdenData): Promise<Orden> {
        const response = await httpClient.post(API_ENDPOINTS.ORDENES, orden);
        return response.data;
    }

    async getById(id: number): Promise<Orden | null> {
        try {
            const response = await httpClient.get(API_ENDPOINTS.ORDEN_BY_ID(id));
            return response.data;
        } catch (error) {
            return null;
        }
    }

    async getByUsuario(usuarioId: number): Promise<Orden[]> {
        const response = await httpClient.get(API_ENDPOINTS.ORDENES_USUARIO);
        return response.data;
    }

    async updateEstado(id: number, estado: Orden['estado']): Promise<Orden> {
        const response = await httpClient.patch(API_ENDPOINTS.ORDEN_BY_ID(id), { estado });
        return response.data;
    }
}

export class CarritoRepositoryImpl implements ICarritoRepository {
    async getByUsuario(usuarioId: number): Promise<CarritoCompra | null> {
        try {
            const response = await httpClient.get(API_ENDPOINTS.CARRITO);
            return response.data;
        } catch (error) {
            return null;
        }
    }

    async addItem(usuarioId: number, productoId: number, cantidad: number): Promise<CarritoCompra> {
        const response = await httpClient.post(API_ENDPOINTS.CARRITO_ADD, {
            productoId,
            cantidad
        });
        return response.data;
    }

    async updateItem(itemId: number, cantidad: number): Promise<CarritoCompra> {
        const response = await httpClient.put(API_ENDPOINTS.CARRITO_UPDATE(itemId), {
            cantidad
        });
        return response.data;
    }

    async removeItem(itemId: number): Promise<void> {
        await httpClient.delete(API_ENDPOINTS.CARRITO_REMOVE(itemId));
    }

    async clear(usuarioId: number): Promise<void> {
        await httpClient.delete(API_ENDPOINTS.CARRITO);
    }
}

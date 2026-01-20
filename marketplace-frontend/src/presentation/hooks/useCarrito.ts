import { useState, useEffect } from 'react';
import {
    GetCarritoUseCase,
    AddToCarritoUseCase,
    RemoveFromCarritoUseCase
} from '@application/use-cases';
import { CarritoRepositoryImpl } from '@infrastructure/repositories';
import { useCarritoStore } from '../store';
import { useAuthStore } from '../store';

const carritoRepository = new CarritoRepositoryImpl();
const getCarritoUseCase = new GetCarritoUseCase(carritoRepository);
const addToCarritoUseCase = new AddToCarritoUseCase(carritoRepository);
const removeFromCarritoUseCase = new RemoveFromCarritoUseCase(carritoRepository);

export const useCarrito = () => {
    const { carrito, setCarrito, loading, setLoading, getTotalItems, getTotalPrice } = useCarritoStore();
    const { user } = useAuthStore();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            loadCarrito();
        }
    }, [user]);

    const loadCarrito = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const data = await getCarritoUseCase.execute(user.id);
            setCarrito(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar el carrito');
        } finally {
            setLoading(false);
        }
    };

    const addToCarrito = async (productoId: number, cantidad: number = 1) => {
        if (!user) {
            setError('Debes iniciar sesión para agregar productos al carrito');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await addToCarritoUseCase.execute(user.id, productoId, cantidad);
            setCarrito(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al agregar al carrito');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const removeFromCarrito = async (itemId: number) => {
        try {
            setLoading(true);
            setError(null);
            await removeFromCarritoUseCase.execute(itemId);
            await loadCarrito();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al eliminar del carrito');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        carrito,
        loading,
        error,
        totalItems: getTotalItems(),
        totalPrice: getTotalPrice(),
        loadCarrito,
        addToCarrito,
        removeFromCarrito,
    };
};

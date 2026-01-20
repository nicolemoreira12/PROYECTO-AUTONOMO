import { useState } from 'react';
import { useCarritoStore } from '../store';
import { Producto } from '@domain/entities/Producto';

export const useCarrito = () => {
    const { 
        carrito, 
        loading, 
        setLoading,
        getTotalItems, 
        getTotalPrice,
        addProducto,
        removeItem,
        updateCantidad,
        clearCarrito
    } = useCarritoStore();
    
    const [error, setError] = useState<string | null>(null);

    const addToCarrito = async (productoId: number, cantidad: number = 1, producto?: Producto) => {
        try {
            setLoading(true);
            setError(null);
            
            if (!producto) {
                throw new Error('Producto no encontrado');
            }

            if (producto.stock < cantidad) {
                throw new Error('Stock insuficiente');
            }

            addProducto(producto, cantidad);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al agregar al carrito';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const removeFromCarrito = async (productoId: number) => {
        try {
            setLoading(true);
            setError(null);
            removeItem(productoId);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al eliminar del carrito');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateItemCantidad = async (productoId: number, cantidad: number) => {
        try {
            setLoading(true);
            setError(null);
            updateCantidad(productoId, cantidad);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al actualizar cantidad');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const clearCart = async () => {
        try {
            setLoading(true);
            setError(null);
            clearCarrito();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al vaciar carrito');
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
        addToCarrito,
        removeFromCarrito,
        updateItemCantidad,
        clearCart,
    };
};

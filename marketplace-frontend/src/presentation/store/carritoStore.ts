import { create } from 'zustand';
import { CarritoCompra } from '@domain/entities/Orden';

interface CarritoState {
    carrito: CarritoCompra | null;
    loading: boolean;
    setCarrito: (carrito: CarritoCompra | null) => void;
    setLoading: (loading: boolean) => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
}

export const useCarritoStore = create<CarritoState>((set, get) => ({
    carrito: null,
    loading: false,

    setCarrito: (carrito) => set({ carrito }),
    setLoading: (loading) => set({ loading }),

    getTotalItems: () => {
        const { carrito } = get();
        if (!carrito) return 0;
        return carrito.items.reduce((total, item) => total + item.cantidad, 0);
    },

    getTotalPrice: () => {
        const { carrito } = get();
        if (!carrito) return 0;
        return carrito.items.reduce((total, item) => {
            const precio = item.producto?.precio || 0;
            return total + (precio * item.cantidad);
        }, 0);
    },
}));

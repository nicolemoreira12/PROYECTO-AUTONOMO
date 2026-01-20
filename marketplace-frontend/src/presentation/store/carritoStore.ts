import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CarritoCompra, CarritoItem } from '@domain/entities/Orden';
import { Producto } from '@domain/entities/Producto';

interface CarritoState {
    carrito: CarritoCompra | null;
    loading: boolean;
    setCarrito: (carrito: CarritoCompra | null) => void;
    setLoading: (loading: boolean) => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
    addProducto: (producto: Producto, cantidad: number) => void;
    removeItem: (productoId: number) => void;
    updateCantidad: (productoId: number, cantidad: number) => void;
    clearCarrito: () => void;
}

export const useCarritoStore = create<CarritoState>()(
    persist(
        (set, get) => ({
            carrito: null,
            loading: false,

            setCarrito: (carrito) => set({ carrito }),
            setLoading: (loading) => set({ loading }),

            addProducto: (producto: Producto, cantidad: number) => {
                const { carrito } = get();
                const items = carrito?.items || [];
                
                // Verificar si el producto ya está en el carrito
                const existingItemIndex = items.findIndex(item => item.producto.id === producto.id);
                
                let newItems: CarritoItem[];
                if (existingItemIndex >= 0) {
                    // Actualizar cantidad
                    newItems = items.map((item, index) => 
                        index === existingItemIndex 
                            ? { ...item, cantidad: item.cantidad + cantidad }
                            : item
                    );
                } else {
                    // Agregar nuevo item
                    const newItem: CarritoItem = {
                        id: Date.now(),
                        producto,
                        cantidad,
                        precio: producto.precio
                    };
                    newItems = [...items, newItem];
                }

                set({
                    carrito: {
                        id: carrito?.id || Date.now(),
                        items: newItems,
                        total: newItems.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)
                    }
                });
            },

            removeItem: (productoId: number) => {
                const { carrito } = get();
                if (!carrito) return;

                const newItems = carrito.items.filter(item => item.producto.id !== productoId);
                
                set({
                    carrito: {
                        ...carrito,
                        items: newItems,
                        total: newItems.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)
                    }
                });
            },

            updateCantidad: (productoId: number, cantidad: number) => {
                const { carrito } = get();
                if (!carrito) return;

                if (cantidad <= 0) {
                    get().removeItem(productoId);
                    return;
                }

                const newItems = carrito.items.map(item =>
                    item.producto.id === productoId
                        ? { ...item, cantidad }
                        : item
                );

                set({
                    carrito: {
                        ...carrito,
                        items: newItems,
                        total: newItems.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)
                    }
                });
            },

            clearCarrito: () => {
                set({ carrito: null });
            },

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
        }),
        {
            name: 'carrito-storage',
        }
    )
);

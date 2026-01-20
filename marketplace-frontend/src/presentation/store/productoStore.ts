import { create } from 'zustand';
import { Producto } from '@domain/entities/Producto';

interface ProductoState {
    productos: Producto[];
    selectedProducto: Producto | null;
    loading: boolean;
    error: string | null;
    setProductos: (productos: Producto[]) => void;
    setSelectedProducto: (producto: Producto | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useProductoStore = create<ProductoState>((set) => ({
    productos: [],
    selectedProducto: null,
    loading: false,
    error: null,

    setProductos: (productos) => set({ productos }),
    setSelectedProducto: (producto) => set({ selectedProducto: producto }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
}));

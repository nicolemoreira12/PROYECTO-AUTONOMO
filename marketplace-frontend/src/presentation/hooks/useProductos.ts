import { useState, useEffect } from 'react';
import { GetProductosUseCase, SearchProductosUseCase } from '@application/use-cases';
import { ProductoRepositoryImpl } from '@infrastructure/repositories';
import { Producto } from '@domain/entities/Producto';
import { ProductoFilters } from '@domain/repositories/IProductoRepository';
import { useProductoStore } from '../store';

const productoRepository = new ProductoRepositoryImpl();
const getProductosUseCase = new GetProductosUseCase(productoRepository);
const searchProductosUseCase = new SearchProductosUseCase(productoRepository);

export const useProductos = (filters?: ProductoFilters) => {
    const { productos, setProductos, loading, setLoading, error, setError } = useProductoStore();
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        // Solo cargar una vez al montar
        if (!initialized) {
            setInitialized(true);
            loadProductos();
        }
    }, []);

    const loadProductos = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getProductosUseCase.execute(filters);
            setProductos(data);
        } catch (err) {
            console.error('Error al cargar productos:', err);
            const errorMessage = err instanceof Error ? err.message : 'Error al cargar productos';
            setError(errorMessage);
            setProductos([]); // Limpiar productos en caso de error
        } finally {
            setLoading(false);
        }
    };

    const searchProductos = async (query: string) => {
        try {
            setLoading(true);
            setError(null);
            const data = await searchProductosUseCase.execute(query);
            setProductos(data);
        } catch (err) {
            console.error('Error en la búsqueda:', err);
            const errorMessage = err instanceof Error ? err.message : 'Error en la búsqueda';
            setError(errorMessage);
            setProductos([]); // Limpiar productos en caso de error
        } finally {
            setLoading(false);
        }
    };

    return {
        productos,
        loading,
        error,
        loadProductos,
        searchProductos,
    };
};

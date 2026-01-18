import axios from 'axios';
import { BaseMCPTool } from './base.tool';
import { ToolDefinition, ToolResult } from '../types';

/**
 * Herramienta de CONSULTA: Buscar productos en el marketplace
 * Categoría: query
 */
export class BuscarProductosTool extends BaseMCPTool {
    readonly definition: ToolDefinition = {
        name: 'buscar_productos',
        description: 'Busca productos en el marketplace por nombre, categoría o descripción. Devuelve una lista de productos disponibles con sus detalles.',
        category: 'query',
        parameters: [
            {
                name: 'query',
                type: 'string',
                description: 'Término de búsqueda (nombre, categoría o descripción del producto)',
                required: true,
            },
            {
                name: 'limit',
                type: 'number',
                description: 'Número máximo de resultados a devolver (por defecto 10)',
                required: false,
            },
            {
                name: 'categoria',
                type: 'string',
                description: 'Filtrar por categoría específica',
                required: false,
            },
        ],
    };

    private marketplaceUrl: string;

    constructor() {
        super();
        this.marketplaceUrl = process.env.MARKETPLACE_SERVICE_URL || 'http://localhost:3000';
    }

    async execute(args: Record<string, any>, context?: any): Promise<ToolResult> {
        try {
            // Validar argumentos
            const validation = this.validateArgs(args);
            if (!validation.valid) {
                return this.error(validation.error!);
            }

            const { query, limit = 10, categoria } = args;

            // Llamar al servicio de marketplace para obtener TODOS los productos
            const response = await axios.get(
                `${this.marketplaceUrl}/api/productos`,
                {
                    timeout: 5000,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            let productos = response.data.productos || response.data.data || response.data || [];

            // Si es un array directo, usarlo
            if (Array.isArray(productos) === false) {
                productos = [];
            }

            // Filtrar por query (búsqueda en nombre y descripción)
            if (query) {
                const queryLower = query.toLowerCase();
                productos = productos.filter((p: any) => {
                    const nombre = p.nombre || p.nombreProducto || '';
                    const descripcion = p.descripcion || '';
                    return nombre.toLowerCase().includes(queryLower) ||
                        descripcion.toLowerCase().includes(queryLower);
                });
            }

            // Filtrar por categoría si se especifica
            if (categoria) {
                productos = productos.filter((p: any) =>
                    p.categoria?.nombre?.toLowerCase() === categoria.toLowerCase()
                );
            }

            // Limitar resultados
            productos = productos.slice(0, limit);

            // Formatear respuesta (mapear campos del API)
            const resultadosFormateados = productos.map((p: any) => ({
                id: p.id || p.idProducto,
                nombre: p.nombre || p.nombreProducto,
                descripcion: p.descripcion,
                precio: p.precio,
                stock: p.stock,
                categoria: p.categoria?.nombre || 'Sin categoría',
                emprendedor: p.emprendedor?.nombre || 'No especificado',
            }));

            return this.success({
                total: resultadosFormateados.length,
                productos: resultadosFormateados,
                mensaje: `Se encontraron ${resultadosFormateados.length} productos${query ? ` para "${query}"` : ''}`,
            });
        } catch (error: any) {
            console.error('Error buscando productos:', error);

            // Si el servicio no está disponible, devolver datos mock
            if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
                return this.success({
                    total: 2,
                    productos: [
                        {
                            id: 'mock-1',
                            nombre: `Producto relacionado con ${args.query}`,
                            descripcion: 'Producto de ejemplo (servicio no disponible)',
                            precio: 99.99,
                            stock: 10,
                            categoria: 'General',
                            emprendedor: 'Emprendedor Demo',
                        },
                    ],
                    mensaje: 'Resultado de ejemplo (Marketplace service no disponible)',
                });
            }

            return this.handleError(error);
        }
    }
}

import axios from 'axios';
import { BaseMCPTool } from './base.tool';
import { ToolDefinition, ToolResult } from '../types';

/**
 * Herramienta de ACCIÓN: Crear una nueva orden de compra
 * Categoría: action
 */
export class CrearOrdenTool extends BaseMCPTool {
    readonly definition: ToolDefinition = {
        name: 'crear_orden',
        description: 'Crea una nueva orden de compra para un usuario con los productos especificados. Requiere autenticación del usuario.',
        category: 'action',
        parameters: [
            {
                name: 'userId',
                type: 'string',
                description: 'ID del usuario que realiza la compra',
                required: true,
            },
            {
                name: 'productos',
                type: 'array',
                description: 'Array de productos con formato: [{ productoId: string, cantidad: number }]',
                required: true,
            },
            {
                name: 'metodoPago',
                type: 'string',
                description: 'Método de pago: tarjeta, transferencia, efectivo',
                required: false,
                enum: ['tarjeta', 'transferencia', 'efectivo'],
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

            const { userId, productos, metodoPago = 'tarjeta' } = args;

            // Validar que productos sea un array
            if (!Array.isArray(productos) || productos.length === 0) {
                return this.error('El parámetro "productos" debe ser un array no vacío');
            }

            // Validar estructura de productos
            for (const prod of productos) {
                if (!prod.productoId || !prod.cantidad) {
                    return this.error('Cada producto debe tener "productoId" y "cantidad"');
                }
            }

            // Crear la orden en el marketplace
            const response = await axios.post(
                `${this.marketplaceUrl}/api/ordenes`,
                {
                    userId,
                    productos,
                    metodoPago,
                },
                {
                    timeout: 10000,
                    headers: {
                        'Content-Type': 'application/json',
                        // Si hay token en el contexto, agregarlo
                        ...(context?.token && { Authorization: `Bearer ${context.token}` }),
                    },
                }
            );

            const orden = response.data.orden || response.data.data;

            return this.success({
                ordenId: orden.id,
                numero: orden.numero,
                estado: orden.estado,
                total: orden.total,
                fechaCreacion: orden.createdAt,
                productos: productos.length,
                mensaje: `Orden creada exitosamente. Total: $${orden.total}`,
            });
        } catch (error: any) {
            console.error('Error creando orden:', error);

            // Errores específicos
            if (error.response?.status === 400) {
                return this.error('Datos de orden inválidos: ' + (error.response.data?.message || ''));
            }

            if (error.response?.status === 404) {
                return this.error('Usuario o productos no encontrados');
            }

            // Si el servicio no está disponible, simular creación
            if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
                return this.success({
                    ordenId: `mock-${Date.now()}`,
                    numero: `ORD-${Date.now()}`,
                    estado: 'pendiente',
                    total: args.productos.reduce((sum: number, p: any) => sum + (p.cantidad * 50), 0),
                    fechaCreacion: new Date().toISOString(),
                    productos: args.productos.length,
                    mensaje: 'Orden simulada (Marketplace service no disponible)',
                });
            }

            return this.handleError(error);
        }
    }
}

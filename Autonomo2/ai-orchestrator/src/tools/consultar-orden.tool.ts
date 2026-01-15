import axios from 'axios';
import { BaseMCPTool } from './base.tool';
import { ToolDefinition, ToolResult } from '../types';

/**
 * Herramienta de CONSULTA: Consultar estado de una orden
 * Categoría: query
 */
export class ConsultarOrdenTool extends BaseMCPTool {
    readonly definition: ToolDefinition = {
        name: 'consultar_orden',
        description: 'Consulta el estado y detalles de una orden de compra específica. Devuelve información sobre productos, estado del pago, y fecha de creación.',
        category: 'query',
        parameters: [
            {
                name: 'orderId',
                type: 'string',
                description: 'ID único de la orden a consultar',
                required: true,
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

            const { orderId } = args;

            // Llamar al servicio de marketplace
            const response = await axios.get(
                `${this.marketplaceUrl}/api/ordenes/${orderId}`,
                {
                    timeout: 5000,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            const orden = response.data.orden || response.data.data;

            // Formatear respuesta
            const ordenFormateada = {
                id: orden.id,
                numero: orden.numero,
                estado: orden.estado,
                total: orden.total,
                fechaCreacion: orden.createdAt || orden.fecha,
                usuario: {
                    id: orden.usuario?.id,
                    nombre: `${orden.usuario?.firstName || ''} ${orden.usuario?.lastName || ''}`.trim(),
                    email: orden.usuario?.email,
                },
                productos: orden.detalles?.map((d: any) => ({
                    productoId: d.producto?.id,
                    nombre: d.producto?.nombre,
                    cantidad: d.cantidad,
                    precioUnitario: d.precioUnitario,
                    subtotal: d.subtotal,
                })) || [],
                pago: {
                    estado: orden.pago?.estado || 'pendiente',
                    metodo: orden.pago?.metodo,
                    transaccionId: orden.pago?.transaccionId,
                },
            };

            return this.success({
                orden: ordenFormateada,
                mensaje: `Orden ${orderId} encontrada exitosamente`,
            });
        } catch (error: any) {
            console.error('Error consultando orden:', error);

            // Si la orden no existe
            if (error.response?.status === 404) {
                return this.error(`No se encontró la orden con ID: ${args.orderId}`);
            }

            // Si el servicio no está disponible
            if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
                return this.success({
                    orden: {
                        id: args.orderId,
                        numero: 'ORD-MOCK-001',
                        estado: 'pendiente',
                        total: 149.99,
                        fechaCreacion: new Date().toISOString(),
                        productos: [
                            {
                                nombre: 'Producto Demo',
                                cantidad: 1,
                                precioUnitario: 149.99,
                                subtotal: 149.99,
                            },
                        ],
                        pago: {
                            estado: 'pendiente',
                        },
                    },
                    mensaje: 'Datos de ejemplo (Marketplace service no disponible)',
                });
            }

            return this.handleError(error);
        }
    }
}

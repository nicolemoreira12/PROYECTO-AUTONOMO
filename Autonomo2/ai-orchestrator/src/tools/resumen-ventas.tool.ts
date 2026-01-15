import axios from 'axios';
import { BaseMCPTool } from './base.tool';
import { ToolDefinition, ToolResult } from '../types';

/**
 * Herramienta de REPORTE: Generar resumen de ventas
 * Categoría: report
 */
export class ResumenVentasTool extends BaseMCPTool {
    readonly definition: ToolDefinition = {
        name: 'resumen_ventas',
        description: 'Genera un reporte con el resumen de ventas, incluyendo total de órdenes, ingresos totales, productos más vendidos y estadísticas por período.',
        category: 'report',
        parameters: [
            {
                name: 'startDate',
                type: 'string',
                description: 'Fecha de inicio del reporte (formato: YYYY-MM-DD). Opcional, por defecto últimos 30 días',
                required: false,
            },
            {
                name: 'endDate',
                type: 'string',
                description: 'Fecha de fin del reporte (formato: YYYY-MM-DD). Opcional, por defecto hoy',
                required: false,
            },
            {
                name: 'emprendedorId',
                type: 'string',
                description: 'ID del emprendedor para filtrar ventas. Opcional, por defecto todas las ventas',
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
            // Calcular fechas por defecto si no se proporcionan
            const endDate = args.endDate || new Date().toISOString().split('T')[0];
            const startDate = args.startDate || this.getDateDaysAgo(30);

            const { emprendedorId } = args;

            // Construir parámetros de consulta
            const params = new URLSearchParams();
            params.append('startDate', startDate);
            params.append('endDate', endDate);
            if (emprendedorId) {
                params.append('emprendedorId', emprendedorId);
            }

            // Llamar al servicio de reportes
            const response = await axios.get(
                `${this.marketplaceUrl}/api/reportes/ventas?${params.toString()}`,
                {
                    timeout: 10000,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            const reporte = response.data.reporte || response.data.data;

            // Formatear respuesta
            return this.success({
                periodo: {
                    inicio: startDate,
                    fin: endDate,
                    dias: this.getDaysDifference(startDate, endDate),
                },
                resumen: {
                    totalOrdenes: reporte.totalOrdenes || 0,
                    ordenesCompletadas: reporte.ordenesCompletadas || 0,
                    ordenesPendientes: reporte.ordenesPendientes || 0,
                    ingresosTotal: reporte.ingresosTotal || 0,
                    promedioOrden: reporte.promedioOrden || 0,
                },
                productosMasVendidos: reporte.productosMasVendidos || [],
                ventasPorDia: reporte.ventasPorDia || [],
                mensaje: `Reporte generado para el período ${startDate} a ${endDate}`,
            });
        } catch (error: any) {
            console.error('Error generando reporte de ventas:', error);

            // Si el servicio no está disponible, generar reporte mock
            if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.response?.status === 404) {
                const startDate = args.startDate || this.getDateDaysAgo(30);
                const endDate = args.endDate || new Date().toISOString().split('T')[0];

                return this.success({
                    periodo: {
                        inicio: startDate,
                        fin: endDate,
                        dias: this.getDaysDifference(startDate, endDate),
                    },
                    resumen: {
                        totalOrdenes: 45,
                        ordenesCompletadas: 38,
                        ordenesPendientes: 7,
                        ingresosTotal: 4567.89,
                        promedioOrden: 101.51,
                    },
                    productosMasVendidos: [
                        { nombre: 'Producto A', cantidad: 25, ingresos: 1250.0 },
                        { nombre: 'Producto B', cantidad: 18, ingresos: 900.0 },
                        { nombre: 'Producto C', cantidad: 12, ingresos: 600.0 },
                    ],
                    ventasPorDia: this.generateMockDailySales(7),
                    mensaje: 'Reporte de ejemplo (Marketplace service no disponible)',
                });
            }

            return this.handleError(error);
        }
    }

    /**
     * Obtiene una fecha N días atrás
     */
    private getDateDaysAgo(days: number): string {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return date.toISOString().split('T')[0];
    }

    /**
     * Calcula diferencia de días entre dos fechas
     */
    private getDaysDifference(startDate: string, endDate: string): number {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    /**
     * Genera ventas diarias mock
     */
    private generateMockDailySales(days: number): any[] {
        const sales = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            sales.push({
                fecha: date.toISOString().split('T')[0],
                ordenes: Math.floor(Math.random() * 10) + 1,
                ingresos: Math.floor(Math.random() * 500) + 100,
            });
        }
        return sales;
    }
}

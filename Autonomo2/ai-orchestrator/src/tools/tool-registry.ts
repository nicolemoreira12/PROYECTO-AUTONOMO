import { IMCPTool, ToolDefinition, ToolResult } from '../types';
import { BuscarProductosTool } from './buscar-productos.tool';
import { ConsultarOrdenTool } from './consultar-orden.tool';
import { CrearOrdenTool } from './crear-orden.tool';
import { ProcesarPagoTool } from './procesar-pago.tool';
import { ResumenVentasTool } from './resumen-ventas.tool';

/**
 * Registro centralizado de todas las herramientas MCP disponibles
 * Patrón Registry para gestionar herramientas dinámicamente
 */
export class ToolRegistry {
    private static tools: Map<string, IMCPTool> = new Map();
    private static initialized = false;

    /**
     * Inicializa el registro con todas las herramientas disponibles
     */
    static initialize(): void {
        if (this.initialized) {
            console.log('⚠️  ToolRegistry ya inicializado');
            return;
        }

        // Registrar herramientas de consulta
        this.registerTool(new BuscarProductosTool());
        this.registerTool(new ConsultarOrdenTool());

        // Registrar herramientas de acción
        this.registerTool(new CrearOrdenTool());
        this.registerTool(new ProcesarPagoTool());

        // Registrar herramientas de reporte
        this.registerTool(new ResumenVentasTool());

        this.initialized = true;
        console.log(`✅ ToolRegistry inicializado con ${this.tools.size} herramientas`);
    }

    /**
     * Registra una nueva herramienta en el registry
     */
    static registerTool(tool: IMCPTool): void {
        if (this.tools.has(tool.definition.name)) {
            console.warn(`⚠️  Herramienta '${tool.definition.name}' ya registrada, sobrescribiendo...`);
        }
        this.tools.set(tool.definition.name, tool);
        console.log(`📝 Herramienta registrada: ${tool.definition.name} (${tool.definition.category})`);
    }

    /**
     * Obtiene una herramienta por su nombre
     */
    static getTool(toolName: string): IMCPTool | undefined {
        return this.tools.get(toolName);
    }

    /**
     * Ejecuta una herramienta por su nombre
     */
    static async executeTool(
        toolName: string,
        args: Record<string, any>,
        context?: any
    ): Promise<ToolResult> {
        const tool = this.getTool(toolName);

        if (!tool) {
            return {
                success: false,
                error: `Herramienta '${toolName}' no encontrada`,
            };
        }

        console.log(`🔧 Ejecutando herramienta: ${toolName}`, args);

        try {
            const result = await tool.execute(args, context);
            console.log(`✅ Herramienta ${toolName} ejecutada:`, result.success ? 'éxito' : 'error');
            return result;
        } catch (error) {
            console.error(`❌ Error ejecutando herramienta ${toolName}:`, error);
            return {
                success: false,
                error: `Error al ejecutar ${toolName}: ${error}`,
            };
        }
    }

    /**
     * Lista todas las herramientas disponibles
     */
    static listTools(): ToolDefinition[] {
        return Array.from(this.tools.values()).map((tool) => tool.definition);
    }

    /**
     * Lista herramientas por categoría
     */
    static listToolsByCategory(category: 'query' | 'action' | 'report'): ToolDefinition[] {
        return this.listTools().filter((tool) => tool.category === category);
    }

    /**
     * Obtiene las definiciones de herramientas en formato para LLM
     */
    static getToolDefinitionsForLLM(): ToolDefinition[] {
        return this.listTools();
    }

    /**
     * Verifica si una herramienta existe
     */
    static hasTool(toolName: string): boolean {
        return this.tools.has(toolName);
    }

    /**
     * Obtiene estadísticas del registry
     */
    static getStats(): {
        total: number;
        query: number;
        action: number;
        report: number;
    } {
        const tools = this.listTools();
        return {
            total: tools.length,
            query: tools.filter((t) => t.category === 'query').length,
            action: tools.filter((t) => t.category === 'action').length,
            report: tools.filter((t) => t.category === 'report').length,
        };
    }

    /**
     * Limpia el registry (útil para testing)
     */
    static clear(): void {
        this.tools.clear();
        this.initialized = false;
        console.log('🧹 ToolRegistry limpiado');
    }
}

// Inicializar automáticamente al importar el módulo
ToolRegistry.initialize();

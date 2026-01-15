import { IMCPTool, ToolDefinition, ToolResult } from '../types';

/**
 * Clase base abstracta para todas las herramientas MCP
 * Implementa la interfaz IMCPTool y proporciona funcionalidad común
 */
export abstract class BaseMCPTool implements IMCPTool {
    abstract readonly definition: ToolDefinition;

    /**
     * Método abstracto que cada herramienta debe implementar
     */
    abstract execute(args: Record<string, any>, context?: any): Promise<ToolResult>;

    /**
     * Valida que los argumentos requeridos estén presentes
     */
    protected validateArgs(args: Record<string, any>): { valid: boolean; error?: string } {
        const requiredParams = this.definition.parameters.filter(p => p.required);

        for (const param of requiredParams) {
            if (args[param.name] === undefined || args[param.name] === null) {
                return {
                    valid: false,
                    error: `Parámetro requerido faltante: ${param.name}`,
                };
            }

            // Validar tipo
            const actualType = typeof args[param.name];
            if (!this.isValidType(actualType, param.type, args[param.name])) {
                return {
                    valid: false,
                    error: `Tipo incorrecto para ${param.name}: esperado ${param.type}, recibido ${actualType}`,
                };
            }
        }

        return { valid: true };
    }

    /**
     * Valida tipos de datos
     */
    private isValidType(actualType: string, expectedType: string, value: any): boolean {
        switch (expectedType) {
            case 'string':
                return actualType === 'string';
            case 'number':
                return actualType === 'number';
            case 'boolean':
                return actualType === 'boolean';
            case 'array':
                return Array.isArray(value);
            case 'object':
                return actualType === 'object' && !Array.isArray(value);
            default:
                return true;
        }
    }

    /**
     * Manejo de errores común para todas las herramientas
     */
    protected handleError(error: any): ToolResult {
        console.error(`Error en herramienta ${this.definition.name}:`, error);
        return {
            success: false,
            error: error.message || 'Error desconocido al ejecutar la herramienta',
        };
    }

    /**
     * Construye una respuesta de éxito
     */
    protected success(data: any): ToolResult {
        return {
            success: true,
            data,
        };
    }

    /**
     * Construye una respuesta de error
     */
    protected error(message: string): ToolResult {
        return {
            success: false,
            error: message,
        };
    }
}

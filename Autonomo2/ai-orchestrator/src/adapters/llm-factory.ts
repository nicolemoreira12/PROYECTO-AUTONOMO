import { ILLMProvider } from '../types';
import { GeminiAdapter } from './gemini.adapter';
import { OpenAIAdapter } from './openai.adapter';

/**
 * Factory para crear instancias de LLM Providers
 * Implementa el patrón Strategy + Factory
 * 
 * Este factory permite cambiar dinámicamente entre diferentes proveedores
 * de IA sin modificar la lógica de negocio del orchestrator.
 */
export class LLMFactory {
    private static providers: Map<string, ILLMProvider> = new Map();

    /**
     * Obtiene o crea una instancia del provider solicitado
     * @param providerName - Nombre del provider (gemini, openai, claude)
     * @param config - Configuración opcional (API keys, etc.)
     */
    static getProvider(providerName: string, config?: any): ILLMProvider {
        // Si ya existe una instancia, reutilizarla
        if (this.providers.has(providerName)) {
            return this.providers.get(providerName)!;
        }

        // Crear nueva instancia según el provider
        let provider: ILLMProvider;

        switch (providerName.toLowerCase()) {
            case 'gemini':
                provider = new GeminiAdapter(config?.apiKey);
                break;

            case 'openai':
                provider = new OpenAIAdapter(config?.apiKey, config?.model);
                break;

            // Aquí se pueden agregar más providers en el futuro
            case 'claude':
                throw new Error('Claude adapter aún no implementado');

            default:
                throw new Error(`Provider no soportado: ${providerName}`);
        }

        // Cachear la instancia
        this.providers.set(providerName, provider);
        console.log(`✅ Provider '${providerName}' registrado en el factory`);

        return provider;
    }

    /**
     * Obtiene el provider por defecto configurado en .env
     */
    static getDefaultProvider(): ILLMProvider {
        const defaultProvider = process.env.DEFAULT_LLM_PROVIDER || 'gemini';
        return this.getProvider(defaultProvider);
    }

    /**
     * Lista todos los providers disponibles
     */
    static listAvailableProviders(): string[] {
        return ['gemini', 'openai'];
    }

    /**
     * Verifica si un provider está disponible
     */
    static isProviderAvailable(providerName: string): boolean {
        return this.listAvailableProviders().includes(providerName.toLowerCase());
    }

    /**
     * Limpia el caché de providers (útil para testing)
     */
    static clearCache(): void {
        this.providers.clear();
        console.log('🧹 Caché de providers limpiado');
    }

    /**
     * Registra un provider personalizado
     * Permite extender el sistema con nuevos providers sin modificar el factory
     */
    static registerCustomProvider(name: string, provider: ILLMProvider): void {
        this.providers.set(name, provider);
        console.log(`✅ Provider personalizado '${name}' registrado`);
    }
}

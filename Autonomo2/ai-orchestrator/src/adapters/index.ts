/**
 * Barrel export para los adapters LLM
 * Patrón Strategy para intercambiar proveedores de IA
 */

export { BaseLLMAdapter } from './base.adapter';
export { GeminiAdapter } from './gemini.adapter';
export { OpenAIAdapter } from './openai.adapter';
export { LLMFactory } from './llm-factory';

/**
 * Tipos y interfaces compartidos del AI Orchestrator
 */

// ==================== MENSAJES ====================

export enum MessageRole {
    USER = 'user',
    ASSISTANT = 'assistant',
    SYSTEM = 'system',
    TOOL = 'tool',
}

export enum MessageType {
    TEXT = 'text',
    IMAGE = 'image',
    PDF = 'pdf',
    AUDIO = 'audio',
}

export interface Message {
    id: string;
    conversationId: string;
    role: MessageRole;
    content: string;
    type: MessageType;
    metadata?: {
        imageUrl?: string;
        pdfUrl?: string;
        audioUrl?: string;
        toolCall?: ToolCall;
        toolResult?: any;
    };
    timestamp: Date;
}

// ==================== LLM PROVIDER ====================

export interface LLMRequest {
    messages: Message[];
    tools?: ToolDefinition[];
    maxTokens?: number;
    temperature?: number;
}

export interface LLMResponse {
    content: string;
    toolCalls?: ToolCall[];
    finishReason: 'stop' | 'tool_call' | 'length' | 'error';
    usage?: {
        inputTokens: number;
        outputTokens: number;
        totalTokens: number;
    };
}

export interface ILLMProvider {
    name: string;
    generateResponse(request: LLMRequest): Promise<LLMResponse>;
    processImage?(imageData: Buffer | string): Promise<string>;
    transcribeAudio?(audioData: Buffer): Promise<string>;
}

// ==================== MCP TOOLS ====================

export interface ToolParameter {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    description: string;
    required: boolean;
    enum?: string[];
}

export interface ToolDefinition {
    name: string;
    description: string;
    parameters: ToolParameter[];
    category: 'query' | 'action' | 'report';
}

export interface ToolCall {
    toolName: string;
    arguments: Record<string, any>;
}

export interface ToolResult {
    success: boolean;
    data?: any;
    error?: string;
}

export interface IMCPTool {
    definition: ToolDefinition;
    execute(args: Record<string, any>, context?: any): Promise<ToolResult>;
}

// ==================== CONVERSACIÓN ====================

export interface Conversation {
    id: string;
    userId?: string;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
    metadata?: {
        source?: 'web' | 'telegram' | 'whatsapp';
        ipAddress?: string;
    };
}

// ==================== ORCHESTRATOR ====================

export interface OrchestrationRequest {
    conversationId: string;
    message: string;
    messageType: MessageType;
    userId?: string;
    metadata?: Record<string, any>;
}

export interface OrchestrationResponse {
    conversationId: string;
    message: Message;
    assistantResponse: string;
    toolsUsed?: string[];
    timestamp: Date;
}

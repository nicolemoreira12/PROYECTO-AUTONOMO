import React, { useState, useEffect, useRef } from 'react';
import { aiService, type AIMessage, type AIResponse } from '@infrastructure/services';
import './AIAssistant.css';

export const AIAssistant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<AIMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            initializeConversation();
        }
    }, [isOpen]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const initializeConversation = async () => {
        try {
            const conversationId = await aiService.startConversation();
            
            // Siempre mostrar mensaje de bienvenida (funciona en modo online y offline)
            setMessages([
                {
                    role: 'assistant',
                    content: '¡Hola! 👋 Soy tu asistente de compras con IA.\n\n¿En qué puedo ayudarte hoy?\n\n💡 Puedes preguntarme sobre:\n• Recomendaciones de productos\n• Información sobre categorías\n• Ayuda con compras\n• Métodos de pago y envío',
                    timestamp: new Date(),
                },
            ]);
        } catch (error) {
            // Fallback si falla completamente
            setMessages([
                {
                    role: 'assistant',
                    content: '👋 ¡Hola! Bienvenido al Marketplace.\n\nSoy tu asistente virtual. Puedo ayudarte con información sobre productos, categorías, compras y más.\n\n¿Qué te gustaría saber?',
                    timestamp: new Date(),
                },
            ]);
        }
    };

    const handleSendMessage = async (messageText?: string) => {
        const textToSend = messageText || inputMessage;
        if (!textToSend.trim() || isLoading) return;

        const userMessage: AIMessage = {
            role: 'user',
            content: textToSend,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);
        setSuggestions([]);

        // Enviar el mensaje y esperar la respuesta
        const response = await aiService.sendMessage(textToSend);

        // Construir el mensaje de respuesta del asistente
        const assistantMessage: AIMessage = {
            role: 'assistant',
            content: response?.message || response?.error || 'Lo siento, no pude procesar tu solicitud. Por favor, intenta de nuevo.',
            timestamp: new Date(),
        };

        // Añadir la respuesta a la lista de mensajes y desactivar el estado de carga
        setMessages(prev => [...prev, assistantMessage]);
        
        // Actualizar sugerencias si existen
        if (response?.suggestions && response.suggestions.length > 0) {
            setSuggestions(response.suggestions);
        }
        
        setIsLoading(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <>
            {/* Botón flotante */}
            <button
                className="ai-assistant-button"
                onClick={() => setIsOpen(!isOpen)}
                title="Asistente IA"
            >
                <i className="fas fa-robot"></i>
            </button>

            {/* Panel del asistente */}
            {isOpen && (
                <div className="ai-assistant-panel">
                    <div className="ai-assistant-header">
                        <div className="ai-header-content">
                            <i className="fas fa-robot"></i>
                            <h3>Asistente IA</h3>
                        </div>
                        <button
                            className="ai-close-button"
                            onClick={() => setIsOpen(false)}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    <div className="ai-assistant-messages">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`ai-message ${message.role}`}
                            >
                                <div className="ai-message-content">
                                    {message.content}
                                </div>
                                <div className="ai-message-time">
                                    {message.timestamp?.toLocaleTimeString()}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="ai-message assistant">
                                <div className="ai-message-content">
                                    <div className="ai-typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Sugerencias rápidas */}
                    {suggestions.length > 0 && (
                        <div className="ai-suggestions">
                            {suggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    className="ai-suggestion-btn"
                                    onClick={() => handleSendMessage(suggestion)}
                                    disabled={isLoading}
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="ai-assistant-input">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={e => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Escribe tu mensaje..."
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputMessage.trim() || isLoading}
                        >
                            <i className="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

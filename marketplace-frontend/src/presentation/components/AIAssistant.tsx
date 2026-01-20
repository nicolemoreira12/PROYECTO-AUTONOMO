import React, { useState, useEffect, useRef } from 'react';
import { aiService, type AIMessage } from '@infrastructure/services';
import './AIAssistant.css';

export const AIAssistant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<AIMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
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
            if (conversationId) {
                setMessages([
                    {
                        role: 'assistant',
                        content: '¡Hola! 👋 Soy tu asistente de compras con IA. ¿En qué puedo ayudarte hoy?',
                        timestamp: new Date(),
                    },
                ]);
            } else {
                setMessages([
                    {
                        role: 'assistant',
                        content: '👋 ¡Hola! Bienvenido al Marketplace.\n\n💡 El servicio de IA está en modo de demostración.\n\nExplora nuestros productos y encuentra las mejores ofertas. Si necesitas ayuda, el equipo de soporte está disponible.',
                        timestamp: new Date(),
                    },
                ]);
            }
        } catch (error) {
            console.warn('IA Service no disponible:', error);
            setMessages([
                {
                    role: 'assistant',
                    content: '👋 ¡Hola! Bienvenido al Marketplace.\n\n💡 Modo de demostración:\nEl asistente IA requiere el servidor AI Orchestrator (puerto 6000).\n\nMientras tanto, puedes:\n✅ Explorar productos\n✅ Agregar al carrito\n✅ Realizar compras\n\n¿Necesitas ayuda? Contacta a soporte.',
                    timestamp: new Date(),
                },
            ]);
        }
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage: AIMessage = {
            role: 'user',
            content: inputMessage,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const response = await aiService.sendMessage(inputMessage);
            
            const assistantMessage: AIMessage = {
                role: 'assistant',
                content: response.message || response.error || '💡 El servicio de IA no está disponible.\n\nPara usar el asistente inteligente:\n1. Inicia el servidor AI Orchestrator (puerto 6000)\n2. Vuelve a intentar tu consulta\n\n¿Necesitas ayuda? Contacta a soporte.',
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            setMessages(prev => [
                ...prev,
                {
                    role: 'assistant',
                    content: '💡 El servicio de IA no está disponible en este momento.\n\n¿Qué puedes hacer?\n✅ Explorar el catálogo de productos\n✅ Usar la búsqueda\n✅ Contactar soporte si necesitas ayuda\n\nPara activar el asistente IA, inicia el servidor en el puerto 6000.',
                    timestamp: new Date(),
                },
            ]);
        } finally {
            setIsLoading(false);
        }
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

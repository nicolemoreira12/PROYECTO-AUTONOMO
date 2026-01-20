import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary capturó un error:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '2rem',
                    maxWidth: '800px',
                    margin: '2rem auto',
                    backgroundColor: '#fee',
                    border: '1px solid #fcc',
                    borderRadius: '8px'
                }}>
                    <h1 style={{ color: '#c00' }}>⚠️ Algo salió mal</h1>
                    <p>La aplicación encontró un error inesperado.</p>
                    
                    {this.state.error && (
                        <details style={{ marginTop: '1rem' }}>
                            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                                Ver detalles del error
                            </summary>
                            <pre style={{
                                backgroundColor: '#f5f5f5',
                                padding: '1rem',
                                borderRadius: '4px',
                                overflow: 'auto',
                                marginTop: '0.5rem'
                            }}>
                                {this.state.error.toString()}
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </pre>
                        </details>
                    )}

                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '1rem',
                            padding: '0.5rem 1rem',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Recargar página
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

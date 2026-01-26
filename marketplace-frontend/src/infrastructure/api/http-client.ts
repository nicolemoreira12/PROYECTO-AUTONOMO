import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { MICROSERVICES, TIMEOUTS } from './microservices.config';

// Clase de error personalizada que preserva status y response
export class HttpError extends Error {
    constructor(
        message: string,
        public status?: number,
        public response?: any
    ) {
        super(message);
        this.name = 'HttpError';
    }
}

// Configuración base del cliente HTTP
const API_BASE_URL = MICROSERVICES.MARKETPLACE;
const AUTH_BASE_URL = MICROSERVICES.AUTH;

class HttpClient {
    private client: AxiosInstance;
    private authClient: AxiosInstance;
    private isRefreshing = false;
    private refreshSubscribers: ((token: string) => void)[] = [];

    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            timeout: TIMEOUTS.REQUEST,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.authClient = axios.create({
            baseURL: AUTH_BASE_URL,
            timeout: TIMEOUTS.REQUEST,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors() {
        // Interceptores para client normal
        this.client.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        this.client.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
                const url = originalRequest?.url || '';

                // Solo intentar refresh en errores 401 (no autenticado)
                // NO hacer logout en errores 400, 403, 500, etc.
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    console.warn('⚠️ Error 401 en:', url);

                    const refreshToken = localStorage.getItem('refreshToken');
                    
                    if (refreshToken) {
                        try {
                            const newToken = await this.handleTokenRefresh(refreshToken);
                            if (newToken && originalRequest.headers) {
                                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                                return this.client(originalRequest);
                            }
                        } catch (refreshError) {
                            // Solo hacer logout si el refresh falla
                            console.error('❌ Error al refrescar token:', refreshError);
                            // NO hacer logout automático, dejar que el usuario decida
                            console.warn('⚠️ Refresh falló, pero no hacemos logout automático');
                        }
                    } else {
                        // No hay refresh token - probablemente el usuario no está logueado
                        console.warn('⚠️ No hay refresh token disponible');
                        // NO hacer logout automático aquí tampoco
                    }
                }
                
                // Para errores 403 (forbidden), NO hacer logout automático
                if (error.response?.status === 403) {
                    console.warn('Error 403 - Acceso prohibido:', url, error.response.data);
                }

                return Promise.reject(this.handleError(error));
            }
        );

        // Interceptores para authClient
        this.authClient.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        this.authClient.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                // Solo hacer logout si el error es en rutas de autenticación críticas
                // NO hacer logout automático por errores generales
                const url = error.config?.url || '';
                if (error.response?.status === 401 && url.includes('/auth/')) {
                    console.warn('Error 401 en authClient, pero no hacemos logout automático');
                }
                return Promise.reject(this.handleError(error));
            }
        );
    }

    private async handleTokenRefresh(refreshToken: string): Promise<string | null> {
        if (this.isRefreshing) {
            return new Promise((resolve) => {
                this.refreshSubscribers.push((token: string) => {
                    resolve(token);
                });
            });
        }

        this.isRefreshing = true;

        try {
            const response = await axios.post(`${AUTH_BASE_URL}/auth/refresh`, {
                refreshToken,
            });

            const { accessToken, refreshToken: newRefreshToken } = response.data;

            localStorage.setItem('token', accessToken);
            if (newRefreshToken) {
                localStorage.setItem('refreshToken', newRefreshToken);
            }

            this.isRefreshing = false;
            this.onRefreshed(accessToken);
            this.refreshSubscribers = [];

            return accessToken;
        } catch (error) {
            this.isRefreshing = false;
            this.refreshSubscribers = [];
            return null;
        }
    }

    private onRefreshed(token: string) {
        this.refreshSubscribers.forEach((callback) => callback(token));
    }

    private handleLogout() {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }

    private handleError(error: AxiosError): HttpError {
        if (error.response) {
            const message = (error.response.data as any)?.message || 'Error del servidor';
            return new HttpError(message, error.response.status, error.response.data);
        } else if (error.request) {
            // Silenciado en modo offline - el error se maneja en los repositorios
            return new HttpError('Backend no disponible', 0);
        } else {
            return new HttpError('Error inesperado');
        }
    }

    getInstance(): AxiosInstance {
        return this.client;
    }

    // Métodos regulares
    async get<T>(url: string): Promise<T> {
        const response = await this.client.get<T>(url);
        return response.data;
    }

    async post<T>(url: string, data?: any): Promise<T> {
        const response = await this.client.post<T>(url, data);
        return response.data;
    }

    async put<T>(url: string, data?: any): Promise<T> {
        const response = await this.client.put<T>(url, data);
        return response.data;
    }

    async delete<T>(url: string): Promise<T> {
        const response = await this.client.delete<T>(url);
        return response.data;
    }

    // Métodos para autenticación (llaman directo a puerto 4000)
    async authPost<T>(url: string, data?: any): Promise<T> {
        const response = await this.authClient.post<T>(url, data);
        return response.data;
    }

    async authGet<T>(url: string): Promise<T> {
        const response = await this.authClient.get<T>(url);
        return response.data;
    }
}

export const httpClient = new HttpClient();

import axios, { AxiosInstance, AxiosError } from 'axios';

// Configuración base del cliente HTTP
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const AUTH_BASE_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:4000';

class HttpClient {
    private client: AxiosInstance;
    private authClient: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            timeout: 60000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.authClient = axios.create({
            baseURL: AUTH_BASE_URL,
            timeout: 60000,
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
            (error: AxiosError) => {
                if (error.response?.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
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
            (error: AxiosError) => {
                if (error.response?.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                }
                return Promise.reject(this.handleError(error));
            }
        );
    }

    private handleError(error: AxiosError): Error {
        if (error.response) {
            const message = (error.response.data as any)?.message || 'Error del servidor';
            return new Error(message);
        } else if (error.request) {
            return new Error('Error de conexión. Verifica tu red.');
        } else {
            return new Error('Error inesperado');
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

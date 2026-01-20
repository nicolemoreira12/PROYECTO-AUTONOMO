import { create } from 'zustand';
import { Usuario } from '@domain/entities/Usuario';

interface AuthState {
    user: Usuario | null;
    token: string | null;
    isAuthenticated: boolean;
    setAuth: (user: Usuario, token: string) => void;
    clearAuth: () => void;
    loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,

    setAuth: (user, token) => {
        set({ user, token, isAuthenticated: true });
    },

    clearAuth: () => {
        // Limpiar localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false });
    },

    loadFromStorage: () => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (token && userStr) {
            try {
                const user = JSON.parse(userStr);
                set({ user, token, isAuthenticated: true });
            } catch (error) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
    },
}));

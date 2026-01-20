import { useState } from 'react';
import { LoginUseCase, RegisterUseCase, LogoutUseCase } from '@application/use-cases';
import { AuthRepositoryImpl } from '@infrastructure/repositories';
import { RegisterData } from '@domain/repositories/IAuthRepository';
import { useAuthStore } from '../store';
import { useNavigate } from 'react-router-dom';

const authRepository = new AuthRepositoryImpl();
const loginUseCase = new LoginUseCase(authRepository);
const registerUseCase = new RegisterUseCase(authRepository);
const logoutUseCase = new LogoutUseCase(authRepository);

export const useAuth = () => {
    const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const login = async (email: string, password: string) => {
        try {
            setLoading(true);
            setError(null);
            const { user, token } = await loginUseCase.execute(email, password);
            setAuth(user, token);
            navigate('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const register = async (data: RegisterData) => {
        try {
            setLoading(true);
            setError(null);
            await registerUseCase.execute(data);
            // No iniciar sesión automáticamente, redirigir al login
            navigate('/login');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al registrarse');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await logoutUseCase.execute();
            clearAuth();
            navigate('/login');
        } catch (err) {
            console.error('Error al cerrar sesión:', err);
            clearAuth();
            navigate('/login');
        }
    };

    return {
        user,
        isAuthenticated,
        loading,
        error,
        login,
        register,
        logout,
    };
};

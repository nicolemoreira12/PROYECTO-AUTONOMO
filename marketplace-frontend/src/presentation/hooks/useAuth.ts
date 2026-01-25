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

    const login = async (email: string, password: string, rol: 'usuario' | 'emprendedor') => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('🔐 Iniciando sesión...', { email, rol });
            
            const { user, token } = await loginUseCase.execute(email, password, rol);
            
            console.log('✅ Login exitoso:', {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol
            });
            
            // Guardar en el store
            setAuth(user, token);
            
            // Pequeña espera para asegurar que el estado se guardó
            await new Promise(resolve => setTimeout(resolve, 150));
            
            // Redirigir según el rol real del usuario
            const redirectPath = user.rol === 'emprendedor' ? '/emprendedor' : '/';
            console.log('🔄 Redirigiendo a:', redirectPath);
            
            navigate(redirectPath, { replace: true });
        } catch (err) {
            console.error('❌ Error en login:', err);
            const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const register = async (data: RegisterData) => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('📝 Registrando usuario...', { email: data.email, rol: data.rol });
            
            const { user, token } = await registerUseCase.execute(data);
            
            console.log('✅ Registro exitoso:', {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol
            });
            
            // Guardar en el store
            setAuth(user, token);
            
            // Pequeña espera para asegurar que el estado se guardó
            await new Promise(resolve => setTimeout(resolve, 150));
            
            // Redirigir según el rol
            const redirectPath = user.rol === 'emprendedor' ? '/emprendedor' : '/';
            console.log('🔄 Redirigiendo a:', redirectPath);
            
            navigate(redirectPath, { replace: true });
        } catch (err) {
            console.error('❌ Error en register:', err);
            const errorMessage = err instanceof Error ? err.message : 'Error al registrarse';
            setError(errorMessage);
            throw new Error(errorMessage);
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

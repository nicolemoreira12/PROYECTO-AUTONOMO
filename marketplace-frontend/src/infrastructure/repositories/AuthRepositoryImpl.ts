import { IAuthRepository, RegisterData } from '@domain/repositories/IAuthRepository';
import { Usuario } from '@domain/entities/Usuario';
import { httpClient, API_ENDPOINTS } from '../api';

export class AuthRepositoryImpl implements IAuthRepository {
    async login(email: string, password: string): Promise<{ user: Usuario; token: string }> {
        console.log('📤 Enviando solicitud de login:', { email });
        
        const response = await httpClient.authPost(API_ENDPOINTS.LOGIN, { email, password });
        
        console.log('📥 Respuesta del login:', response);
        
        // La respuesta es: { success: true, data: { user: {...}, tokens: {...} } }
        const responseData = (response as any).data || response;
        const user = responseData.user;
        const tokens = responseData.tokens || {};
        const tokenToUse = tokens.accessToken || (response as any).token || (response as any).accessToken;

        // Guardar token en localStorage
        localStorage.setItem('token', tokenToUse);
        localStorage.setItem('user', JSON.stringify(user));

        return { user, token: tokenToUse };
    }

    async register(data: RegisterData): Promise<{ user: Usuario; token: string }> {
        // Adaptar los datos al formato que espera el auth-service
        const [firstName, ...lastNameParts] = data.nombre.split(' ');
        const lastName = lastNameParts.join(' ') || firstName;
        
        // Mapear el rol: 'usuario' -> 'user'
        const roleMap: Record<string, string> = {
            'usuario': 'user',
            'emprendedor': 'emprendedor',
            'admin': 'admin'
        };
        
        const registerPayload = {
            firstName: firstName,
            lastName: lastName,
            email: data.email,
            password: data.password,
            phone: '', // Opcional
            role: roleMap[data.rol || 'usuario'] || 'user'
        };
        
        console.log('📤 Enviando solicitud de registro:', registerPayload);
        
        const response = await httpClient.authPost(API_ENDPOINTS.REGISTER, registerPayload);
        
        console.log('📥 Respuesta del registro:', response);
        
        // La respuesta es: { success: true, message: string, data: { user: {...}, tokens: {...} } }
        const responseData = (response as any).data || response;
        const user = responseData.user;
        const tokens = responseData.tokens || {};
        const tokenToUse = tokens.accessToken || (response as any).token || (response as any).accessToken;

        localStorage.setItem('token', tokenToUse);
        localStorage.setItem('user', JSON.stringify(user));

        return { user, token: tokenToUse };
    }

    async logout(): Promise<void> {
        try {
            await httpClient.post(API_ENDPOINTS.LOGOUT);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }

    async getCurrentUser(): Promise<Usuario | null> {
        try {
            const response = await httpClient.get(API_ENDPOINTS.ME);
            return response.data;
        } catch (error) {
            return null;
        }
    }

    async refreshToken(): Promise<string> {
        const response = await httpClient.post(API_ENDPOINTS.REFRESH);
        const { token } = response.data;
        localStorage.setItem('token', token);
        return token;
    }
}

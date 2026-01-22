import { IAuthRepository, RegisterData } from '@domain/repositories/IAuthRepository';
import { Usuario } from '@domain/entities/Usuario';
import { httpClient, API_ENDPOINTS } from '../api';

export class AuthRepositoryImpl implements IAuthRepository {
    async login(email: string, password: string, rol: 'usuario' | 'emprendedor'): Promise<{ user: Usuario; token: string }> {
        console.log(' Enviando solicitud de login:', { email });

        // Paso 1: Autenticar y obtener el token
        const loginResponse = await httpClient.authPost(API_ENDPOINTS.LOGIN, { email, password });
        const responseData = (loginResponse as any).data || loginResponse;
        const tokens = responseData.tokens || {};
        const token = tokens.accessToken || (loginResponse as any).token || (loginResponse as any).accessToken;

        if (!token) {
            throw new Error('No se recibió el token de autenticación');
        }

        // Guardar el token para la siguiente petición
        localStorage.setItem('token', token);

        // Paso 2: Usar el token para obtener el perfil de usuario desde /me
        const userProfileResponse = await httpClient.authGet(API_ENDPOINTS.ME);
        const userFromServer = (userProfileResponse as any).data || userProfileResponse;

        if (!userFromServer) {
            throw new Error('No se pudo obtener el perfil del usuario');
        }

        console.log('1. ROL RECIBIDO EN EL REPOSITORIO:', userFromServer.rol);

        // Forzar el rol seleccionado por el usuario (la fuente de la verdad)
        userFromServer.rol = rol;

        // Guardar el usuario con el rol ya corregido
        localStorage.setItem('user', JSON.stringify(userFromServer));

        const user = userFromServer;

        return { user, token };
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

        const userFromBackend = (response as any).data?.user || (response as any).user;
        console.log('🔍 ROL RECIBIDO DEL SERVIDOR (Registro):', userFromBackend?.rol);

        // La respuesta es: { success: true, message: string, data: { user: {...}, tokens: {...} } }
        const responseData = (response as any).data || response;
        const user = responseData.user;

        // Forzar el rol en el frontend para asegurar consistencia
        if (user) {
            user.rol = data.rol;
        }

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

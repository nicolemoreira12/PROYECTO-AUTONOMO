import { IAuthRepository, RegisterData } from '@domain/repositories/IAuthRepository';
import { Usuario } from '@domain/entities/Usuario';
import { httpClient, API_ENDPOINTS } from '../api';

export class AuthRepositoryImpl implements IAuthRepository {
    async login(email: string, password: string, rol: 'usuario' | 'emprendedor'): Promise<{ user: Usuario; token: string }> {
        console.log('📤 Enviando solicitud de login:', { email, rol });

        // Paso 1: Autenticar en auth-service y obtener el token
        const loginResponse = await httpClient.authPost(API_ENDPOINTS.LOGIN, { email, password });
        const responseData = (loginResponse as any).data || loginResponse;
        const tokens = responseData.tokens || {};
        const token = tokens.accessToken || (loginResponse as any).token || (loginResponse as any).accessToken;

        if (!token) {
            throw new Error('No se recibió el token de autenticación');
        }

        // Guardar el token temporalmente para las siguientes peticiones
        localStorage.setItem('token', token);

        // Paso 2: Obtener el perfil completo desde auth-service
        const userProfileResponse = await httpClient.authGet(API_ENDPOINTS.ME);
        const authUser = (userProfileResponse as any).data || userProfileResponse;

        if (!authUser) {
            throw new Error('No se pudo obtener el perfil del usuario');
        }

        console.log('📥 Usuario de auth-service:', authUser);
        console.log('⚠️ VERIFICACIÓN: Email enviado:', email);
        console.log('⚠️ VERIFICACIÓN: Email devuelto por auth-service:', authUser.email);
        
        if (email !== authUser.email) {
            console.error('🔴 ¡INCONSISTENCIA DETECTADA! Los emails no coinciden:');
            console.error('   - Enviado:', email);
            console.error('   - Devuelto:', authUser.email);
        }

        // Paso 3: Verificar/crear usuario en Markplace y obtener su información completa
        const markplaceUser = await this.syncUserWithMarkplace(authUser, rol);

        // Paso 4: Validar que el rol coincida
        if (markplaceUser.rol !== rol) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            throw new Error(`Este correo está registrado como ${markplaceUser.rol}. Por favor, selecciona el rol correcto.`);
        }

        // Paso 5: Construir el objeto de usuario final
        const user: Usuario = {
            id: markplaceUser.id,
            nombre: markplaceUser.nombre,
            apellido: markplaceUser.apellido,
            email: markplaceUser.email,
            rol: markplaceUser.rol as 'usuario' | 'emprendedor',
            direccion: markplaceUser.direccion || '',
            telefono: markplaceUser.telefono || '',
        };

        console.log('✅ Login exitoso. Usuario completo:', user);
        console.log('🔑 Token recibido:', token.substring(0, 50) + '...');

        // Guardar datos finales
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        
        console.log('💾 Token guardado en localStorage');
        console.log('💾 Usuario guardado en localStorage');

        return { user, token };
    }

    async register(data: RegisterData): Promise<{ user: Usuario; token: string }> {
        // Validar que el email sea válido
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            throw new Error('Por favor, ingresa un correo electrónico válido');
        }

        // Validar contraseña
        if (data.password.length < 8) {
            throw new Error('La contraseña debe tener al menos 8 caracteres');
        }

        // Adaptar los datos al formato que espera el auth-service
        const [firstName, ...lastNameParts] = data.nombre.split(' ');
        const lastName = lastNameParts.join(' ') || firstName;

        // Mapear el rol: 'usuario' -> 'user', 'emprendedor' -> 'emprendedor'
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
            phone: data.telefono || '',
            role: roleMap[data.rol || 'usuario'] || 'user'
        };

        console.log('📤 Registrando usuario en auth-service:', { ...registerPayload, password: '***' });

        // Paso 1: Registrar en auth-service
        const response = await httpClient.authPost(API_ENDPOINTS.REGISTER, registerPayload);
        console.log('📥 Respuesta del registro:', response);

        const responseData = (response as any).data || response;
        const authUser = responseData.user;
        const tokens = responseData.tokens || {};
        const token = tokens.accessToken || (response as any).token || (response as any).accessToken;

        if (!token) {
            throw new Error('No se recibió el token de autenticación');
        }

        // Guardar token temporalmente
        localStorage.setItem('token', token);

        // Paso 2: Crear usuario en Markplace con toda la información
        const markplaceUserData = {
            nombre: firstName,
            apellido: lastName,
            email: data.email,
            contrasena: 'synced-from-auth', // Password está en auth-service
            direccion: data.direccion || '',
            telefono: data.telefono || '',
            rol: data.rol,
            fechaRegistro: new Date().toISOString()
        };

        console.log('📤 Creando usuario en Markplace:', markplaceUserData);

        const markplaceResponse = await httpClient.post('/usuarios', markplaceUserData);
        const markplaceUser = (markplaceResponse as any).data || markplaceResponse;

        console.log('✅ Usuario creado en Markplace:', markplaceUser);

        // Paso 3: Si es emprendedor, crear registro de emprendedor
        if (data.rol === 'emprendedor') {
            try {
                const emprendedorData = {
                    usuarioId: markplaceUser.id,
                    nombreTienda: `Tienda de ${firstName}`,
                    descripcionTienda: 'Mi tienda personal',
                    rating: 5.0
                };
                
                console.log('📤 Creando emprendedor:', emprendedorData);
                await httpClient.post('/emprendedores', emprendedorData);
                console.log('✅ Emprendedor creado exitosamente');
            } catch (empError) {
                console.warn('⚠️ Error al crear emprendedor:', empError);
                // No lanzar error, el usuario sigue siendo válido
            }
        }

        // Paso 4: Construir usuario final
        const user: Usuario = {
            id: markplaceUser.id,
            nombre: markplaceUser.nombre,
            apellido: markplaceUser.apellido,
            email: markplaceUser.email,
            rol: data.rol,
            direccion: markplaceUser.direccion || '',
            telefono: markplaceUser.telefono || '',
        };

        console.log('✅ Registro completo. Usuario:', user);

        // Guardar datos finales
        localStorage.setItem('user', JSON.stringify(user));

        return { user, token };
    }

    async logout(): Promise<void> {
        // Solo limpiar localStorage local
        // El token JWT no puede ser invalidado en el servidor sin lista negra
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        console.log('🚪 Sesión cerrada localmente');
    }

    async getCurrentUser(): Promise<Usuario | null> {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            return null;
        }

        try {
            const user = JSON.parse(userStr);
            // Validar que tenga los campos necesarios
            if (user.id && user.email && user.rol) {
                return user;
            }
            return null;
        } catch {
            return null;
        }
    }

    async refreshToken(): Promise<string> {
        const response = await httpClient.authPost(API_ENDPOINTS.REFRESH, {});
        const { accessToken } = response.data;
        localStorage.setItem('token', accessToken);
        return accessToken;
    }

    // Método privado para sincronizar/verificar usuario con Markplace
    private async syncUserWithMarkplace(authUser: any, rol: 'usuario' | 'emprendedor'): Promise<any> {
        try {
            // Verificar si el usuario ya existe en Markplace por email
            console.log('🔍 Buscando usuario en Markplace:', authUser.email);
            
            let existingUser = null;
            try {
                const existingUserResponse = await httpClient.get(`/usuarios/email/${authUser.email}`);
                existingUser = (existingUserResponse as any)?.data;
            } catch (searchError: any) {
                // 404 es normal - significa que el usuario no existe aún
                if (!searchError.message?.includes('no encontrado') && !searchError.message?.includes('404')) {
                    console.warn('⚠️ Error inesperado al buscar usuario:', searchError.message);
                }
            }

            if (existingUser) {
                console.log('✅ Usuario encontrado en Markplace:', existingUser);
                return existingUser;
            }

            // Si no existe, crearlo
            console.log('➕ Usuario no existe en Markplace, creando...');
            
            const newUserData = {
                nombre: authUser.firstName || authUser.nombre,
                apellido: authUser.lastName || authUser.apellido || '',
                email: authUser.email,
                // No enviar contraseña - está en auth-service
                direccion: authUser.address || '',
                telefono: authUser.phone || '',
                rol: rol
                // fechaRegistro y updated_at se generan automáticamente en la BD
            };

            console.log('📤 Datos a enviar:', JSON.stringify(newUserData, null, 2));

            let newUser;
            try {
                const newUserResponse = await httpClient.post('/usuarios', newUserData);
                newUser = (newUserResponse as any).data || newUserResponse;
                console.log('✅ Usuario creado en Markplace:', newUser);
            } catch (createError: any) {
                console.error('❌ Error detallado al crear usuario:', {
                    message: createError.message,
                    status: createError.status,
                    response: createError.response
                });

                // Si el error es porque el usuario ya existe (email duplicado)
                const isDuplicateError = 
                    createError.status === 409 || 
                    createError.response?.message?.toLowerCase().includes('duplicate') ||
                    createError.response?.message?.toLowerCase().includes('unique') ||
                    createError.message?.toLowerCase().includes('ya existe');

                if (isDuplicateError) {
                    console.log('⚠️ Usuario ya existe (duplicado), buscando de nuevo...');
                    // Esperar un momento antes de buscar
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    // Reintentar búsqueda múltiples veces
                    for (let i = 0; i < 5; i++) {
                        try {
                            console.log(`   🔄 Intento ${i + 1} de recuperar usuario...`);
                            const retryResponse = await httpClient.get(`/usuarios/email/${authUser.email}`);
                            newUser = retryResponse;
                            if (newUser) {
                                console.log(`✅ Usuario recuperado en intento ${i + 1}:`, { id: newUser.id, email: newUser.email });
                                break;
                            }
                        } catch (retryError: any) {
                            console.warn(`   ⚠️ Intento ${i + 1} falló:`, retryError.message);
                            if (i < 4) { // Si no es el último intento
                                await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)));
                            }
                        }
                    }
                    
                    if (!newUser) {
                        throw new Error('Usuario existe en BD pero no se puede recuperar. Verifica los logs del backend.');
                    }
                } else {
                    throw createError;
                }
            }

            // Si es emprendedor, crear registro de emprendedor
            if (rol === 'emprendedor' && newUser) {
                try {
                    const emprendedorData = {
                        usuarioId: newUser.id,
                        nombreTienda: `Tienda de ${newUser.nombre}`,
                        descripcionTienda: 'Mi tienda personal',
                        rating: 5.0
                    };
                    
                    await httpClient.post('/emprendedores', emprendedorData);
                    console.log('✅ Emprendedor creado automáticamente');
                } catch (empError) {
                    console.warn('⚠️ Error al crear emprendedor:', empError);
                }
            }

            return newUser;
        } catch (error) {
            console.error('❌ Error en syncUserWithMarkplace:', error);
            throw new Error('Error al sincronizar usuario con la base de datos');
        }
    }
}

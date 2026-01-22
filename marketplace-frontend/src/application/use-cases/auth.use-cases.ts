import { IAuthRepository, RegisterData } from '@domain/repositories/IAuthRepository';
import { Usuario } from '@domain/entities/Usuario';

export class LoginUseCase {
    constructor(private authRepository: IAuthRepository) { }

    async execute(email: string, password: string, rol: 'usuario' | 'emprendedor'): Promise<{ user: Usuario; token: string }> {
        if (!email || !password) {
            throw new Error('Email y contraseña son requeridos');
        }

        const result = await this.authRepository.login(email, password, rol);
        console.log('2. ROL AL PASAR POR EL CASO DE USO:', result.user.rol);
        return result;
    }
}

export class RegisterUseCase {
    constructor(private authRepository: IAuthRepository) { }

    async execute(data: RegisterData): Promise<{ user: Usuario; token: string }> {
        if (!data.email || !data.password || !data.nombre) {
            throw new Error('Todos los campos son requeridos');
        }

        if (data.password.length < 8) {
            throw new Error('La contraseña debe tener al menos 8 caracteres');
        }

        if (!/[A-Z]/.test(data.password)) {
            throw new Error('La contraseña debe contener al menos una letra mayúscula');
        }

        if (!/[@$!%*?&]/.test(data.password)) {
            throw new Error('La contraseña debe contener al menos un carácter especial (@$!%*?&)');
        }

        return await this.authRepository.register(data);
    }
}

export class LogoutUseCase {
    constructor(private authRepository: IAuthRepository) { }

    async execute(): Promise<void> {
        await this.authRepository.logout();
    }
}

export class GetCurrentUserUseCase {
    constructor(private authRepository: IAuthRepository) { }

    async execute(): Promise<Usuario | null> {
        return await this.authRepository.getCurrentUser();
    }
}

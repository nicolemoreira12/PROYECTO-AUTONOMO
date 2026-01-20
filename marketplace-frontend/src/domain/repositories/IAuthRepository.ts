import { Usuario } from '../entities/Usuario';

// Interface del repositorio (contrato)
export interface IAuthRepository {
    login(email: string, password: string): Promise<{ user: Usuario; token: string }>;
    register(data: RegisterData): Promise<{ user: Usuario; token: string }>;
    logout(): Promise<void>;
    getCurrentUser(): Promise<Usuario | null>;
    refreshToken(): Promise<string>;
}

export interface RegisterData {
    nombre: string;
    email: string;
    password: string;
    rol?: 'usuario' | 'emprendedor';
}

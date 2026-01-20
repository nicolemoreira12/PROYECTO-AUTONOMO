// Entidad Usuario del Dominio
export interface Usuario {
    id: number;
    nombre: string;
    email: string;
    rol: 'usuario' | 'emprendedor' | 'admin';
    createdAt: Date;
    updatedAt: Date;
}

// Value Object para validación
export class Email {
    private constructor(private readonly value: string) { }

    static create(email: string): Email | null {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return null;
        }
        return new Email(email);
    }

    getValue(): string {
        return this.value;
    }
}

// Entidad Producto del Dominio
export interface Producto {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
    imagen?: string;
    categoriaId: number;
    categoria?: Categoria;
    emprendedorId: number;
    emprendedor?: Emprendedor;
    activo?: boolean;
    fechaCreacion?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface Categoria {
    id: number;
    nombre: string;
    descripcion?: string;
}

export interface Emprendedor {
    id: number;
    nombre: string;
}

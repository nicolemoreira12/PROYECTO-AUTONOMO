// Entidad Producto del Dominio
export interface Producto {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
    imagen?: string;
    categoriaId: number;
    emprendedorId: number;
    activo: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Categoria {
    id: number;
    nombre: string;
    descripcion: string;
}

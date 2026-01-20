// Entidad Orden del Dominio
export interface Orden {
    id: number;
    usuarioId: number;
    total: number;
    estado: 'pendiente' | 'procesando' | 'completada' | 'cancelada';
    detalles?: DetalleOrden[];
    items?: ItemOrden[];
    fechaCreacion?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface ItemOrden {
    id: number;
    ordenId: number;
    productoId: number;
    cantidad: number;
    precio: number;
    producto?: {
        id: number;
        nombre: string;
        precio: number;
        imagen?: string;
        descripcion?: string;
        stock: number;
        emprendedorId: number;
        categoriaId: number;
        fechaCreacion: Date;
    };
}

export interface DetalleOrden {
    id: number;
    ordenId: number;
    productoId: number;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
}

export interface CarritoCompra {
    id: number;
    usuarioId: number;
    items: ItemCarrito[];
}

export interface ItemCarrito {
    id: number;
    productoId: number;
    producto?: {
        nombre: string;
        precio: number;
        imagen?: string;
    };
    cantidad: number;
}

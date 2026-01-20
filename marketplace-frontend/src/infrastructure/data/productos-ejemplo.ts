import { Producto } from '@domain/entities';

// Productos de ejemplo para desarrollo y demostración
export const productosEjemplo: Producto[] = [
    {
        id: 1,
        nombre: "Laptop HP Pavilion 15",
        descripcion: "Laptop potente con procesador Intel Core i7, 16GB RAM, SSD 512GB. Perfecta para trabajo y entretenimiento. Pantalla Full HD de 15.6 pulgadas.",
        precio: 899.99,
        stock: 15,
        imagen: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500",
        categoriaId: 1,
        categoria: {
            id: 1,
            nombre: "Electrónica",
            descripcion: "Dispositivos electrónicos y tecnología"
        },
        emprendedorId: 1,
        emprendedor: {
            id: 1,
            nombre: "TechStore EC"
        },
        activo: true,
        fechaCreacion: new Date('2025-01-15'),
        createdAt: new Date('2025-01-15'),
        updatedAt: new Date('2025-01-15')
    },
    {
        id: 2,
        nombre: "iPhone 15 Pro 256GB",
        descripcion: "El último iPhone con chip A17 Pro, cámara de 48MP, pantalla ProMotion de 6.1 pulgadas. Incluye cable USB-C y garantía de 1 año.",
        precio: 1299.99,
        stock: 8,
        imagen: "https://images.unsplash.com/photo-1592286927505-2fd7591c8fcc?w=500",
        categoriaId: 1,
        categoria: {
            id: 1,
            nombre: "Electrónica",
            descripcion: "Dispositivos electrónicos y tecnología"
        },
        emprendedorId: 1,
        emprendedor: {
            id: 1,
            nombre: "TechStore EC"
        },
        activo: true,
        fechaCreacion: new Date('2025-01-16'),
        createdAt: new Date('2025-01-16'),
        updatedAt: new Date('2025-01-16')
    },
    {
        id: 3,
        nombre: "Auriculares Sony WH-1000XM5",
        descripcion: "Auriculares premium con cancelación de ruido líder en la industria. Batería de 30 horas, sonido Hi-Res, Bluetooth 5.2.",
        precio: 349.99,
        stock: 25,
        imagen: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
        categoriaId: 1,
        categoria: {
            id: 1,
            nombre: "Electrónica",
            descripcion: "Dispositivos electrónicos y tecnología"
        },
        emprendedorId: 2,
        emprendedor: {
            id: 2,
            nombre: "AudioPro"
        },
        activo: true,
        fechaCreacion: new Date('2025-01-14'),
        createdAt: new Date('2025-01-14'),
        updatedAt: new Date('2025-01-14')
    },
    {
        id: 4,
        nombre: "Camiseta Deportiva Nike Dri-FIT",
        descripcion: "Camiseta técnica de alta calidad con tecnología Dri-FIT que mantiene la piel seca. Ideal para running y gimnasio. Tallas S-XL.",
        precio: 39.99,
        stock: 50,
        imagen: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
        categoriaId: 2,
        categoria: {
            id: 2,
            nombre: "Ropa y Accesorios",
            descripcion: "Moda y vestimenta"
        },
        emprendedorId: 3,
        emprendedor: {
            id: 3,
            nombre: "SportWear EC"
        },
        activo: true,
        fechaCreacion: new Date('2025-01-13'),
        createdAt: new Date('2025-01-13'),
        updatedAt: new Date('2025-01-13')
    },
    {
        id: 5,
        nombre: "Zapatillas Adidas Ultraboost 23",
        descripcion: "Zapatillas de running con tecnología Boost para máxima comodidad y retorno de energía. Diseño moderno y resistente.",
        precio: 189.99,
        stock: 30,
        imagen: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
        categoriaId: 2,
        categoria: {
            id: 2,
            nombre: "Ropa y Accesorios",
            descripcion: "Moda y vestimenta"
        },
        emprendedorId: 3,
        emprendedor: {
            id: 3,
            nombre: "SportWear EC"
        },
        activo: true,
        fechaCreacion: new Date('2025-01-12'),
        createdAt: new Date('2025-01-12'),
        updatedAt: new Date('2025-01-12')
    },
    {
        id: 6,
        nombre: "Mochila Ejecutiva Swiss Peak",
        descripcion: "Mochila premium para laptop de hasta 17 pulgadas. Compartimentos organizadores, puerto USB, material resistente al agua.",
        precio: 79.99,
        stock: 20,
        imagen: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
        categoriaId: 2,
        categoria: {
            id: 2,
            nombre: "Ropa y Accesorios",
            descripcion: "Moda y vestimenta"
        },
        emprendedorId: 4,
        emprendedor: {
            id: 4,
            nombre: "AccessPro"
        },
        activo: true,
        fechaCreacion: new Date('2025-01-11'),
        createdAt: new Date('2025-01-11'),
        updatedAt: new Date('2025-01-11')
    },
    {
        id: 7,
        nombre: "Cafetera Nespresso Vertuo",
        descripcion: "Máquina de café espresso con tecnología Centrifusion. Prepara café y espresso de calidad barista en casa. Incluye 12 cápsulas.",
        precio: 199.99,
        stock: 12,
        imagen: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500",
        categoriaId: 3,
        categoria: {
            id: 3,
            nombre: "Hogar y Cocina",
            descripcion: "Productos para el hogar"
        },
        emprendedorId: 5,
        emprendedor: {
            id: 5,
            nombre: "HomePlus"
        },
        activo: true,
        fechaCreacion: new Date('2025-01-10'),
        createdAt: new Date('2025-01-10'),
        updatedAt: new Date('2025-01-10')
    },
    {
        id: 8,
        nombre: "Set de Sartenes Antiadherentes",
        descripcion: "Juego de 3 sartenes (20, 24, 28cm) con recubrimiento antiadherente profesional. Apto para todo tipo de cocinas incluido inducción.",
        precio: 89.99,
        stock: 18,
        imagen: "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=500",
        categoriaId: 3,
        categoria: {
            id: 3,
            nombre: "Hogar y Cocina",
            descripcion: "Productos para el hogar"
        },
        emprendedorId: 5,
        emprendedor: {
            id: 5,
            nombre: "HomePlus"
        },
        activo: true,
        fechaCreacion: new Date('2025-01-09'),
        createdAt: new Date('2025-01-09'),
        updatedAt: new Date('2025-01-09')
    },
    {
        id: 9,
        nombre: "Smartwatch Samsung Galaxy Watch 6",
        descripcion: "Reloj inteligente con monitoreo de salud 24/7, GPS, resistente al agua. Pantalla AMOLED de 1.4 pulgadas. Batería de 2 días.",
        precio: 279.99,
        stock: 22,
        imagen: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
        categoriaId: 1,
        categoria: {
            id: 1,
            nombre: "Electrónica",
            descripcion: "Dispositivos electrónicos y tecnología"
        },
        emprendedorId: 1,
        emprendedor: {
            id: 1,
            nombre: "TechStore EC"
        },
        activo: true,
        fechaCreacion: new Date('2025-01-08'),
        createdAt: new Date('2025-01-08'),
        updatedAt: new Date('2025-01-08')
    },
    {
        id: 10,
        nombre: "Libro 'Hábitos Atómicos' de James Clear",
        descripcion: "Best seller sobre cómo construir buenos hábitos y romper malos. Guía práctica respaldada por ciencia. Tapa dura, 320 páginas.",
        precio: 24.99,
        stock: 35,
        imagen: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500",
        categoriaId: 4,
        categoria: {
            id: 4,
            nombre: "Libros y Educación",
            descripcion: "Libros y material educativo"
        },
        emprendedorId: 6,
        emprendedor: {
            id: 6,
            nombre: "BookStore EC"
        },
        activo: true,
        fechaCreacion: new Date('2025-01-07'),
        createdAt: new Date('2025-01-07'),
        updatedAt: new Date('2025-01-07')
    },
    {
        id: 11,
        nombre: "Yoga Mat Premium Antideslizante",
        descripcion: "Colchoneta de yoga de 6mm de grosor, material eco-friendly, superficie antideslizante. Incluye correa de transporte. 183x61cm.",
        precio: 34.99,
        stock: 40,
        imagen: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500",
        categoriaId: 5,
        categoria: {
            id: 5,
            nombre: "Deportes y Fitness",
            descripcion: "Equipamiento deportivo"
        },
        emprendedorId: 3,
        emprendedor: {
            id: 3,
            nombre: "SportWear EC"
        },
        activo: true,
        fechaCreacion: new Date('2025-01-06'),
        createdAt: new Date('2025-01-06'),
        updatedAt: new Date('2025-01-06')
    },
    {
        id: 12,
        nombre: "Planta Monstera Deliciosa",
        descripcion: "Planta de interior tropical, purifica el aire, fácil de cuidar. Altura aproximada 40cm en maceta decorativa incluida.",
        precio: 45.00,
        stock: 28,
        imagen: "https://images.unsplash.com/photo-1545241047-6083a3684587?w=500",
        categoriaId: 6,
        categoria: {
            id: 6,
            nombre: "Jardín y Exterior",
            descripcion: "Plantas y jardinería"
        },
        emprendedorId: 7,
        emprendedor: {
            id: 7,
            nombre: "GreenLife"
        },
        activo: true,
        fechaCreacion: new Date('2025-01-05'),
        createdAt: new Date('2025-01-05'),
        updatedAt: new Date('2025-01-05')
    }
];

// Función para obtener producto de ejemplo por ID
export const getProductoEjemploPorId = (id: number): Producto | null => {
    return productosEjemplo.find(p => p.id === id) || null;
};

// Función para buscar productos de ejemplo
export const buscarProductosEjemplo = (query: string): Producto[] => {
    const searchTerm = query.toLowerCase();
    return productosEjemplo.filter(p => 
        p.nombre.toLowerCase().includes(searchTerm) ||
        p.descripcion.toLowerCase().includes(searchTerm) ||
        p.categoria?.nombre.toLowerCase().includes(searchTerm)
    );
};

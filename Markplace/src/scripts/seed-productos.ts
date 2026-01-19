import 'reflect-metadata';
import 'dotenv/config';
import { AppDataSource } from '../config/data-source';
import { Producto } from '../entities/Producto';
import { Categoria } from '../entities/Categoria';
import { Emprendedor } from '../entities/Emprendedor';

/**
 * Script para limpiar y poblar productos en la base de datos
 * Uso: npx ts-node src/scripts/seed-productos.ts
 */

const productosNuevos = [

    {
        nombre: 'Laptop HP Pavilion 15',
        descripcion: 'Laptop con procesador Intel Core i5, 8GB RAM, 256GB SSD, pantalla Full HD 15.6"',
        precio: 799.99,
        stock: 15,
        imagenURL: 'https://example.com/laptop-hp.jpg',
        categoriaNombre: 'Electrónica',
    },
    {
        nombre: 'iPhone 15 Pro',
        descripcion: 'Smartphone Apple con chip A17 Pro, cámara de 48MP, 256GB de almacenamiento',
        precio: 1299.99,
        stock: 8,
        imagenURL: 'https://example.com/iphone-15.jpg',
        categoriaNombre: 'Electrónica',
    },
    {
        nombre: 'Auriculares Sony WH-1000XM5',
        descripcion: 'Auriculares inalámbricos con cancelación de ruido premium, 30h de batería',
        precio: 349.99,
        stock: 25,
        imagenURL: 'https://example.com/sony-auriculares.jpg',
        categoriaNombre: 'Electrónica',
    },
    {
        nombre: 'Cafetera Nespresso Vertuo',
        descripcion: 'Cafetera de cápsulas con tecnología Centrifusion, incluye 12 cápsulas',
        precio: 189.99,
        stock: 30,
        imagenURL: 'https://example.com/nespresso.jpg',
        categoriaNombre: 'Hogar',
    },
    {
        nombre: 'Libro "Cien Años de Soledad"',
        descripcion: 'Novela de Gabriel García Márquez, edición de colección con tapa dura',
        precio: 24.99,
        stock: 50,
        imagenURL: 'https://example.com/libro-cien.jpg',
        categoriaNombre: 'Libros',
    },
    {
        nombre: 'Zapatillas Nike Air Max 270',
        descripcion: 'Zapatillas deportivas con tecnología Air Max, disponibles en varios colores',
        precio: 149.99,
        stock: 40,
        imagenURL: 'https://example.com/nike-air.jpg',
        categoriaNombre: 'Ropa',
    },
    {
        nombre: 'Smartwatch Samsung Galaxy Watch 6',
        descripcion: 'Reloj inteligente con monitor de salud, GPS, resistente al agua',
        precio: 299.99,
        stock: 20,
        imagenURL: 'https://example.com/samsung-watch.jpg',
        categoriaNombre: 'Electrónica',
    },
    {
        nombre: 'Mesa de Escritorio Gaming',
        descripcion: 'Mesa ergonómica para gaming con porta cables, 140x60cm, acabado negro',
        precio: 249.99,
        stock: 12,
        imagenURL: 'https://example.com/mesa-gaming.jpg',
        categoriaNombre: 'Hogar',
    },
];

async function limpiarProductos() {
    console.log('🗑️  Eliminando productos existentes...');
    const productoRepo = AppDataSource.getRepository(Producto);
    await productoRepo.query('TRUNCATE TABLE producto CASCADE');
    console.log('✅ Productos eliminados');
}

async function crearCategoriasSiNoExisten() {
    console.log('📂 Verificando categorías...');
    const categoriaRepo = AppDataSource.getRepository(Categoria);

    const categoriasNecesarias = ['Electrónica', 'Hogar', 'Libros', 'Ropa'];

    for (const nombreCat of categoriasNecesarias) {
        let categoria = await categoriaRepo.findOne({ where: { nombreCategoria: nombreCat } });

        if (!categoria) {
            categoria = categoriaRepo.create({
                nombreCategoria: nombreCat,
                descripcion: `Categoría de ${nombreCat}`,
            });
            await categoriaRepo.save(categoria);
            console.log(`✅ Categoría creada: ${nombreCat}`);
        }
    }
}

async function obtenerOCrearEmprendedor() {
    console.log('👤 Verificando emprendedor...');
    const emprendedorRepo = AppDataSource.getRepository(Emprendedor);

    let emprendedor = await emprendedorRepo.findOne({ where: {} });

    if (!emprendedor) {
        emprendedor = emprendedorRepo.create({
            nombreTienda: 'Tienda Principal',
            descripcionTienda: 'Tienda oficial del marketplace',
            rating: 4.5,
        });
        await emprendedorRepo.save(emprendedor);
        console.log('✅ Emprendedor creado');
    }

    return emprendedor;
}

async function insertarProductos() {
    console.log('📦 Insertando nuevos productos...');

    const productoRepo = AppDataSource.getRepository(Producto);
    const categoriaRepo = AppDataSource.getRepository(Categoria);
    const emprendedor = await obtenerOCrearEmprendedor();

    for (const prodData of productosNuevos) {
        const categoria = await categoriaRepo.findOne({
            where: { nombreCategoria: prodData.categoriaNombre }
        });

        if (!categoria) {
            console.log(`⚠️  Categoría no encontrada: ${prodData.categoriaNombre}`);
            continue;
        }

        const producto = productoRepo.create({
            nombreProducto: prodData.nombre,
            descripcion: prodData.descripcion,
            precio: prodData.precio,
            stock: prodData.stock,
            imagenURL: prodData.imagenURL,
            categoria: categoria,
            emprendedor: emprendedor,
        });

        await productoRepo.save(producto);
        console.log(`✅ Producto creado: ${prodData.nombre} - $${prodData.precio}`);
    }
}

async function main() {
    try {
        console.log('🚀 Iniciando seed de productos...\n');

        // Conectar a la base de datos
        await AppDataSource.initialize();
        console.log('✅ Conectado a la base de datos\n');

        // 1. Limpiar productos existentes
        await limpiarProductos();
        console.log('');

        // 2. Crear categorías si no existen
        await crearCategoriasSiNoExisten();
        console.log('');

        // 3. Insertar nuevos productos
        await insertarProductos();
        console.log('');

        console.log('🎉 ¡Productos actualizados exitosamente!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await AppDataSource.destroy();
        process.exit(0);
    }
}

// Ejecutar script
main();

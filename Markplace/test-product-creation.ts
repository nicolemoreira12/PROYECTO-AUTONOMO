import "dotenv/config";
import { AppDataSource } from "./src/config/data-source";
import { Producto } from "./src/entities/Producto";
import { Emprendedor } from "./src/entities/Emprendedor";
import { Categoria } from "./src/entities/Categoria";

async function testProductCreation() {
    console.log('🔍 Probando creación de producto...');
    
    try {
        await AppDataSource.initialize();
        console.log('✅ Conexión a BD exitosa');
        
        const productoRepo = AppDataSource.getRepository(Producto);
        const emprendedorRepo = AppDataSource.getRepository(Emprendedor);
        const categoriaRepo = AppDataSource.getRepository(Categoria);
        
        // Buscar emprendedor y categoría existentes
        const emprendedores = await emprendedorRepo.find({ take: 1 });
        const categorias = await categoriaRepo.find({ take: 1 });
        
        console.log('📋 Emprendedores encontrados:', emprendedores.length);
        console.log('📋 Categorías encontradas:', categorias.length);
        
        if (emprendedores.length === 0) {
            console.error('❌ No hay emprendedores en la BD');
            return;
        }
        
        if (categorias.length === 0) {
            console.error('❌ No hay categorías en la BD');
            return;
        }
        
        const emprendedor = emprendedores[0];
        const categoria = categorias[0];
        
        console.log('👤 Usando emprendedor:', { id: emprendedor.idEmprendedor, nombre: emprendedor.nombreTienda });
        console.log('🏷️ Usando categoría:', { id: categoria.idCategoria, nombre: categoria.nombreCategoria });
        
        // Método 1: Crear con relaciones completas
        console.log('\n🧪 Método 1: Con objetos de relación completos');
        const producto1 = productoRepo.create({
            nombreProducto: 'Test Producto 1',
            descripcion: 'Descripción de prueba',
            precio: 99.99,
            stock: 10,
            imagenURL: '/images/default.jpg',
            emprendedor: emprendedor,
            categoria: categoria
        });
        
        try {
            const saved1 = await productoRepo.save(producto1);
            console.log('✅ Producto 1 creado:', { id: saved1.idProducto, nombre: saved1.nombreProducto });
            await productoRepo.delete(saved1.idProducto);
            console.log('🗑️ Producto 1 eliminado');
        } catch (error: any) {
            console.error('❌ Error con método 1:', error.message);
        }
        
        // Método 2: Crear con IDs (requiere configuración especial)
        console.log('\n🧪 Método 2: Con solo IDs');
        const producto2 = productoRepo.create({
            nombreProducto: 'Test Producto 2',
            descripcion: 'Descripción de prueba 2',
            precio: 199.99,
            stock: 5,
            imagenURL: '/images/default.jpg',
            emprendedor: { idEmprendedor: emprendedor.idEmprendedor } as any,
            categoria: { idCategoria: categoria.idCategoria } as any
        });
        
        try {
            const saved2 = await productoRepo.save(producto2);
            console.log('✅ Producto 2 creado:', { id: saved2.idProducto, nombre: saved2.nombreProducto });
            await productoRepo.delete(saved2.idProducto);
            console.log('🗑️ Producto 2 eliminado');
        } catch (error: any) {
            console.error('❌ Error con método 2:', error.message);
            console.error('Detalles:', error);
        }
        
        await AppDataSource.destroy();
        console.log('\n✅ Prueba completada');
        
    } catch (error) {
        console.error('❌ Error en la prueba:', error);
        process.exit(1);
    }
}

testProductCreation();

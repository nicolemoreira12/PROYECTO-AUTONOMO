import "dotenv/config";
import { AppDataSource } from "./src/config/data-source";
import { Categoria } from "./src/entities/Categoria";

async function seedCategorias() {
    console.log('🌱 Sembrando categorías...');
    
    try {
        await AppDataSource.initialize();
        console.log('✅ Conexión a BD exitosa');
        
        const categoriaRepo = AppDataSource.getRepository(Categoria);
        
        // Verificar si ya existen categorías
        const existingCount = await categoriaRepo.count();
        if (existingCount > 0) {
            console.log(`ℹ️ Ya existen ${existingCount} categorías en la BD`);
            const categorias = await categoriaRepo.find();
            console.log('Categorías existentes:');
            categorias.forEach(c => console.log(`  - ${c.nombreCategoria} (ID: ${c.idCategoria})`));
            await AppDataSource.destroy();
            return;
        }
        
        // Crear categorías predeterminadas
        const categorias = [
            { nombreCategoria: 'Electrónica', descripcion: 'Productos electrónicos y tecnología' },
            { nombreCategoria: 'Ropa y Accesorios', descripcion: 'Prendas de vestir y complementos' },
            { nombreCategoria: 'Hogar y Jardín', descripcion: 'Productos para el hogar' },
            { nombreCategoria: 'Deportes', descripcion: 'Artículos deportivos y fitness' },
            { nombreCategoria: 'Libros y Medios', descripcion: 'Libros, música y películas' },
            { nombreCategoria: 'Alimentos y Bebidas', descripcion: 'Productos alimenticios' },
            { nombreCategoria: 'Salud y Belleza', descripcion: 'Productos de cuidado personal' },
            { nombreCategoria: 'Juguetes', descripcion: 'Juguetes y juegos' },
            { nombreCategoria: 'Artesanías', descripcion: 'Productos artesanales' },
            { nombreCategoria: 'Otros', descripcion: 'Otros productos' }
        ];
        
        console.log(`📝 Creando ${categorias.length} categorías...`);
        
        for (const catData of categorias) {
            const categoria = categoriaRepo.create(catData);
            await categoriaRepo.save(categoria);
            console.log(`✅ Creada: ${categoria.nombreCategoria} (ID: ${categoria.idCategoria})`);
        }
        
        await AppDataSource.destroy();
        console.log('\n✅ Semilla completada exitosamente');
        
    } catch (error) {
        console.error('❌ Error al sembrar categorías:', error);
        process.exit(1);
    }
}

seedCategorias();

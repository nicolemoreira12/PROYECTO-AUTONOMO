import "dotenv/config";
import { AppDataSource } from "./src/config/data-source";

async function testConnection() {
    console.log('🔍 Probando conexión a la base de datos...');
    console.log('📋 Configuración:');
    console.log('   Host:', process.env.DB_HOST);
    console.log('   Port:', process.env.DB_PORT);
    console.log('   User:', process.env.DB_USER);
    console.log('   Database:', process.env.DB_NAME);
    console.log('   SSL:', process.env.DB_SSL);
    
    try {
        await AppDataSource.initialize();
        console.log('✅ Conexión exitosa a la base de datos');
        
        // Probar crear un usuario de prueba
        const usuarioRepo = AppDataSource.getRepository('Usuario');
        const testUser = usuarioRepo.create({
            nombre: 'Test',
            apellido: 'Usuario',
            email: `test-${Date.now()}@test.com`,
            rol: 'usuario',
        });
        
        const saved = await usuarioRepo.save(testUser);
        console.log('✅ Usuario de prueba creado:', saved);
        
        // Eliminar el usuario de prueba
        await usuarioRepo.delete(saved.id);
        console.log('✅ Usuario de prueba eliminado');
        
        await AppDataSource.destroy();
        console.log('✅ Conexión cerrada');
    } catch (error) {
        console.error('❌ Error en la conexión:', error);
        console.error('Stack:', error instanceof Error ? error.stack : 'No stack');
        process.exit(1);
    }
}

testConnection();

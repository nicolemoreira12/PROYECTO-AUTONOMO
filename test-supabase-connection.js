require('dotenv').config({ path: './Markplace/.env' });
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '6543'),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  console.log('\n🔍 Probando conexión a Supabase...\n');
  console.log('Configuración:');
  console.log('  Host:', process.env.DB_HOST);
  console.log('  Port:', process.env.DB_PORT);
  console.log('  User:', process.env.DB_USER);
  console.log('  Database:', process.env.DB_NAME);
  console.log('  SSL: true\n');

  try {
    const client = await pool.connect();
    console.log('✅ Conexión exitosa a Supabase!\n');
    
    const result = await client.query('SELECT NOW() as tiempo_servidor, version()');
    console.log('⏰ Hora del servidor:', result.rows[0].tiempo_servidor);
    console.log('📦 Versión PostgreSQL:', result.rows[0].version.split(',')[0], '\n');
    
    // Verificar tablas existentes
    const tables = await client.query(`
      SELECT table_name, table_schema
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log(`📋 Tablas encontradas: ${tables.rows.length}\n`);
    
    if (tables.rows.length === 0) {
      console.log('⚠️  No se encontraron tablas en el esquema public.');
      console.log('📝 Necesitas ejecutar el archivo supabase-schema.sql\n');
      console.log('Pasos:');
      console.log('1. Ve a: https://supabase.com/dashboard/project/oowknaujgtnygogbfxgl/sql');
      console.log('2. Crea una nueva query');
      console.log('3. Copia el contenido de supabase-schema.sql');
      console.log('4. Ejecuta la query\n');
    } else {
      console.log('Tablas:');
      tables.rows.forEach(t => console.log(`  • ${t.table_name}`));
      console.log('');
    }
    
    // Verificar si existe la tabla usuarios
    const usuariosCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'usuarios'
      );
    `);
    
    if (usuariosCheck.rows[0].exists) {
      const countResult = await client.query('SELECT COUNT(*) FROM usuarios');
      console.log(`👥 Usuarios en la base de datos: ${countResult.rows[0].count}\n`);
    }
    
    client.release();
    console.log('✅ Test completado exitosamente!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error de conexión:', err.message);
    console.error('\n💡 Posibles soluciones:');
    console.error('   1. Verifica que DB_PASS esté correctamente configurado en Markplace/.env');
    console.error('   2. Verifica que el puerto sea 6543 (Connection Pooler)');
    console.error('   3. Revisa que el host sea db.oowknaujgtnygogbfxgl.supabase.co');
    console.error('   4. Asegúrate de que DB_SSL=true\n');
    process.exit(1);
  }
}

testConnection();

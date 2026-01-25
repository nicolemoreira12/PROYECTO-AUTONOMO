const { Pool } = require('pg');

const pool = new Pool({
  host: 'aws-1-us-east-2.pooler.supabase.com',
  port: 6543,
  user: 'postgres.oowknaujgtnygogbfxgl',
  password: 'Nibia:12345NL',
  database: 'postgres'
});

async function ejecutarSQL() {
  const client = await pool.connect();
  try {
    console.log('✅ Conectado a Supabase');
    
    // Fix 1: Actualizar email inconsistente en users
    console.log('\n📝 Actualizando email en tabla users...');
    const result1 = await client.query(`
      UPDATE public.users 
      SET email = 'sleide.mt@gmail.com' 
      WHERE email = 'sleidemt@gmail.com'
    `);
    console.log(`   Filas actualizadas: ${result1.rowCount}`);
    
    // Fix 2: Actualizar email en usuarios si existe
    console.log('\n📝 Actualizando email en tabla usuarios...');
    const result2 = await client.query(`
      UPDATE public.usuarios 
      SET email = 'sleide.mt@gmail.com' 
      WHERE email = 'sleidemt@gmail.com'
    `);
    console.log(`   Filas actualizadas: ${result2.rowCount}`);
    
    // Fix 3: Hacer campo contrasena nullable
    console.log('\n📝 Modificando columna contrasena para permitir NULL...');
    await client.query(`
      ALTER TABLE public.usuarios 
      ALTER COLUMN contrasena DROP NOT NULL
    `);
    console.log('   ✅ Columna modificada exitosamente');
    
    // Verificación
    console.log('\n🔍 Verificando cambios...');
    const users = await client.query(`
      SELECT id, email, role FROM public.users WHERE email LIKE '%sleide%'
    `);
    console.log('\n📋 Usuarios en tabla users:');
    console.table(users.rows);
    
    const usuarios = await client.query(`
      SELECT id, nombre, apellido, email, rol FROM public.usuarios WHERE email LIKE '%sleide%'
    `);
    console.log('\n📋 Usuarios en tabla usuarios:');
    console.table(usuarios.rows);
    
    const columnInfo = await client.query(`
      SELECT column_name, is_nullable, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'usuarios' AND column_name = 'contrasena'
    `);
    console.log('\n📋 Info de columna contrasena:');
    console.table(columnInfo.rows);
    
    console.log('\n✅ Todas las correcciones aplicadas exitosamente');
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

ejecutarSQL().catch(console.error);

-- Script para limpiar usuario de prueba de Supabase
-- Ejecutar SOLO si necesitas eliminar el usuario para volver a registrarlo

-- 1. Ver el usuario actual
SELECT id, nombre, apellido, email, rol, fecha_registro
FROM usuarios 
WHERE email = 'toroj1483@gmail.com';

-- 2. Eliminar registros relacionados (si existen)
-- Eliminar emprendedor
DELETE FROM emprendedor WHERE usuario_id IN (
    SELECT id FROM usuarios WHERE email = 'toroj1483@gmail.com'
);

-- Eliminar carrito
DELETE FROM carrito_compra WHERE usuario_id IN (
    SELECT id FROM usuarios WHERE email = 'toroj1483@gmail.com'
);

-- 3. Eliminar el usuario
DELETE FROM usuarios WHERE email = 'toroj1483@gmail.com';

-- 4. Verificar que se eliminó
SELECT id, nombre, apellido, email, rol
FROM usuarios 
WHERE email = 'toroj1483@gmail.com';
-- Debe retornar 0 filas

-- Nota: También necesitas eliminar el usuario de auth-service (Supabase Auth)
-- Para eso, ve a: https://supabase.com/dashboard/project/oowknaujgtnygogbfxgl/auth/users
-- Y elimina el usuario con email toroj1483@gmail.com

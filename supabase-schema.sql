-- =====================================================
-- SCHEMA COMPLETO PARA SUPABASE - MARKETPLACE
-- Sistema de E-commerce con Chat Bot, Pagos y Analytics
-- =====================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. ENUMS Y TIPOS PERSONALIZADOS
-- =====================================================

-- Roles de usuario
CREATE TYPE user_role AS ENUM ('comprador', 'vendedor', 'admin');

-- Estados de pedido
CREATE TYPE order_status AS ENUM ('pendiente', 'confirmado', 'en_preparacion', 'enviado', 'entregado', 'cancelado');

-- Estados de pago
CREATE TYPE payment_status AS ENUM ('pendiente', 'procesando', 'completado', 'fallido', 'reembolsado');

-- Métodos de pago
CREATE TYPE payment_method AS ENUM ('tarjeta', 'paypal', 'transferencia', 'efectivo');

-- Estados de producto
CREATE TYPE product_status AS ENUM ('activo', 'inactivo', 'agotado', 'descontinuado');

-- =====================================================
-- 2. TABLA DE USUARIOS (Base principal)
-- =====================================================

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    -- Sincronización con auth-service
    auth_user_id UUID UNIQUE, -- ID del usuario en auth-service
    
    -- Información personal
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    contrasena TEXT, -- Puede ser NULL si se autentica por auth-service
    
    -- Información de contacto
    telefono VARCHAR(20),
    direccion TEXT,
    
    -- Rol y permisos
    rol user_role NOT NULL DEFAULT 'comprador',
    
    -- Fechas
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ultima_conexion TIMESTAMP WITH TIME ZONE,
    
    -- Estado de cuenta
    activo BOOLEAN DEFAULT TRUE,
    email_verificado BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    avatar_url TEXT,
    preferencias JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para usuarios
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_auth_user_id ON usuarios(auth_user_id);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);

-- =====================================================
-- 3. TABLA DE EMPRENDEDORES (Vendedores)
-- =====================================================

CREATE TABLE emprendedores (
    id_emprendedor SERIAL PRIMARY KEY,
    usuario_id INTEGER UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    
    -- Información de la tienda
    nombre_tienda VARCHAR(200) NOT NULL,
    descripcion_tienda TEXT,
    logo_url TEXT,
    banner_url TEXT,
    
    -- Contacto
    telefono_tienda VARCHAR(20),
    email_tienda VARCHAR(255),
    direccion_tienda TEXT,
    
    -- Redes sociales
    instagram VARCHAR(100),
    facebook VARCHAR(100),
    whatsapp VARCHAR(20),
    
    -- Métricas
    rating DECIMAL(3,2) DEFAULT 5.00 CHECK (rating >= 0 AND rating <= 5),
    total_ventas INTEGER DEFAULT 0,
    total_productos INTEGER DEFAULT 0,
    
    -- Finanzas
    balance_disponible DECIMAL(12,2) DEFAULT 0.00,
    balance_pendiente DECIMAL(12,2) DEFAULT 0.00,
    
    -- Verificación
    verificado BOOLEAN DEFAULT FALSE,
    fecha_verificacion TIMESTAMP WITH TIME ZONE,
    
    -- Configuración
    acepta_pedidos BOOLEAN DEFAULT TRUE,
    tiempo_preparacion_min INTEGER DEFAULT 30, -- minutos
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_emprendedores_usuario_id ON emprendedores(usuario_id);
CREATE INDEX idx_emprendedores_verificado ON emprendedores(verificado);

-- =====================================================
-- 4. TABLA DE CATEGORÍAS
-- =====================================================

CREATE TABLE categorias (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    icono VARCHAR(50),
    imagen_url TEXT,
    activa BOOLEAN DEFAULT TRUE,
    orden INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Datos iniciales de categorías
INSERT INTO categorias (nombre, descripcion, icono) VALUES
('Alimentos', 'Productos alimenticios y bebidas', '🍕'),
('Artesanías', 'Productos artesanales hechos a mano', '🎨'),
('Ropa', 'Ropa y accesorios', '👕'),
('Joyería', 'Joyas y accesorios', '💍'),
('Electrónicos', 'Dispositivos electrónicos', '📱'),
('Hogar', 'Productos para el hogar', '🏠'),
('Belleza', 'Productos de belleza y cuidado personal', '💄'),
('Libros', 'Libros y material educativo', '📚'),
('Juguetes', 'Juguetes y juegos', '🧸'),
('Otros', 'Otros productos', '📦');

-- =====================================================
-- 5. TABLA DE PRODUCTOS
-- =====================================================

CREATE TABLE productos (
    id_producto SERIAL PRIMARY KEY,
    emprendedor_id INTEGER NOT NULL REFERENCES emprendedores(id_emprendedor) ON DELETE CASCADE,
    categoria_id INTEGER REFERENCES categorias(id_categoria) ON DELETE SET NULL,
    
    -- Información básica
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    
    -- Precio e inventario
    precio DECIMAL(12,2) NOT NULL CHECK (precio >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    
    -- Imágenes
    imagen_url TEXT,
    imagenes JSONB DEFAULT '[]'::jsonb, -- Array de URLs de imágenes
    
    -- Estado
    estado product_status DEFAULT 'activo',
    
    -- Métricas
    vistas INTEGER DEFAULT 0,
    ventas INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
    total_resenas INTEGER DEFAULT 0,
    
    -- Detalles adicionales
    peso_kg DECIMAL(8,2),
    dimensiones JSONB, -- {largo, ancho, alto}
    tags TEXT[], -- Array de etiquetas para búsqueda
    
    -- Descuentos
    descuento_porcentaje INTEGER DEFAULT 0 CHECK (descuento_porcentaje >= 0 AND descuento_porcentaje <= 100),
    precio_descuento DECIMAL(12,2),
    
    -- Destacados
    destacado BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para productos
CREATE INDEX idx_productos_emprendedor ON productos(emprendedor_id);
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_productos_estado ON productos(estado);
CREATE INDEX idx_productos_destacado ON productos(destacado);
CREATE INDEX idx_productos_nombre ON productos USING gin(to_tsvector('spanish', nombre));

-- =====================================================
-- 6. TABLA DE CARRITO
-- =====================================================

CREATE TABLE carrito (
    id_carrito SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos(id_producto) ON DELETE CASCADE,
    
    cantidad INTEGER NOT NULL DEFAULT 1 CHECK (cantidad > 0),
    precio_unitario DECIMAL(12,2) NOT NULL,
    
    -- Notas especiales
    notas TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(usuario_id, producto_id)
);

CREATE INDEX idx_carrito_usuario ON carrito(usuario_id);

-- =====================================================
-- 7. TABLA DE PEDIDOS
-- =====================================================

CREATE TABLE pedidos (
    id_pedido SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE SET NULL,
    emprendedor_id INTEGER NOT NULL REFERENCES emprendedores(id_emprendedor) ON DELETE SET NULL,
    
    -- Información del pedido
    numero_pedido VARCHAR(50) UNIQUE NOT NULL,
    estado order_status DEFAULT 'pendiente',
    
    -- Totales
    subtotal DECIMAL(12,2) NOT NULL,
    descuento DECIMAL(12,2) DEFAULT 0.00,
    impuestos DECIMAL(12,2) DEFAULT 0.00,
    envio DECIMAL(12,2) DEFAULT 0.00,
    total DECIMAL(12,2) NOT NULL,
    
    -- Información de entrega
    direccion_envio TEXT NOT NULL,
    ciudad VARCHAR(100),
    codigo_postal VARCHAR(20),
    telefono_contacto VARCHAR(20),
    
    -- Notas
    notas_cliente TEXT,
    notas_vendedor TEXT,
    
    -- Fechas
    fecha_pedido TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_confirmacion TIMESTAMP WITH TIME ZONE,
    fecha_envio TIMESTAMP WITH TIME ZONE,
    fecha_entrega TIMESTAMP WITH TIME ZONE,
    fecha_cancelacion TIMESTAMP WITH TIME ZONE,
    
    -- Tracking
    codigo_seguimiento VARCHAR(100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para pedidos
CREATE INDEX idx_pedidos_usuario ON pedidos(usuario_id);
CREATE INDEX idx_pedidos_emprendedor ON pedidos(emprendedor_id);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_pedidos_numero ON pedidos(numero_pedido);
CREATE INDEX idx_pedidos_fecha ON pedidos(fecha_pedido DESC);

-- =====================================================
-- 8. TABLA DE DETALLES DE PEDIDO
-- =====================================================

CREATE TABLE detalle_pedido (
    id_detalle SERIAL PRIMARY KEY,
    pedido_id INTEGER NOT NULL REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    producto_id INTEGER REFERENCES productos(id_producto) ON DELETE SET NULL,
    
    -- Información del producto al momento de la compra
    nombre_producto VARCHAR(200) NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    
    -- Snapshot del producto
    producto_snapshot JSONB, -- Información completa del producto
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_detalle_pedido_pedido ON detalle_pedido(pedido_id);

-- =====================================================
-- 9. TABLA DE PAGOS
-- =====================================================

CREATE TABLE pagos (
    id_pago SERIAL PRIMARY KEY,
    pedido_id INTEGER NOT NULL REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE SET NULL,
    
    -- Información del pago
    monto DECIMAL(12,2) NOT NULL,
    metodo payment_method NOT NULL,
    estado payment_status DEFAULT 'pendiente',
    
    -- IDs de transacciones externas
    transaccion_id VARCHAR(255) UNIQUE,
    proveedor_pago VARCHAR(50), -- stripe, paypal, etc.
    
    -- Detalles de la tarjeta (últimos 4 dígitos)
    ultimos_4_digitos VARCHAR(4),
    tipo_tarjeta VARCHAR(50),
    
    -- Fechas
    fecha_pago TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_procesado TIMESTAMP WITH TIME ZONE,
    fecha_reembolso TIMESTAMP WITH TIME ZONE,
    
    -- Información adicional
    detalles JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pagos_pedido ON pagos(pedido_id);
CREATE INDEX idx_pagos_usuario ON pagos(usuario_id);
CREATE INDEX idx_pagos_transaccion ON pagos(transaccion_id);

-- =====================================================
-- 10. TABLA DE RESEÑAS/VALORACIONES
-- =====================================================

CREATE TABLE resenas (
    id_resena SERIAL PRIMARY KEY,
    producto_id INTEGER NOT NULL REFERENCES productos(id_producto) ON DELETE CASCADE,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    pedido_id INTEGER REFERENCES pedidos(id_pedido) ON DELETE SET NULL,
    
    -- Valoración
    calificacion INTEGER NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
    titulo VARCHAR(200),
    comentario TEXT,
    
    -- Imágenes de la reseña
    imagenes TEXT[],
    
    -- Verificación
    compra_verificada BOOLEAN DEFAULT FALSE,
    
    -- Utilidad
    votos_utiles INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(producto_id, usuario_id)
);

CREATE INDEX idx_resenas_producto ON resenas(producto_id);
CREATE INDEX idx_resenas_usuario ON resenas(usuario_id);

-- =====================================================
-- 11. TABLA DE CONVERSACIONES (ChatBot)
-- =====================================================

CREATE TABLE conversaciones (
    id_conversacion SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    
    -- Identificación
    session_id UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    
    -- Contexto
    titulo VARCHAR(200),
    resumen TEXT,
    contexto JSONB DEFAULT '{}'::jsonb,
    
    -- Estado
    activa BOOLEAN DEFAULT TRUE,
    ultima_actividad TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    canal VARCHAR(50) DEFAULT 'web', -- web, telegram, whatsapp
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_conversaciones_usuario ON conversaciones(usuario_id);
CREATE INDEX idx_conversaciones_session ON conversaciones(session_id);
CREATE INDEX idx_conversaciones_activa ON conversaciones(activa);

-- =====================================================
-- 12. TABLA DE MENSAJES (ChatBot)
-- =====================================================

CREATE TABLE mensajes (
    id_mensaje SERIAL PRIMARY KEY,
    conversacion_id INTEGER NOT NULL REFERENCES conversaciones(id_conversacion) ON DELETE CASCADE,
    
    -- Tipo de mensaje
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('user', 'assistant', 'system')),
    
    -- Contenido
    contenido TEXT NOT NULL,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    tokens_usados INTEGER,
    modelo VARCHAR(50),
    
    -- Archivos adjuntos
    archivos TEXT[],
    
    -- Feedback
    util BOOLEAN,
    feedback TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_mensajes_conversacion ON mensajes(conversacion_id);
CREATE INDEX idx_mensajes_rol ON mensajes(rol);

-- =====================================================
-- 13. TABLA DE NOTIFICACIONES
-- =====================================================

CREATE TABLE notificaciones (
    id_notificacion SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    
    -- Tipo y contenido
    tipo VARCHAR(50) NOT NULL, -- pedido, pago, mensaje, sistema
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    
    -- Enlace
    link TEXT,
    
    -- Estado
    leida BOOLEAN DEFAULT FALSE,
    fecha_leida TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX idx_notificaciones_leida ON notificaciones(leida);

-- =====================================================
-- 14. TABLA DE ESTADÍSTICAS DIARIAS (Vendedores)
-- =====================================================

CREATE TABLE estadisticas_diarias (
    id_estadistica SERIAL PRIMARY KEY,
    emprendedor_id INTEGER NOT NULL REFERENCES emprendedores(id_emprendedor) ON DELETE CASCADE,
    
    -- Fecha
    fecha DATE NOT NULL,
    
    -- Métricas de ventas
    ventas_totales INTEGER DEFAULT 0,
    ingresos_totales DECIMAL(12,2) DEFAULT 0.00,
    pedidos_completados INTEGER DEFAULT 0,
    pedidos_cancelados INTEGER DEFAULT 0,
    
    -- Métricas de productos
    productos_vendidos INTEGER DEFAULT 0,
    producto_mas_vendido_id INTEGER REFERENCES productos(id_producto) ON DELETE SET NULL,
    
    -- Métricas de clientes
    clientes_nuevos INTEGER DEFAULT 0,
    clientes_recurrentes INTEGER DEFAULT 0,
    
    -- Métricas de interacción
    vistas_perfil INTEGER DEFAULT 0,
    vistas_productos INTEGER DEFAULT 0,
    
    -- Promedios
    ticket_promedio DECIMAL(12,2) DEFAULT 0.00,
    rating_promedio DECIMAL(3,2) DEFAULT 0.00,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(emprendedor_id, fecha)
);

CREATE INDEX idx_estadisticas_emprendedor_fecha ON estadisticas_diarias(emprendedor_id, fecha DESC);

-- =====================================================
-- 15. TABLA DE SESIONES (JWT/Auth)
-- =====================================================

CREATE TABLE sesiones (
    id_sesion SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    
    -- Token info
    token_jti UUID UNIQUE NOT NULL,
    token_tipo VARCHAR(20) NOT NULL CHECK (token_tipo IN ('access', 'refresh')),
    
    -- Expiración
    expira_en TIMESTAMP WITH TIME ZONE NOT NULL,
    revocado BOOLEAN DEFAULT FALSE,
    fecha_revocacion TIMESTAMP WITH TIME ZONE,
    
    -- Info del dispositivo
    ip_address INET,
    user_agent TEXT,
    dispositivo VARCHAR(100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sesiones_usuario ON sesiones(usuario_id);
CREATE INDEX idx_sesiones_token ON sesiones(token_jti);
CREATE INDEX idx_sesiones_expira ON sesiones(expira_en);

-- =====================================================
-- 16. TABLA DE FAVORITOS
-- =====================================================

CREATE TABLE favoritos (
    id_favorito SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos(id_producto) ON DELETE CASCADE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(usuario_id, producto_id)
);

CREATE INDEX idx_favoritos_usuario ON favoritos(usuario_id);

-- =====================================================
-- 17. FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a todas las tablas con updated_at
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_emprendedores_updated_at BEFORE UPDATE ON emprendedores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON categorias FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON productos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_carrito_updated_at BEFORE UPDATE ON carrito FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pedidos_updated_at BEFORE UPDATE ON pedidos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pagos_updated_at BEFORE UPDATE ON pagos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resenas_updated_at BEFORE UPDATE ON resenas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversaciones_updated_at BEFORE UPDATE ON conversaciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para generar número de pedido único
CREATE OR REPLACE FUNCTION generar_numero_pedido()
RETURNS TRIGGER AS $$
BEGIN
    NEW.numero_pedido = 'PED-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('pedidos_id_pedido_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generar_numero_pedido
BEFORE INSERT ON pedidos
FOR EACH ROW
WHEN (NEW.numero_pedido IS NULL)
EXECUTE FUNCTION generar_numero_pedido();

-- Función para actualizar rating de productos
CREATE OR REPLACE FUNCTION actualizar_rating_producto()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE productos
    SET 
        rating = (SELECT AVG(calificacion) FROM resenas WHERE producto_id = NEW.producto_id),
        total_resenas = (SELECT COUNT(*) FROM resenas WHERE producto_id = NEW.producto_id)
    WHERE id_producto = NEW.producto_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_rating
AFTER INSERT OR UPDATE ON resenas
FOR EACH ROW
EXECUTE FUNCTION actualizar_rating_producto();

-- Función para actualizar stock después de pedido
CREATE OR REPLACE FUNCTION actualizar_stock_producto()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE productos
        SET stock = stock - NEW.cantidad,
            ventas = ventas + NEW.cantidad
        WHERE id_producto = NEW.producto_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_stock
AFTER INSERT ON detalle_pedido
FOR EACH ROW
EXECUTE FUNCTION actualizar_stock_producto();

-- Función para actualizar balance del emprendedor
CREATE OR REPLACE FUNCTION actualizar_balance_emprendedor()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado = 'completado' AND OLD.estado != 'completado' THEN
        UPDATE emprendedores
        SET balance_disponible = balance_disponible + NEW.monto
        WHERE id_emprendedor = (
            SELECT emprendedor_id FROM pedidos WHERE id_pedido = NEW.pedido_id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_balance
AFTER UPDATE ON pagos
FOR EACH ROW
EXECUTE FUNCTION actualizar_balance_emprendedor();

-- =====================================================
-- 18. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE emprendedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE carrito ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalle_pedido ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE resenas ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE estadisticas_diarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE favoritos ENABLE ROW LEVEL SECURITY;

-- Políticas para USUARIOS
-- Los usuarios pueden ver y editar su propia información
CREATE POLICY "Usuarios pueden ver su propio perfil"
    ON usuarios FOR SELECT
    USING (auth.uid()::text = auth_user_id::text OR rol = 'admin');

CREATE POLICY "Usuarios pueden actualizar su propio perfil"
    ON usuarios FOR UPDATE
    USING (auth.uid()::text = auth_user_id::text OR rol = 'admin');

-- Políticas para PRODUCTOS
-- Todos pueden ver productos activos
CREATE POLICY "Todos pueden ver productos activos"
    ON productos FOR SELECT
    USING (estado = 'activo' OR emprendedor_id IN (
        SELECT id_emprendedor FROM emprendedores 
        WHERE usuario_id IN (
            SELECT id FROM usuarios WHERE auth_user_id::text = auth.uid()::text
        )
    ));

-- Solo el emprendedor puede crear/editar sus productos
CREATE POLICY "Emprendedores pueden gestionar sus productos"
    ON productos FOR ALL
    USING (emprendedor_id IN (
        SELECT id_emprendedor FROM emprendedores 
        WHERE usuario_id IN (
            SELECT id FROM usuarios WHERE auth_user_id::text = auth.uid()::text
        )
    ));

-- Políticas para CARRITO
-- Los usuarios solo pueden ver y modificar su propio carrito
CREATE POLICY "Usuarios pueden ver su carrito"
    ON carrito FOR SELECT
    USING (usuario_id IN (
        SELECT id FROM usuarios WHERE auth_user_id::text = auth.uid()::text
    ));

CREATE POLICY "Usuarios pueden gestionar su carrito"
    ON carrito FOR ALL
    USING (usuario_id IN (
        SELECT id FROM usuarios WHERE auth_user_id::text = auth.uid()::text
    ));

-- Políticas para PEDIDOS
-- Los usuarios pueden ver sus propios pedidos
CREATE POLICY "Usuarios pueden ver sus pedidos"
    ON pedidos FOR SELECT
    USING (
        usuario_id IN (SELECT id FROM usuarios WHERE auth_user_id::text = auth.uid()::text)
        OR emprendedor_id IN (
            SELECT id_emprendedor FROM emprendedores 
            WHERE usuario_id IN (SELECT id FROM usuarios WHERE auth_user_id::text = auth.uid()::text)
        )
    );

-- Políticas para CONVERSACIONES
-- Los usuarios pueden ver sus propias conversaciones
CREATE POLICY "Usuarios pueden ver sus conversaciones"
    ON conversaciones FOR SELECT
    USING (usuario_id IN (
        SELECT id FROM usuarios WHERE auth_user_id::text = auth.uid()::text
    ));

CREATE POLICY "Usuarios pueden crear conversaciones"
    ON conversaciones FOR INSERT
    WITH CHECK (usuario_id IN (
        SELECT id FROM usuarios WHERE auth_user_id::text = auth.uid()::text
    ));

-- Políticas para MENSAJES
-- Los usuarios pueden ver mensajes de sus conversaciones
CREATE POLICY "Usuarios pueden ver sus mensajes"
    ON mensajes FOR SELECT
    USING (conversacion_id IN (
        SELECT id_conversacion FROM conversaciones 
        WHERE usuario_id IN (
            SELECT id FROM usuarios WHERE auth_user_id::text = auth.uid()::text
        )
    ));

-- Políticas para ESTADÍSTICAS
-- Solo emprendedores pueden ver sus propias estadísticas
CREATE POLICY "Emprendedores pueden ver sus estadísticas"
    ON estadisticas_diarias FOR SELECT
    USING (emprendedor_id IN (
        SELECT id_emprendedor FROM emprendedores 
        WHERE usuario_id IN (
            SELECT id FROM usuarios WHERE auth_user_id::text = auth.uid()::text
        )
    ));

-- Políticas para NOTIFICACIONES
CREATE POLICY "Usuarios pueden ver sus notificaciones"
    ON notificaciones FOR SELECT
    USING (usuario_id IN (
        SELECT id FROM usuarios WHERE auth_user_id::text = auth.uid()::text
    ));

CREATE POLICY "Usuarios pueden actualizar sus notificaciones"
    ON notificaciones FOR UPDATE
    USING (usuario_id IN (
        SELECT id FROM usuarios WHERE auth_user_id::text = auth.uid()::text
    ));

-- =====================================================
-- 19. VISTAS ÚTILES
-- =====================================================

-- Vista de productos con información del vendedor
CREATE OR REPLACE VIEW vista_productos_completos AS
SELECT 
    p.*,
    e.nombre_tienda,
    e.rating AS rating_vendedor,
    e.verificado AS vendedor_verificado,
    c.nombre AS categoria_nombre,
    u.email AS vendedor_email
FROM productos p
LEFT JOIN emprendedores e ON p.emprendedor_id = e.id_emprendedor
LEFT JOIN categorias c ON p.categoria_id = c.id_categoria
LEFT JOIN usuarios u ON e.usuario_id = u.id;

-- Vista de pedidos completos
CREATE OR REPLACE VIEW vista_pedidos_completos AS
SELECT 
    p.*,
    u.nombre AS cliente_nombre,
    u.email AS cliente_email,
    e.nombre_tienda,
    pag.estado AS estado_pago,
    pag.metodo AS metodo_pago
FROM pedidos p
LEFT JOIN usuarios u ON p.usuario_id = u.id
LEFT JOIN emprendedores e ON p.emprendedor_id = e.id_emprendedor
LEFT JOIN pagos pag ON p.id_pedido = pag.pedido_id;

-- =====================================================
-- 20. FUNCIONES DE NEGOCIO
-- =====================================================

-- Función para calcular ganancias de un emprendedor
CREATE OR REPLACE FUNCTION calcular_ganancias_periodo(
    p_emprendedor_id INTEGER,
    p_fecha_inicio DATE,
    p_fecha_fin DATE
)
RETURNS TABLE (
    total_ventas BIGINT,
    total_ingresos NUMERIC,
    total_pedidos BIGINT,
    ticket_promedio NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_ventas,
        COALESCE(SUM(ped.total), 0)::NUMERIC as total_ingresos,
        COUNT(DISTINCT ped.id_pedido)::BIGINT as total_pedidos,
        COALESCE(AVG(ped.total), 0)::NUMERIC as ticket_promedio
    FROM pedidos ped
    WHERE ped.emprendedor_id = p_emprendedor_id
        AND ped.fecha_pedido >= p_fecha_inicio
        AND ped.fecha_pedido <= p_fecha_fin
        AND ped.estado IN ('completado', 'entregado');
END;
$$ LANGUAGE plpgsql;

-- Función para obtener productos más vendidos
CREATE OR REPLACE FUNCTION productos_mas_vendidos(
    p_emprendedor_id INTEGER,
    p_limite INTEGER DEFAULT 10
)
RETURNS TABLE (
    producto_id INTEGER,
    nombre VARCHAR,
    total_vendidos BIGINT,
    ingresos_totales NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id_producto,
        p.nombre,
        SUM(dp.cantidad)::BIGINT as total_vendidos,
        SUM(dp.subtotal)::NUMERIC as ingresos_totales
    FROM productos p
    INNER JOIN detalle_pedido dp ON p.id_producto = dp.producto_id
    INNER JOIN pedidos ped ON dp.pedido_id = ped.id_pedido
    WHERE p.emprendedor_id = p_emprendedor_id
        AND ped.estado IN ('completado', 'entregado')
    GROUP BY p.id_producto, p.nombre
    ORDER BY total_vendidos DESC
    LIMIT p_limite;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================

COMMENT ON TABLE usuarios IS 'Tabla principal de usuarios del sistema';
COMMENT ON TABLE emprendedores IS 'Información de vendedores/emprendedores';
COMMENT ON TABLE productos IS 'Catálogo de productos disponibles';
COMMENT ON TABLE pedidos IS 'Registro de todos los pedidos realizados';
COMMENT ON TABLE conversaciones IS 'Conversaciones con el chatbot/asistente';
COMMENT ON TABLE estadisticas_diarias IS 'Métricas diarias para analytics de vendedores';

-- =====================================================
-- FIN DEL SCHEMA
-- =====================================================

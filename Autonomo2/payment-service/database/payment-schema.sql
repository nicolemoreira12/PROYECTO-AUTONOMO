-- Script SQL para crear las tablas del Payment Service
-- Ejecutar en Supabase SQL Editor si synchronize no crea las tablas automáticamente

-- Crear enum para el estado del pago
DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'canceled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tabla de pagos
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR(255) NOT NULL,
    provider_payment_id VARCHAR(255),
    provider VARCHAR(50) NOT NULL,
    amount INTEGER NOT NULL,
    currency VARCHAR(3) NOT NULL,
    description VARCHAR(500),
    status payment_status DEFAULT 'pending',
    customer_id VARCHAR(255),
    customer_email VARCHAR(255),
    customer_name VARCHAR(255),
    redirect_url VARCHAR(500),
    metadata JSONB,
    error_message VARCHAR(500),
    paid_at TIMESTAMP,
    canceled_at TIMESTAMP,
    refunded_amount INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider_payment_id ON payments(provider_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

-- Tabla de partners (webhooks)
CREATE TABLE IF NOT EXISTS partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    webhook_url VARCHAR(255) NOT NULL,
    hmac_secret VARCHAR(255) NOT NULL,
    subscribed_events TEXT NOT NULL, -- Almacenado como texto separado por comas
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentarios de documentación
COMMENT ON TABLE payments IS 'Registro de todas las transacciones de pago';
COMMENT ON COLUMN payments.provider_payment_id IS 'ID del pago en el proveedor (Stripe, PayPal, etc.)';
COMMENT ON COLUMN payments.amount IS 'Monto en la unidad más pequeña de la moneda (centavos)';
COMMENT ON COLUMN payments.metadata IS 'Datos adicionales en formato JSON';

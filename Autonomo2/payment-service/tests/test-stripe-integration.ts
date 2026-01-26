/**
 * Script de prueba para verificar la integración con Stripe
 * Ejecutar con: npx ts-node tests/test-stripe-integration.ts
 */

import Stripe from 'stripe';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const PAYMENT_SERVICE_URL = 'http://localhost:5000';

async function testStripeConfiguration() {
    console.log('🔍 Verificando configuración de Stripe...\n');

    const secretKey = process.env.STRIPE_SECRET_KEY;
    const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    // Verificar Secret Key
    if (!secretKey || secretKey === 'sk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX') {
        console.log('❌ STRIPE_SECRET_KEY no está configurada correctamente');
        console.log('   Obtén tu clave en: https://dashboard.stripe.com/test/apikeys\n');
        return false;
    }

    if (!secretKey.startsWith('sk_')) {
        console.log('❌ STRIPE_SECRET_KEY no tiene el formato correcto');
        console.log('   Debe empezar con "sk_test_" (test) o "sk_live_" (producción)\n');
        return false;
    }

    console.log('✅ STRIPE_SECRET_KEY configurada correctamente');
    console.log(`   Modo: ${secretKey.startsWith('sk_test_') ? 'TEST' : 'LIVE'}\n`);

    // Verificar Publishable Key
    if (!publishableKey || publishableKey === 'pk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX') {
        console.log('⚠️  STRIPE_PUBLISHABLE_KEY no está configurada');
        console.log('   Esta clave es necesaria para el frontend\n');
    } else {
        console.log('✅ STRIPE_PUBLISHABLE_KEY configurada\n');
    }

    // Verificar Webhook Secret
    if (!webhookSecret || webhookSecret === 'whsec_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX') {
        console.log('⚠️  STRIPE_WEBHOOK_SECRET no está configurada');
        console.log('   Los webhooks no podrán verificarse');
        console.log('   Configúrala en: https://dashboard.stripe.com/test/webhooks\n');
    } else {
        console.log('✅ STRIPE_WEBHOOK_SECRET configurada\n');
    }

    return true;
}

async function testStripeConnection() {
    console.log('🔌 Probando conexión con Stripe API...\n');

    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: '2023-10-16',
        });

        // Intentar obtener la lista de productos (operación simple)
        const balance = await stripe.balance.retrieve();

        console.log('✅ Conexión con Stripe exitosa!');
        console.log(`   Balance disponible: ${balance.available.map(b => `${b.amount / 100} ${b.currency.toUpperCase()}`).join(', ')}\n`);

        return true;
    } catch (error) {
        const stripeError = error as Stripe.errors.StripeError;
        console.log('❌ Error al conectar con Stripe:');
        console.log(`   ${stripeError.message}\n`);
        return false;
    }
}

async function testCreateCheckoutSession() {
    console.log('🛒 Probando creación de Checkout Session...\n');

    try {
        const response = await fetch(`${PAYMENT_SERVICE_URL}/api/payments/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: 1000, // $10.00
                currency: 'usd',
                description: 'Producto de prueba',
                orderId: `test-order-${Date.now()}`,
                customer: {
                    id: 'test-customer-001',
                    name: 'Usuario de Prueba',
                    email: 'test@example.com',
                },
                provider: 'stripe',
            }),
        });

        const result = await response.json();

        if (result.success) {
            console.log('✅ Checkout Session creada exitosamente!');
            console.log(`   Payment ID: ${result.paymentId}`);
            console.log(`   URL de pago: ${result.redirectUrl}\n`);
            return true;
        } else {
            console.log('❌ Error al crear Checkout Session:');
            console.log(`   ${result.message}\n`);
            return false;
        }
    } catch (error) {
        console.log('❌ Error de conexión con el Payment Service:');
        console.log(`   Asegúrate de que el servidor está corriendo en ${PAYMENT_SERVICE_URL}`);
        console.log(`   Ejecuta: npm run dev\n`);
        return false;
    }
}

async function testCreatePaymentIntent() {
    console.log('💳 Probando creación de PaymentIntent...\n');

    try {
        const response = await fetch(`${PAYMENT_SERVICE_URL}/api/payments/create-intent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: 500, // $5.00
                currency: 'usd',
                description: 'PaymentIntent de prueba',
                orderId: `test-pi-${Date.now()}`,
                customer: {
                    id: 'test-customer-001',
                    name: 'Usuario de Prueba',
                    email: 'test@example.com',
                },
            }),
        });

        const result = await response.json();

        if (result.success) {
            console.log('✅ PaymentIntent creado exitosamente!');
            console.log(`   Payment Intent ID: ${result.paymentId}`);
            console.log(`   Client Secret: ${result.clientSecret?.substring(0, 30)}...\n`);
            return true;
        } else {
            console.log('❌ Error al crear PaymentIntent:');
            console.log(`   ${result.message}\n`);
            return false;
        }
    } catch (error) {
        console.log('❌ Error de conexión con el Payment Service\n');
        return false;
    }
}

async function runTests() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('       🧪 PRUEBAS DE INTEGRACIÓN CON STRIPE');
    console.log('═══════════════════════════════════════════════════════\n');

    const configOk = await testStripeConfiguration();

    if (configOk) {
        await testStripeConnection();
    }

    console.log('───────────────────────────────────────────────────────');
    console.log('    Pruebas con el Payment Service');
    console.log('───────────────────────────────────────────────────────\n');

    await testCreateCheckoutSession();
    await testCreatePaymentIntent();

    console.log('═══════════════════════════════════════════════════════');
    console.log('       ✅ Pruebas completadas');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('📋 Próximos pasos:');
    console.log('   1. Configura tus claves de Stripe en el archivo .env');
    console.log('   2. Configura webhooks en Stripe Dashboard');
    console.log('   3. Usa Stripe CLI para probar webhooks localmente:');
    console.log('      stripe listen --forward-to localhost:5000/api/payments/webhooks/stripe\n');
}

runTests().catch(console.error);

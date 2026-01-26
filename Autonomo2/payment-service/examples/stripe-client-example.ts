/**
 * Ejemplo de integración de Stripe en el Frontend
 * Este archivo muestra cómo usar la API del payment-service con Stripe
 */

// ===========================================
// OPCIÓN 1: STRIPE CHECKOUT (Recomendado para empezar)
// ===========================================

interface CreatePaymentData {
    amount: number;      // En centavos (ej: 1000 = $10.00)
    currency: string;    // ej: 'usd', 'eur', 'mxn'
    description: string;
    orderId: string;
    customer: {
        id: string;
        name: string;
        email: string;
    };
    metadata?: Record<string, any>;
}

/**
 * Crea una sesión de Checkout y redirige al usuario a Stripe
 */
export async function createStripeCheckout(paymentData: CreatePaymentData): Promise<void> {
    const PAYMENT_SERVICE_URL = 'http://localhost:5000';

    try {
        const response = await fetch(`${PAYMENT_SERVICE_URL}/api/payments/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...paymentData,
                provider: 'stripe', // Especificar que queremos usar Stripe
            }),
        });

        const result = await response.json();

        if (result.success && result.redirectUrl) {
            // Redirigir al usuario a la página de checkout de Stripe
            window.location.href = result.redirectUrl;
        } else {
            throw new Error(result.message || 'Error al crear el checkout');
        }
    } catch (error) {
        console.error('Error al crear checkout de Stripe:', error);
        throw error;
    }
}

// ===========================================
// OPCIÓN 2: STRIPE ELEMENTS (UI Personalizado)
// Requiere cargar @stripe/stripe-js y @stripe/react-stripe-js
// ===========================================

/**
 * Crea un PaymentIntent para usar con Stripe Elements
 */
export async function createPaymentIntent(paymentData: CreatePaymentData): Promise<{
    clientSecret: string;
    paymentIntentId: string;
}> {
    const PAYMENT_SERVICE_URL = 'http://localhost:5000';

    try {
        const response = await fetch(`${PAYMENT_SERVICE_URL}/api/payments/create-intent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paymentData),
        });

        const result = await response.json();

        if (result.success && result.clientSecret) {
            return {
                clientSecret: result.clientSecret,
                paymentIntentId: result.paymentId,
            };
        } else {
            throw new Error(result.message || 'Error al crear PaymentIntent');
        }
    } catch (error) {
        console.error('Error al crear PaymentIntent:', error);
        throw error;
    }
}

/**
 * Obtiene el estado de un pago
 */
export async function getPaymentStatus(paymentId: string, provider: string = 'stripe'): Promise<{
    status: string;
    amount: number;
    currency: string;
}> {
    const PAYMENT_SERVICE_URL = 'http://localhost:5000';

    try {
        const response = await fetch(
            `${PAYMENT_SERVICE_URL}/api/payments/${paymentId}/status?provider=${provider}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        return await response.json();
    } catch (error) {
        console.error('Error al obtener estado del pago:', error);
        throw error;
    }
}

// ===========================================
// EJEMPLO DE USO EN UN COMPONENTE REACT
// ===========================================

/*
import React, { useState } from 'react';
import { createStripeCheckout } from './stripe-client-example';

function CheckoutButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      await createStripeCheckout({
        amount: 2999, // $29.99
        currency: 'usd',
        description: 'Suscripción Premium',
        orderId: 'order-' + Date.now(),
        customer: {
          id: 'user-123',
          name: 'Juan Pérez',
          email: 'juan@email.com',
        },
        metadata: {
          productId: 'premium-plan',
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg"
      >
        {loading ? 'Procesando...' : 'Pagar $29.99'}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}

export default CheckoutButton;
*/

// ===========================================
// EJEMPLO CON STRIPE ELEMENTS (UI Personalizado)
// ===========================================

/*
// 1. Instalar dependencias:
// npm install @stripe/stripe-js @stripe/react-stripe-js

// 2. Componente de pago:

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { createPaymentIntent } from './stripe-client-example';

// Cargar Stripe con tu Publishable Key
const stripePromise = loadStripe('pk_test_TuPublishableKey');

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: 'http://localhost:3000/payment/success',
      },
    });

    if (error) {
      setMessage(error.message || 'Error al procesar el pago');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button disabled={!stripe || loading}>
        {loading ? 'Procesando...' : 'Pagar'}
      </button>
      {message && <div>{message}</div>}
    </form>
  );
}

function PaymentPage() {
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Crear PaymentIntent al cargar la página
    createPaymentIntent({
      amount: 2999,
      currency: 'usd',
      description: 'Compra de producto',
      orderId: 'order-123',
      customer: {
        id: 'user-123',
        name: 'Usuario',
        email: 'user@email.com',
      },
    }).then((result) => {
      setClientSecret(result.clientSecret);
    });
  }, []);

  if (!clientSecret) {
    return <div>Cargando...</div>;
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm />
    </Elements>
  );
}

export default PaymentPage;
*/

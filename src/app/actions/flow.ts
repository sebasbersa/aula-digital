
'use server';

import { redirect } from 'next/navigation';
import crypto from 'crypto';
import { plans } from '@/lib/data';

// Definimos los tipos para mayor claridad
interface PaymentOrder {
  commerceOrder: string;
  subject: string;
  email: string;
  planName: 'Plan Mensual' | 'Plan Semestral' | 'Plan Anual';
}

interface FlowPaymentResponse {
  token: string;
  url: string;
  flowOrder: number;
}

// Función para firmar los parámetros según los requerimientos de Flow
const signParams = (params: Record<string, any>, secret: string): string => {
  const sortedKeys = Object.keys(params).sort();
  const toSign = sortedKeys.map(key => `${key}${params[key]}`).join('');

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(toSign);

  return hmac.digest('hex');
};

export async function createPaymentOrder(order: PaymentOrder) {
  const apiKey = process.env.FLOW_API_KEY;
  const secretKey = process.env.FLOW_SECRET_KEY;
  const apiUrl = process.env.FLOW_API_URL || 'https://sandbox.flow.cl/api';
  const appUrl = 'https://auladigitalplus.cl';
 

  if (!apiKey || !secretKey) {
    console.error('Flow API Key or Secret Key is not defined in .env');
    throw new Error('Las credenciales del servicio de pago no están configuradas.');
  }

  const selectedPlan = plans.find(p => p.name === order.planName);
  if (!selectedPlan) {
    throw new Error('El plan seleccionado no es válido.');
  }
  // Convert price from "$12.990" to "12990"
  const amount = parseInt(selectedPlan.price.replace(/\$|\./g, ''), 10);

  // 1. Preparar los parámetros para Flow
  const params: Record<string, any> = {
    apiKey,
    commerceOrder: order.commerceOrder,
    subject: order.subject,
    currency: 'CLP',
    amount: amount,
    email: order.email,
    urlConfirmation: `${appUrl}/api/flow/webhook`,
    urlReturn: `${appUrl}/subscription/success`,
    paymentMethod: 9,
  };
  // 2. Firmar los parámetros
  params.s = signParams(params, secretKey);

  // 3. Crear el cuerpo de la solicitud
  const body = new URLSearchParams(params);

  try {
    // 4. Enviar la solicitud a Flow
    const response = await fetch(`${apiUrl}/payment/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    const data = await response.json();
    console.log('data', data);
    if (!response.ok) {
      console.error(`Error from Flow API: ${response.status}`, data);
      throw new Error(data.message || `Flow API returned an error: ${response.statusText}`);
    }

    // 5. Redirigir al usuario a la página de pago de Flow
    const paymentUrl = `${data.url}?token=${data.token}`;
    return paymentUrl;
    
  } catch (error: any) {
    console.error('Failed to create payment order:', error);
    // Lanzamos el error con un mensaje más específico si es posible
    throw new Error(error.message || 'No se pudo iniciar el proceso de pago. Inténtalo de nuevo.');
  }
}

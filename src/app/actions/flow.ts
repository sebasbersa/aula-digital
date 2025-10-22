
'use server';

import { redirect } from 'next/navigation';
import crypto from 'crypto';
import { plans } from '@/lib/data';
import { User } from 'firebase/auth';
import { crearUsuarioFlowRequest, registerCardFlowRequest } from '@/services/flowServices';
import { FlowSuscription, Member } from '@/lib/types';
import { updateMember } from '@/services/members';
import { findMemberByUidAsAdmin, updateMemberAsAdmin } from '@/services/adminMembers';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
// Definimos los tipos para mayor claridad
interface PaymentOrder {
  userUid: string | undefined;
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

export async function createFlowSuscription(member: Member, order: PaymentOrder) {
  const memberProfile = await findMemberByUidAsAdmin(member.ownerId);
  const memberDocId = memberProfile!!.id; // ¡El ID de documento correcto!
  let memberData = memberProfile!!.data;

  if (!memberData.flowSuscription) {
    const crearClienteResponse = await crearUsuarioFlowRequest(memberData.name, memberData.email, memberData.ownerId);
    if (!crearClienteResponse.customerId) {
      console.error('crearClienteResponse', crearClienteResponse);
      throw new Error(crearClienteResponse.message);
    }
    // PASO 2: GUARDAR FLOW DATA EN MEMBER
    const flowData: FlowSuscription = {
      customerId: crearClienteResponse.customerId,
      createdAt: new Date().toISOString(),
      lastPaymentStatus: false,
      planName: order.planName,
      subscriptionId: ''
    }
    memberData.flowSuscription = flowData;
    await updateMemberAsAdmin(memberDocId, memberData);
  }
  // PASO 5: REGISTRAR TARJETA EN FLOW
  const returnUrl = `${APP_URL || "http://192.168.56.1:9002"}/subscription/result`;
  const registerResponse = await registerCardFlowRequest(memberData.flowSuscription!!.customerId, returnUrl);
  if (registerResponse.token) {
    redirect(registerResponse.url + "?token=" + registerResponse.token);
  }


  /// ESTO NOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
  // const apiKey = process.env.FLOW_API_KEY;
  // const secretKey = process.env.FLOW_SECRET_KEY;
  // const apiUrl = process.env.FLOW_API_URL || 'https://sandbox.flow.cl/api';
  // const confirmationUrl = "https://auladigitalplus.cl"
  // const appUrl = "http://192.168.56.1:9002";

  // if (!apiKey || !secretKey || !appUrl) {
  //   throw new Error('Variables de entorno para el servicio de pago no están configuradas.');
  // }

  // const selectedPlan = plans.find(p => p.name === order.planName);
  // if (!selectedPlan) {
  //   throw new Error('El plan seleccionado no es válido.');
  // }
  // const amount = parseInt(selectedPlan.price.replace(/\$|\./g, ''), 10);

  // const params: Record<string, any> = {
  //   apiKey,
  //   commerceOrder: order.commerceOrder,
  //   subject: order.subject,
  //   currency: 'CLP',
  //   amount: amount,
  //   email: order.email,
  //   urlConfirmation: `${confirmationUrl}/api/flow/webhook`,
  //   urlReturn: `${appUrl}/subscription/success`,
  // };
  // params.s = signParams(params, secretKey);
  // const body = new URLSearchParams(params);

  // let flowResponseData;
  // try {
  //   const response = await fetch(`${apiUrl}/payment/create`, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  //     body: body.toString(),
  //   });

  //   const data = await response.json();

  //   if (!response.ok) {
  //     // El error de Flow viene en `data.message`
  //     throw new Error(data.message || `Error del API de Flow: ${response.statusText}`);
  //   }

  //   if (!data.url || !data.token) {
  //       throw new Error('La respuesta del API de Flow es inválida.');
  //   }

  //   flowResponseData = data; // Guardamos la respuesta exitosa

  // } catch (error) {
  //   console.error('Fallo al crear la orden de pago:', error);
  //   if (error instanceof Error) {
  //     // Relanzamos el error para que el cliente lo pueda atrapar en su `catch`
  //     throw error;
  //   }
  //   throw new Error('Ocurrió un error inesperado al conectar con Flow.');
  // }

  // // ¡CRUCIAL! El redirect se ejecuta solo si todo en el try tuvo éxito
  // // y está fuera del bloque try...catch.
  // const paymentUrl = `${flowResponseData.url}?token=${flowResponseData.token}`;
  // redirect(paymentUrl);
}

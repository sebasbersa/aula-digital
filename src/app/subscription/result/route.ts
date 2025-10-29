// app/subscription/success/route.ts

import { findMemberByFlowCustomerId, updateMemberAsAdmin, updateMemberByUidAsAdmin } from '@/services/adminMembers';
import { createFlowSuscription, getRegisterStatus } from '@/services/flowServices';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

async function verificarYActualizarUsuario(tokenDeFlow: string) {
  // ... tu lógica de verificación sigue aquí, sin cambios ...
  console.log(`Verificando el token de Flow: ${tokenDeFlow}`);
  // OBTENER CLIENTE

  // ACTUALIZAR CLIENTE
  // SUSCRIBIR CLIENTE

  try {
  } catch (error) {
    console.error('Error crítico al verificar el pago:', error);
    return {
      success: false,
      message: 'Ocurrió un error en el servidor al procesar tu pago.',
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // --- LA FORMA CORRECTA DE DEPURAR ---
    // Convierte el FormData a un objeto plano para verlo fácilmente
    // const receivedData = Object.fromEntries(formData.entries());
    // console.log("Datos recibidos de Flow:", receivedData);
    const token = formData.get('token') as string;
    if (!token) {
      throw { status: 3, message: `No se recibió el token de Flow en la petición` };
    }

    const registerStatusResponseStr = await getRegisterStatus(token);
    const registeStatusResponse = registerStatusResponseStr;
    if (registeStatusResponse.status != 1) {
      throw { status: 2, message: `El register statos dio error, no dio status 1, sino: ${registeStatusResponse.status}` };

    }
    // exito
    const customerId = registeStatusResponse.customerId;
    const member = await findMemberByFlowCustomerId(customerId);
    if (member == null) {
      throw { status: 4, message: `No se encuentra el usuario` };
    }
    const suscripcionResponse = await createFlowSuscription(member.flowSuscription!!.planName, customerId);
    const subscriptionId = suscripcionResponse.subscriptionId;
    member.flowSuscription!!.subscriptionId = subscriptionId;
    member.subscriptionStatus = "active";
    member.flowSuscription!!.activatedAt = new Date().toISOString(),
    await updateMemberByUidAsAdmin(member.ownerId, member);
    const successUrl = new URL('/subscription/success?status=success', request.url);
    return new NextResponse(null, {
      status: 303,
      headers: { 'Location': successUrl.toString() },
    });

  } catch (error: Exception | any) {
    console.error('Error en el Route Handler de /subscription/error:', error);
    const genericErrorUrl = new URL(`/subscription/error?status=${error}&message=${error.message}`, request.url);
    return new NextResponse(null, {
      status: 303,
      headers: { 'Location': genericErrorUrl.toString() },
    });
  }
}

type Exception = {
  status: number,
  message: string
}
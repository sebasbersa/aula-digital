
'use server';

import { redirect } from 'next/navigation';
import { crearUsuarioFlowRequest, registerCardFlowRequest } from '@/services/flowServices';
import { FlowSuscription, Member } from '@/lib/types';
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
}

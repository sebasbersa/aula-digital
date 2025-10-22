// src/app/api/subscription/success/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // 1. PROCESAR LA SOLICITUD
    // Aquí es donde lees los datos que te envían en el POST.
    // Por ejemplo, si te envían un JSON desde un webhook de pago.
    const body = await req.json();

    console.log("Datos recibidos en el webhook:", body);

    // 2. LÓGICA DE NEGOCIO (¡LO MÁS IMPORTANTE!)
    // Aquí va tu código para actualizar la base de datos.
    // - Encuentra al usuario por su ID (que debería venir en 'body').
    // - Actualiza su estado de suscripción a "activa".
    // - Guarda la información del pago.
    // - Envía un correo de confirmación.

    // Ejemplo (esto es solo una simulación, adáptalo a tu lógica):
    const userId = body.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Falta el ID del usuario' }, { status: 400 });
    }
    // await updateUserSubscription(userId, 'active');


    // 3. DEVOLVER UNA RESPUESTA
    // Siempre debes devolver una respuesta para confirmar que recibiste la solicitud.
    // Un status 200 significa "OK, todo salió bien".
    return NextResponse.json({ message: 'Suscripción activada correctamente' }, { status: 200 });

  } catch (err: any) {
    // Si algo sale mal, registra el error y devuelve un error 500.
    console.error("❌ Error en el webhook de suscripción:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
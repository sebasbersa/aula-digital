import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';

// --- PASO 1: Lógica del Servidor ---
// Esta función debe comunicarse con la API de Flow para verificar el pago
// y luego actualizar tu base de datos.
// Es mejor si mueves esta lógica a un archivo separado, ej: `lib/flow.ts`
async function verificarYActualizarPago(tokenDeFlow: string) {
  // ¡IMPORTANTE! Esta es una implementación de EJEMPLO.
  // Debes adaptarla con la lógica real de tu aplicación.
  try {
    // 1. Llama a la API de Flow para verificar el estado del pago usando el token.
    // const respuestaFlow = await fetch(`https://api.flow.cl/v1/payment/getStatus?token=${tokenDeFlow}`, {
    //   headers: { 'Authorization': `Basic ${btoa(process.env.FLOW_API_KEY + ':')}` }
    // });
    // const datosPago = await respuestaFlow.json();

    // Simulación de una respuesta exitosa de Flow
    const datosPago = { status: 2 }; // 2 usualmente significa "pagado" en Flow

    if (datosPago.status !== 2) { // Si el pago no fue exitoso
      console.error("El pago en Flow no fue exitoso. Estado:", datosPago.status);
      return { success: false, message: 'El pago no pudo ser verificado.' };
    }

    // 2. Si el pago es exitoso, actualiza tu base de datos.
    //    Encuentra la orden/suscripción por el token y márcala como pagada.
    //    await prisma.suscripcion.update({
    //      where: { tokenPago: tokenDeFlow },
    //      data: { estado: 'ACTIVA' },
    //    });

    console.log("Pago verificado y suscripción activada para el token:", tokenDeFlow);
    return { success: true };

  } catch (error) {
    console.error("Error crítico al verificar el pago con Flow:", error);
    return { success: false, message: 'Ocurrió un error en el servidor al procesar tu pago.' };
  }
}


// --- PASO 2: Convierte tu Componente en un Server Component Asíncrono ---
// Agregamos `async` y recibimos `searchParams` como prop.
export default async function SubscriptionSuccessPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Obtenemos el token que Flow nos envía en la URL.
  // La URL será algo como: /subscription/success?token=ABC123XYZ
  const token = searchParams.token as string;

  // Si no hay token, mostramos un error.
  if (!token) {
    return <ErrorComponent message="Falta el token de confirmación." />;
  }

  // Llamamos a nuestra función de servidor para hacer la magia.
  const resultado = await verificarYActualizarPago(token);

  // Si la verificación falla, mostramos un mensaje de error.
  if (!resultado.success) {
    return <ErrorComponent message={resultado.message || 'No se pudo completar el proceso.'} />;
  }
  
  // --- PASO 3: Si todo sale bien, mostramos tu componente de éxito ---
  // Este es el mismo código que ya tenías.
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-secondary/30">
      <div className="w-full max-w-lg">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold font-headline">
              ¡Pago Recibido!
            </CardTitle>
            <CardDescription className="pt-2">
              Gracias por activar tu plan. Tu suscripción se está procesando y estará activa en unos momentos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" size="lg">
              <Link href="/select-profile">Ir a mis perfiles</Link>
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-4">
              Recibirás una confirmación por correo electrónico en breve.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Un componente simple para mostrar errores de forma consistente.
function ErrorComponent({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-secondary/30">
      <div className="w-full max-w-lg">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto bg-red-100 p-3 rounded-full w-fit mb-4">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
            <CardTitle className="text-3xl font-bold font-headline">
              Ocurrió un Problema
            </CardTitle>
            <CardDescription className="pt-2">{message}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" size="lg" variant="outline">
              <Link href="/">Volver al Inicio</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
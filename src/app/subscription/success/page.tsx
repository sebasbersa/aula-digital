// app/subscription/result/page.tsx
"use-client";
import Link from "next/link";

// Este es un Server Component que muestra un mensaje basado en los parámetros de la URL
export default async function SubscriptionResultPage({
  searchParams,
}: {
  searchParams: { status?: string; message?: string };
}) {
  const { status, message } = await searchParams; // ✅ extraer status
  if (status === "success") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-secondary/30">
        <div className="text-center p-8 bg-background rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-green-500 mb-4">
            ¡Pago Exitoso!
          </h1>
          <p>
            Gracias por activar tu plan. Tu suscripción ha sido procesada y ya
            está activa.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-block bg-primary text-primary-foreground px-6 py-2 rounded"
          >
            Ir a mi cuenta
          </Link>
        </div>
      </div>
    );
  }

  // Para cualquier otro caso, mostramos un error.
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-secondary/30">
      <div className="text-center p-8 bg-background rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-red-500 mb-4">
          Ocurrió un Problema
        </h1>
        <p>
          No pudimos procesar tu pago en este momento. Por favor, intenta de
          nuevo o contacta a soporte.
        </p>
        <Link
          href="/owner/subscription"
          className="mt-6 inline-block bg-primary text-primary-foreground px-6 py-2 rounded"
        >
          Ver planes
        </Link>
      </div>
    </div>
  );
}

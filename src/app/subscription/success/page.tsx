
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function SubscriptionSuccessPage() {
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

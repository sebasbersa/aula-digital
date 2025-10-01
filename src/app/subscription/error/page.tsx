
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function SubscriptionErrorPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-secondary/30">
      <div className="w-full max-w-lg">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto bg-red-100 p-3 rounded-full w-fit mb-4">
              <AlertTriangle className="h-12 w-12 text-red-600" />
            </div>
            <CardTitle className="text-3xl font-bold font-headline">
              Hubo un Problema con el Pago
            </CardTitle>
            <CardDescription className="pt-2">
              No se pudo procesar tu pago. Por favor, verifica tus datos e inténtalo de nuevo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" size="lg">
              <Link href="/owner/subscription">Volver a Intentar</Link>
            </Button>
             <p className="text-xs text-center text-muted-foreground mt-4">
              Si el problema persiste, contacta a tu banco o a nuestro soporte.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLogo } from '@/components/icons';
import { CheckCircle } from 'lucide-react';

export default function VerifiedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-secondary/30">
      <div className="w-full max-w-md">
        <Card className="p-6">
          <Link href="/" className="flex justify-center mb-6 w-32 mx-auto">
              <AppLogo />
          </Link>
          <CardHeader className="text-center p-0">
            <div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold font-headline">
              ¡Correo Verificado!
            </CardTitle>
            <CardDescription className="pt-2">
              Gracias por confirmar tu cuenta. Tu registro ha sido completado exitosamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Button asChild className="w-full" size="lg">
              <Link href="/login">Ir a Iniciar Sesión</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

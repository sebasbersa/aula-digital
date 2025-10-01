
import { SignupForm } from '../../components/auth/signup-form';
import { AppLogo } from '../../components/icons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
      <div className="w-full max-w-md">
        <Card className="shadow-lg bg-[#F0F7FF] p-6">
           <Link href="/" className="flex justify-center mb-6 w-32 mx-auto">
              <AppLogo />
          </Link>
           <CardHeader className="text-center p-0">
            <CardTitle className="text-3xl font-bold font-headline">
              Empieza hoy con Aula Digital Plus
            </CardTitle>
            <CardDescription className="pt-2">
              Tu profe digital en casa. Acceso ilimitado, 5 días gratis, sin compromiso.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <SignupForm />
            <p className="text-center text-sm text-muted-foreground mt-6">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Inicia sesión aquí
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

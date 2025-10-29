
'use client';

import { LoginForm } from '../../components/auth/login-form';
import { AppLogo } from '../../components/icons';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Loader } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';


export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  console.log('pasa por aqui')
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('user', user)
        // User is already authenticated, redirect to profile selection.
        router.replace('/select-profile');
      } else {
        // No user, show the login page.
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
      <div className="w-full max-w-md">
        <Card className="shadow-lg bg-[#F0F7FF] p-6">
           <Link href="/" className="flex justify-center mb-6 w-32 mx-auto">
              <AppLogo />
          </Link>
           <CardHeader className="text-center p-0">
            <CardTitle className="text-3xl font-bold font-headline">
              Inicia Sesión en Aula Digital Plus
            </CardTitle>
            <CardDescription className="pt-2">
              El reforzamiento educativo inteligente.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <LoginForm />
            <p className="text-center text-sm text-muted-foreground mt-6">
              ¿No tienes una cuenta?{' '}
              <Link href="/signup" className="text-primary hover:underline">
                Regístrate aquí
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

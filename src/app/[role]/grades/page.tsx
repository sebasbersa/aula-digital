
import { GradesClient } from '@/components/grades-client';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function GradesPage() {
  return (
    <div className="py-8">
      <div className="mb-4 px-4 md:px-6 lg:px-8">
        <Button asChild variant="outline" className="mb-4">
            <Link href="/student/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Panel
            </Link>
        </Button>
        <h1 className="text-4xl font-bold font-headline">Mis Notas</h1>
        <p className="text-muted-foreground mt-2">
          Registra tus calificaciones para llevar un control de tu promedio en cada materia.
        </p>
      </div>
      <GradesClient />
    </div>
  );
}

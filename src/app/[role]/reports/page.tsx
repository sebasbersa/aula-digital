import { WeeklyReportsClient } from '@/components/weekly-reports-client';

export default function ReportsPage() {
  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline">Reportes de Progreso Semanales</h1>
        <p className="text-muted-foreground mt-2">
          Obtén un resumen del rendimiento y recomendaciones personalizadas por IA.
        </p>
      </div>
      <WeeklyReportsClient />
    </div>
  );
}

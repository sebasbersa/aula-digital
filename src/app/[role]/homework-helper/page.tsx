import { HomeworkHelperClient } from '@/components/homework-helper-client';

export default function HomeworkHelperPage() {
  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline">Ayudante de Tareas con LIA</h1>
        <p className="text-muted-foreground mt-2">
          ¿No entiendes un problema? Sube una foto y deja que LIA te guíe paso a paso.
        </p>
      </div>
      <HomeworkHelperClient />
    </div>
  );
}

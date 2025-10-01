
'use client';

import { PracticeGuidesClient } from '@/components/practice-guides-client';
import { useParams } from 'next/navigation';
import type { Role } from '@/lib/types';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function PracticeGuidesPageSkeleton() {
    return (
        <div className="space-y-8">
            <div className="text-center space-y-2">
                <Skeleton className="h-10 w-3/4 mx-auto" />
                <Skeleton className="h-5 w-1/2 mx-auto" />
            </div>
            <div className="space-y-6">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
    )
}

export default function PracticeGuidesPage() {
  const params = useParams();
  const role = params.role as Role;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-headline">Ensayos de Práctica con LIA</h1>
        <p className="text-muted-foreground mt-2">
          Pide a LIA que genere un ensayo sobre una lección estudiada para prepararte.
        </p>
      </div>
       <Suspense fallback={<PracticeGuidesPageSkeleton />}>
            <PracticeGuidesClient role={role} />
        </Suspense>
    </div>
  );
}

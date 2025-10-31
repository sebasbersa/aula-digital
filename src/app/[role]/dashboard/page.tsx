
'use client';

import type { Role, User } from '@/lib/types';
import { StudentDashboard } from '@/components/dashboard/student-dashboard';
import { AdultDashboard } from '@/components/dashboard/adult-dashboard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'next/navigation';
import { getSessionStorageMember } from '@/services/sessionUtils';

function PlaceholderDashboard({ role }: { role: string }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Panel de {role}</CardTitle>
                <p>Este panel está en construcción.</p>
            </CardHeader>
        </Card>
    )
}

function DashboardSkeleton() {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
            </div>
            <div className="grid md:grid-cols-3 gap-6">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
             <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                 <Skeleton className="h-40 w-full" />
                 <Skeleton className="h-40 w-full" />
                 <Skeleton className="h-40 w-full" />
            </div>
        </div>
    )
}


export default function DashboardPage() {
  const params = useParams();
  const role = params.role as Role;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We get the selected profile from sessionStorage
    const profileMember = getSessionStorageMember();
    if (!!profileMember) {
        setUser({
            name: profileMember.name || 'Usuario',
            avatarUrl: profileMember.avatarUrl || `https://placehold.co/100x100.png`,
            role: role,
        });
    }
    setLoading(false);
  }, [role]);

  if (loading || !user) {
    return <DashboardSkeleton />;
  }

  const renderDashboard = () => {
    switch (role) {
      case 'student':
        return <StudentDashboard userName={user.name} />;
      case 'adult_learner':
        return <AdultDashboard userName={user.name} />;
      case 'owner':
        return <PlaceholderDashboard role="Propietario" />;
      case 'content_admin':
        return <PlaceholderDashboard role="Administrador de Contenido" />;
      default:
        // Defaulting to a placeholder for any other role, including 'guardian'.
        return <PlaceholderDashboard role="Usuario" />;
    }
  };

  return <>{renderDashboard()}</>;
}

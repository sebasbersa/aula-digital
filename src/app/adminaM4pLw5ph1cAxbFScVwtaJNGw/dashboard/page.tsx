'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { logoutAdmin } from '@/app/actions/admin-auth';
import { getOwnerProfiles } from '@/app/actions/admin-users';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { Member, SubscriptionStatus } from '@/lib/types'; // Ruta confirmada
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { RefreshCw, Loader } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type StatusFilter = 'all' | 'active' | 'inactive';

// Mapeo de estados para mostrar en español en el dashboard
const statusText: Record<SubscriptionStatus, string> = {
    active: 'Activa',
    trial: 'Prueba',
    inactive: 'Inactiva',
    past_due: 'Pago Pendiente',
    canceled: 'Cancelada',
};

function UserTableSkeleton() {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Correo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Plan</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

export default function AdminDashboardPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [allProfiles, setAllProfiles] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [filter, setFilter] = useState<StatusFilter>('all');

    const loadUsers = useCallback(async () => {
        try {
            // Este es el único punto que depende de tu backend:
            // Asegúrate de que `getOwnerProfiles` traiga los datos de suscripción.
            const users = await getOwnerProfiles(); 
            setAllProfiles(users);
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'No se pudieron cargar los usuarios.', variant: 'destructive' });
        }
    }, [toast]);
    
    useEffect(() => {
        const initialLoad = async () => {
            setLoading(true);
            await loadUsers();
            setLoading(false);
        }
        initialLoad();
    }, [loadUsers]);

    const filteredProfiles = useMemo(() => {
        if (filter === 'all') return allProfiles;
        if (filter === 'active') return allProfiles.filter(p => p.subscriptionStatus === 'active' || p.subscriptionStatus === 'trial');
        return allProfiles.filter(p => p.subscriptionStatus !== 'active' && p.subscriptionStatus !== 'trial');
    }, [allProfiles, filter]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await loadUsers();
        toast({ title: 'Lista actualizada' });
        setIsRefreshing(false);
    };

    const handleLogout = async () => {
        await logoutAdmin();
        toast({ title: 'Sesión cerrada' });
        router.push('/adminaM4pLw5ph1cAxbFScVwtaJNGw');
    };
    
    const getSubscriptionEndDate = (user: Member) => {
        const date = user.trialEndsAt;
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold font-headline">Panel de Control</h1>
                <Button onClick={handleLogout} variant="outline">Cerrar Sesión</Button>
            </div>
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Cuentas Registradas</CardTitle>
                            <CardDescription>Filtra para ver los usuarios con suscripciones activas o inactivas.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>Todos</Button>
                            <Button variant={filter === 'active' ? 'default' : 'outline'} onClick={() => setFilter('active')}>Activos</Button>
                            <Button variant={filter === 'inactive' ? 'default' : 'outline'} onClick={() => setFilter('inactive')}>Inactivos</Button>
                            <Button onClick={handleRefresh} variant="outline" size="icon" disabled={isRefreshing || loading} className="ml-4">
                                {isRefreshing ? <Loader className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? <UserTableSkeleton /> : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Usuario</TableHead>
                                    <TableHead>Correo</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Plan</TableHead>
                                    <TableHead className="text-right">Vencimiento</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProfiles.length > 0 ? filteredProfiles.map(user => (
                                    <TableRow key={user.uid}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name ?? ''} />
                                                    <AvatarFallback>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{user.name} {user.lastName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trial' ? 'default' : 'destructive'}>
                                                {user.subscriptionStatus ? statusText[user.subscriptionStatus] : 'N/A'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{user.flowSuscription?.planName || 'N/A'}</TableCell>
                                        <TableCell className="text-right">{getSubscriptionEndDate(user)}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">No se encontraron usuarios para este filtro.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
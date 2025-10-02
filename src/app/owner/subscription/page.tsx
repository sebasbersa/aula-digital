
'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Lightbulb, Info, CreditCard, Star, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { plans } from '@/lib/data';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Plan, Member, SubscriptionStatus } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { createPaymentOrder } from '@/app/actions/flow';
import { useToast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';
import { useFamily } from '@/contexts/family-context';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';


const statusDisplay: Record<SubscriptionStatus, { text: string, color: string }> = {
    active: { text: 'Activa', color: 'text-green-600' },
    trial: { text: 'En Período de Prueba', color: 'text-blue-600' },
    inactive: { text: 'Inactiva', color: 'text-gray-600' },
    past_due: { text: 'Pago Pendiente', color: 'text-red-600' },
    canceled: { text: 'Cancelada', color: 'text-yellow-600' },
};


export default function SubscriptionPage() {
    const { members, loading: familyLoading } = useFamily();
    const [ownerProfile, setOwnerProfile] = useState<Member | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(plans.find(p => p.isRecommended) || null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (members && members.length > 0) {
            const owner = members.find(m => m.isOwnerProfile);
            setOwnerProfile(owner || null);
        }
    }, [members]);

    const handlePlanChange = (planName: string) => {
        const plan = plans.find(p => p.name === planName);
        setSelectedPlan(plan || null);
    };

    //   const handleFormAction = async (formData: FormData) => {
    //     if (!ownerProfile || !selectedPlan || !ownerProfile.email) {
    //         toast({ title: 'Error', description: 'Selecciona un plan y asegúrate de que tu perfil de propietario esté completo.', variant: 'destructive' });
    //         return;
    //     }

    //     setIsSubmitting(true);

    //     const commerceOrder = `ADP-${uuidv4()}`;

    //     try {
    //     console.log("creando payment order");
    //     await createPaymentOrder({
    //             commerceOrder,
    //             subject: `Suscripción ${selectedPlan.name} - Aula Digital Plus`,
    //             email: ownerProfile.email,
    //             planName: selectedPlan.name as any,
    //         });
    //     } catch (error: any) {
    //     console.log("este es un error");
    //     console.error(error);
    //     toast({
    //             title: 'Error al iniciar el pago',
    //             description: error.message || 'No se pudo conectar con el servicio de pago. Inténtalo de nuevo.',
    //             variant: 'destructive',
    //         });
    //         setIsSubmitting(false);
    //     }
    //   };
    const formAction = async (formData: FormData) => {
        // La validación se queda aquí.
        if (!ownerProfile || !selectedPlan || !ownerProfile.email) {
            toast({ title: 'Error', description: 'Selecciona un plan...', variant: 'destructive' });
            return;
        }

        const commerceOrder = `ADP-${uuidv4()}`;

        // Crea el objeto de datos que la Server Action necesita.
        const orderData = {
            commerceOrder,
            subject: `Suscripción ${selectedPlan.name} - Aula Digital Plus`,
            email: ownerProfile.email,
            planName: selectedPlan.name as any,
        };

        try {
            // Llama a la Server Action directamente.
            // Next.js se encargará de la redirección o de capturar el error.
            await createPaymentOrder(orderData);
        } catch (error: any) {
            // Si `createPaymentOrder` lanza un error, el `catch` lo atrapará aquí.
            console.error("Error devuelto por la Server Action:", error);
            toast({
                title: 'Error al iniciar el pago',
                description: error.message || 'No se pudo conectar con el servicio de pago.',
                variant: 'destructive',
            });
        }
    };

    if (familyLoading) {
        return <Skeleton className="h-96 w-full" />;
    }

    const subscriptionStatus = ownerProfile?.subscriptionStatus;
    const isSubscriptionActive = subscriptionStatus === 'active' || subscriptionStatus === 'trial';

    return (
        <div className="container mx-auto py-8">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold font-headline">Gestiona tu Suscripción</h1>
                <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                    {isSubscriptionActive
                        ? 'Revisa el estado de tu plan actual.'
                        : 'Activa tu plan para disfrutar de todos los beneficios de Aula Digital Plus.'
                    }
                </p>
            </div>

            {isSubscriptionActive && ownerProfile ? (
                <Card className="max-w-3xl mx-auto border-green-200 bg-green-50/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                            Tu Plan Familiar está Activo
                        </CardTitle>
                        <CardDescription>
                            Gracias por ser parte de Aula Digital Plus.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="p-3 bg-background rounded-md border">
                                <p className="font-semibold">Plan Actual</p>
                                <p className="text-muted-foreground">{ownerProfile.subscriptionPlan || 'No especificado'}</p>
                            </div>
                            <div className="p-3 bg-background rounded-md border">
                                <p className="font-semibold">Estado</p>
                                <p className={cn("font-bold", statusDisplay[ownerProfile.subscriptionStatus!].color)}>
                                    {statusDisplay[ownerProfile.subscriptionStatus!].text}
                                </p>
                            </div>
                            <div className="p-3 bg-background rounded-md border">
                                <p className="font-semibold">
                                    {ownerProfile.subscriptionStatus === 'trial' ? 'El período de prueba termina el' : 'Próximo pago el'}
                                </p>
                                <p className="text-muted-foreground">
                                    {ownerProfile.trialEndsAt
                                        ? format(ownerProfile.trialEndsAt, "d 'de' MMMM, yyyy", { locale: es })
                                        : ownerProfile.subscriptionPeriodEndsAt
                                            ? format(ownerProfile.subscriptionPeriodEndsAt, "d 'de' MMMM, yyyy", { locale: es })
                                            : 'No especificado'
                                    }
                                </p>
                            </div>
                            <div className="p-3 bg-background rounded-md border">
                                <p className="font-semibold">Miembros de la cuenta</p>
                                <p className="text-muted-foreground">{members.length} de 5 perfiles creados</p>
                            </div>
                        </div>
                        {ownerProfile.subscriptionStatus === 'trial' && (
                            <Alert>
                                <Star className="h-4 w-4" />
                                <AlertTitle>¡Estás en tu prueba gratuita!</AlertTitle>
                                <AlertDescription>
                                    Disfruta de acceso completo. No se realizarán cobros hasta que termine el período de prueba.
                                </AlertDescription>
                            </Alert>
                        )}
                        {ownerProfile.subscriptionStatus === 'past_due' && (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Problema con el Pago</AlertTitle>
                                <AlertDescription>
                                    Hubo un problema al procesar tu último pago. Por favor, actualiza tu método de pago para no perder el acceso.
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" disabled>Gestionar Suscripción (próximamente)</Button>
                    </CardFooter>
                </Card>
            ) : (
                <Card className="max-w-3xl mx-auto">
                    <form action={formAction}>
                        <CardHeader>
                            <CardTitle>Activa tu Plan Familiar</CardTitle>
                            <CardDescription>
                                Aún no tienes un plan activo. Elige una opción para empezar.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <label htmlFor="plan-select" className="text-sm font-medium text-muted-foreground">
                                    Selecciona un plan
                                </label>
                                <Select onValueChange={handlePlanChange} defaultValue={selectedPlan?.name}>
                                    <SelectTrigger id="plan-select" className="mt-1">
                                        <SelectValue placeholder="Elige el plan que prefieras" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {plans.map((plan) => (
                                            <SelectItem key={plan.name} value={plan.name}>
                                                {plan.name} {plan.discount && `(${plan.discount})`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedPlan && (
                                <div className="p-4 border rounded-lg bg-secondary/50 space-y-4">
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="text-xl font-semibold font-headline">{selectedPlan.name}</h3>
                                        <div>
                                            <span className="text-3xl font-bold">{selectedPlan.equivalentPrice || selectedPlan.price}</span>
                                            <span className="text-muted-foreground">/mes</span>
                                        </div>
                                    </div>
                                    {selectedPlan.equivalentPrice && <p className="text-sm text-muted-foreground text-right -mt-2">Se cobra {selectedPlan.price} {selectedPlan.period}</p>}

                                    <Separator />

                                    <ul className="space-y-3 pt-2">
                                        {selectedPlan.features.map((feature, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <CheckCircle className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                        {selectedPlan.savings && (
                                            <li className="flex items-start gap-3 text-sm text-green-700 font-semibold">
                                                <Lightbulb className="w-5 h-5 shrink-0 text-yellow-400" />
                                                <span>{selectedPlan.savings}</span>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full" size="lg" disabled={!selectedPlan || isSubmitting || !ownerProfile}>
                                {isSubmitting ? (
                                    <>
                                        <Loader className="mr-2 h-5 w-5 animate-spin" />
                                        Redirigiendo a Flow...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="mr-2 h-5 w-5" />
                                        Activar {selectedPlan?.name} con Prueba Gratis
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            )}

            <Card className="mt-8 max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle>Detalles de Facturación</CardTitle>
                    <CardDescription>
                        La información de tu método de pago y tu historial de facturas aparecerán aquí una vez actives un plan.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">La gestión de pagos aún no está implementada.</p>
                </CardContent>
            </Card>
        </div>
    );
}

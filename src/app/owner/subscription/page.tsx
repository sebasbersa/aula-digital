"use client";

import { useState, useEffect, use } from "react";
import {
  CheckCircle,
  Lightbulb,
  Info,
  CreditCard,
  Star,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { plans } from "@/lib/data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Plan, Member, SubscriptionStatus } from "@/lib/types";
import { Separator } from "@/components/ui/separator";
import { createFlowSuscription } from "@/app/actions/flow";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";
import { useFamily } from "@/contexts/family-context";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/router";

const statusDisplay: Record<
  SubscriptionStatus,
  { text: string; color: string }
> = {
  active: { text: "Activa", color: "text-green-600" },
  trial: { text: "En Período de Prueba", color: "text-blue-600" },
  inactive: { text: "Inactiva", color: "text-gray-600" },
  past_due: { text: "Pago Pendiente", color: "text-red-600" },
  canceled: { text: "Cancelada", color: "text-yellow-600" },
};

export default function SubscriptionPage() {
  const { members, loading: familyLoading } = useFamily();
  const [ownerProfile, setOwnerProfile] = useState<Member | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(
    plans.find((p) => p.isRecommended) || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const { toast } = useToast();
  const [subscriptionStatus, setSubscriptionStatus] = useState("");
  const [isSubscriptionActive, setIsSubscriptionActive] = useState(false);
  const [subscribedPlan, setSubscribedPlan] = useState<Plan | null>(null);

  useEffect(() => {
    if (members && members.length > 0) {
      const owner = members.find((m) => m.isOwnerProfile);
      setOwnerProfile(owner || null);
    }
  }, [members]);

  const handlePlanChange = (planName: string) => {
    const plan = plans.find((p) => p.name === planName);
    setSelectedPlan(plan || null);
  };

  const formAction = async (formData: FormData) => {
    // La validación se queda aquí.
    if (!ownerProfile || !selectedPlan || !ownerProfile.email) {
      toast({
        title: "Error",
        description: "Selecciona un plan...",
        variant: "destructive",
      });
      return;
    }

    // Crea el objeto de datos que la Server Action necesita.
    const orderData = {
      userUid: authUser?.uid,
      subject: `Suscripción ${selectedPlan.name} - Aula Digital Plus`,
      email: ownerProfile.email,
      planName: selectedPlan.name as any,
    };

    try {
      // Llama a la Server Action directamente.
      // Next.js se encargará de la redirección o de capturar el error.
      createFlowSuscription(ownerProfile, orderData);
    } catch (error: any) {
      // Si `createPaymentOrder` lanza un error, el `catch` lo atrapará aquí.
      console.error("Error devuelto por la Server Action:", error);
      toast({
        title: "Error al iniciar el pago",
        description:
          error.message || "No se pudo conectar con el servicio de pago.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    console.log(ownerProfile);
    setSubscriptionStatus(ownerProfile?.subscriptionStatus || "");
    if (ownerProfile?.subscriptionStatus === "active") {
      setIsSubscriptionActive(true);
      const activePlan = plans.find(
        (x) => x.name === ownerProfile.flowSuscription!!.planName
      );
      setSubscribedPlan(activePlan || null);
      return;
    }
    if (ownerProfile?.subscriptionStatus === "trial") {
      const actualDate = new Date();
      const maxDays = 1;
      if (
        (actualDate - ownerProfile!!.trialEndsAt) / (24 * 60 * 60 * 1000) <=
        maxDays
      ) {
        setIsSubscriptionActive(true);
      }
    }

    // const isSubscriptionActive =
    //   subscriptionStatus === "active" || subscriptionStatus === "trial";
  }, [ownerProfile]);

  const getNextPaymentDate = () => {
    // 1. Validar que los datos necesarios existen y son correctos.
    // El '!!' asegura que no es nulo o undefined, pero si la estructura no existe, esto fallará.
    // Es más seguro usar encadenamiento opcional `?.` como tenías antes. Lo mantendré para evitar errores.
    const activationDateString = ownerProfile?.flowSuscription?.activatedAt;

    if (!activationDateString) {
      console.error("Error: No se encontró la fecha de activación.");
      return null; // Devolvemos null si no hay fecha
    }

    const activatedAt = new Date(activationDateString);

    // Comprobar si la fecha es válida
    if (isNaN(activatedAt.getTime())) {
      console.error("Error: La fecha de activación no es válida.");
      return null;
    }

    const hoy = new Date();
    // Para una comparación justa, ponemos la hora de "hoy" al inicio del día.
    hoy.setHours(0, 0, 0, 0);

    // 2. Determinar el intervalo de meses a sumar según el plan
    let mesesASumar;
    if (subscribedPlan === "mensual") {
      mesesASumar = 1;
    } else if (subscribedPlan === "anual") {
      mesesASumar = 12;
    } else {
      // Asumimos que el caso restante es "semestral"
      mesesASumar = 6;
    }

    // Si subscribedPlan no es ninguno de los esperados, mesesASumar será undefined.
    if (typeof mesesASumar === "undefined") {
      console.error(
        `Error: El tipo de plan "${subscribedPlan}" no es reconocido.`
      );
      return null;
    }

    // 3. Calcular la próxima fecha de pago
    // Creamos una copia de la fecha de activación para no modificar la original.
    let proximaFechaDePago = new Date(activatedAt);

    // Mientras la fecha de pago calculada sea en el pasado o hoy,
    // le seguimos sumando el intervalo del plan hasta encontrar la próxima fecha futura.
    while (proximaFechaDePago <= hoy) {
      proximaFechaDePago.setMonth(proximaFechaDePago.getMonth() + mesesASumar);
    }

    // 4. Devolver el resultado
    return proximaFechaDePago;
  };

  if (familyLoading) {
    return <Skeleton className="h-96 w-full" />;
  }
  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline">
          Gestiona tu Suscripción
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          {isSubscriptionActive
            ? "Revisa el estado de tu plan actual."
            : "Activa tu plan para disfrutar de todos los beneficios de Aula Digital Plus."}
        </p>
        {!isSubscriptionActive && (
          <div className="bg-red-700 mt-2 text-white px-6 py-4 rounded-md text-center font-semibold inline-block">
            Tu cuenta ha sido suspendida - Activa tu plan
          </div>
        )}
      </div>

      {isSubscriptionActive && ownerProfile?.subscriptionStatus !== "trial" ? (
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
                <p className="text-muted-foreground">
                  {ownerProfile.flowSuscription?.planName || "No especificado"}
                </p>
              </div>
              <div className="p-3 bg-background rounded-md border">
                <p className="font-semibold">Estado</p>
                <p
                  className={cn(
                    "font-bold",
                    statusDisplay[ownerProfile.subscriptionStatus!].color
                  )}
                >
                  {statusDisplay[ownerProfile.subscriptionStatus!].text}
                </p>
              </div>
              <div className="p-3 bg-background rounded-md border">
                <p className="font-semibold">
                  {ownerProfile.subscriptionStatus === "trial"
                    ? "El período de prueba termina el"
                    : "Próximo pago el"}
                </p>
                <p className="text-muted-foreground">
                  {ownerProfile.subscriptionStatus === "trial"
                    ? format(ownerProfile.trialEndsAt, "d 'de' MMMM, yyyy", {
                        locale: es,
                      })
                    : getNextPaymentDate()}
                </p>
              </div>
              <div className="p-3 bg-background rounded-md border">
                <p className="font-semibold">Miembros de la cuenta</p>
                <p className="text-muted-foreground">
                  {members.length} de 5 perfiles creados
                </p>
              </div>
            </div>
            {ownerProfile.subscriptionStatus === "trial" && (
              <Alert>
                <Star className="h-4 w-4" />
                <AlertTitle>¡Estás en tu prueba gratuita!</AlertTitle>
                <AlertDescription>
                  Disfruta de acceso completo. No se realizarán cobros hasta que
                  termine el período de prueba.
                </AlertDescription>
              </Alert>
            )}
            {ownerProfile.subscriptionStatus === "past_due" && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Problema con el Pago</AlertTitle>
                <AlertDescription>
                  Hubo un problema al procesar tu último pago. Por favor,
                  actualiza tu método de pago para no perder el acceso.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" disabled>
              Gestionar Suscripción (próximamente)
            </Button>
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
                <label
                  htmlFor="plan-select"
                  className="text-sm font-medium text-muted-foreground"
                >
                  Selecciona un plan
                </label>
                <Select
                  onValueChange={handlePlanChange}
                  defaultValue={selectedPlan?.name}
                >
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
                    <h3 className="text-xl font-semibold font-headline">
                      {selectedPlan.name}
                    </h3>
                    <div>
                      <span className="text-3xl font-bold">
                        {selectedPlan.price}
                      </span>
                      <span className="text-muted-foreground">/mes</span>
                    </div>
                  </div>
                  {selectedPlan.equivalentPrice && (
                    <p className="text-sm text-muted-foreground text-right -mt-2">
                      Se cobra {selectedPlan.equivalentPrice}
                    </p>
                  )}

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
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={!selectedPlan || isSubmitting || !ownerProfile}
              >
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
            La información de tu método de pago y tu historial de facturas
            aparecerán aquí una vez actives un plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            La gestión de pagos aún no está implementada.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

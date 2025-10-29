"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MailCheck } from "lucide-react";
import { addMember } from "@/services/members";
import { generateAvatarUrl } from "@/lib/data";

const formSchema = z
  .object({
    firstName: z
      .string()
      .min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
    lastName: z
      .string()
      .min(2, { message: "El apellido debe tener al menos 2 caracteres." }),
    email: z
      .string()
      .email({ message: "Por favor, introduce un correo válido." }),
    password: z
      .string()
      .min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

function SignupFormContent() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  function validarPassword(password: string) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
    return regex.test(password);
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      if (!validarPassword(values.password)) {
      toast({
        title: "Error",
        description:
          "Ingrese una contraseña válida.",
        variant: "destructive",
      });
      return;
    }
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: `${values.firstName} ${values.lastName}`,
      });

      await sendEmailVerification(user);

      await auth.signOut();

      setShowVerificationMessage(true);
    } catch (error: any) {
      console.error("Error during sign up:", error);
      if (error.code === "auth/email-already-in-use") {
        toast({
          title: "Correo ya registrado",
          description:
            "La dirección de correo electrónico ya está en uso por otra cuenta.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error en el registro",
          description:
            error.message ||
            "No se pudo crear la cuenta. Por favor, inténtalo de nuevo.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (showVerificationMessage) {
    return (
      <Alert>
        <MailCheck className="h-4 w-4" />
        <AlertTitle>¡Revisa tu correo!</AlertTitle>
        <AlertDescription>
          Hemos enviado un enlace de verificación a tu correo electrónico. Por
          favor, haz clic en el enlace para activar tu cuenta y luego inicia
          sesión.
        </AlertDescription>
        <Button onClick={() => router.push("/login")} className="mt-4 w-full">
          Ir a Iniciar Sesión
        </Button>
      </Alert>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Ana" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Pérez" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo de la Cuenta</FormLabel>
              <FormControl>
                <Input placeholder="tu@correo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
                <label style={{fontSize: "12px"}}>La contraseña debe contener números, simbolos, mayúscula y minúscula</label>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Repetir Contraseña</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full bg-[#F97316] text-white hover:bg-[#EA580C] transition-transform duration-300 transform hover:-translate-y-1"
          disabled={isLoading}
        >
          {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
          Crear Cuenta y Probar Gratis
        </Button>
      </form>
    </Form>
  );
}

export function SignupForm() {
  return <SignupFormContent />;
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getMembers, addMember } from "@/services/members";
import type { Member } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PlusCircle, LogOut, Settings } from "lucide-react";
import { AppLogo } from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AddMemberForm } from "@/components/add-member-form";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

function ProfileSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Skeleton className="h-24 w-24 md:h-32 md:w-32 rounded-full" />
      <Skeleton className="h-6 w-32" />
    </div>
  );
}

export default function SelectProfilePage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const [isFirstTime, setIsFirstTime] = useState(false);

  const hasReachedProfileLimit = members.length >= 5;

  const loadMembers = useCallback(
    async (user: FirebaseUser) => {
      setLoading(true);
      try {
        const fetchedMembers = await getMembers(user.uid);
        setMembers(fetchedMembers);
        if (fetchedMembers.length === 0) {
          setIsFirstTime(true);
          setIsAddMemberDialogOpen(true);
        }
      } catch (error) {
        console.error(error);
        toast({
          title: "Error al cargar perfiles",
          description:
            "No se pudieron cargar los perfiles de la base de datos.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await loadMembers(user);
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router, loadMembers]);

  const handleProfileSelection = (member: Member) => {
    sessionStorage.setItem("selectedProfile", JSON.stringify(member));
    if (member.role === "owner") {
      router.push(`/owner/profiles`);
    } else {
      router.push(`/${member.role}/dashboard`);
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    sessionStorage.removeItem("selectedProfile");
    router.push("/");
  };

  const handleAddMember = async (
    newMemberData: Partial<Member> & { isOwnerProfile?: boolean }
  ) => {
    if (!currentUser) {
      throw new Error("Debes iniciar sesión para añadir un miembro.");
    }

    try {
      const { isOwnerProfile, ...payload } = newMemberData;

      const newMember = await addMember(
        currentUser.uid,
        payload,
        isOwnerProfile
      );
      setMembers((prev) => [...prev, newMember]);

      toast({
        title: "¡Perfil Creado!",
        description: `Se ha creado el perfil para ${newMemberData.name}.`,
      });
      setIsAddMemberDialogOpen(false);

      // If it was the first profile, automatically select it.
      if (isFirstTime) {
        setIsFirstTime(false);
        handleProfileSelection(newMember);
      }
    } catch (error: any) {
      console.error("Error adding member:", error);
      toast({
        title: "Error al añadir miembro",
        description:
          error.message || "No se pudo añadir el perfil. Inténtalo de nuevo.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="absolute top-4 right-4">
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
        <div className="text-center mb-12">
          <div className="w-64 h-auto mx-auto mb-4">
            <AppLogo />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold font-headline">
            ¿Quién está usando Aula Digital Plus?
          </h1>
        </div>

        <div className="flex flex-wrap justify-center items-start gap-4 md:gap-8">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <ProfileSkeleton key={index} />
            ))
          ) : (
            <>
              {members.map((member) => (
                <div
                  key={member.id}
                  onClick={() => handleProfileSelection(member)}
                  className="group flex flex-col items-center gap-4 cursor-pointer"
                >
                  <Avatar className="h-24 w-24 md:h-32 md:w-32 ring-4 ring-transparent group-hover:ring-primary transition-all">
                    <AvatarImage src={member.avatarUrl} alt={member.name} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <p className="text-xl font-semibold group-hover:text-primary transition-colors">
                    {member.name}
                  </p>
                </div>
              ))}
              {!hasReachedProfileLimit && (
                <div
                  onClick={() => setIsAddMemberDialogOpen(true)}
                  className="group flex flex-col items-center gap-4 cursor-pointer"
                >
                  <div className="h-24 w-24 md:h-32 md:w-32 rounded-full flex items-center justify-center bg-muted group-hover:bg-primary/20 transition-all">
                    <PlusCircle className="h-12 w-12 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-xl font-semibold group-hover:text-primary transition-colors">
                    Añadir Perfil
                  </p>
                </div>
              )}
            </>
          )}
        </div>
        {!isFirstTime && (
          <div className="mt-12">
            <Button variant="outline" asChild>
              <Link href="/owner/profiles">
                <Settings className="mr-2 h-4 w-4" />
                Gestionar Perfiles
              </Link>
            </Button>
          </div>
        )}
      </div>
      <Dialog
        open={isAddMemberDialogOpen}
        onOpenChange={isFirstTime ? () => {} : setIsAddMemberDialogOpen}
      >
        <DialogHeader>
          <DialogTitle>
            {isFirstTime
              ? "¡Bienvenido! Crea tu primer perfil"
              : "Añadir Nuevo Perfil"}
          </DialogTitle>
          <DialogDescription>
            {isFirstTime
              ? "Para empezar, crea tu perfil de Estudiante o Adulto. Desde aquí podrás aprender y gestionar tu cuenta familiar."
              : "Crea un nuevo perfil para tu familia."}
          </DialogDescription>
        </DialogHeader>
        <DialogContent>
          <div style={{ overflowY: "auto", height: "90vh", padding: '1rem' }}>
            {isFirstTime && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Tu Primer Perfil</AlertTitle>
                <AlertDescription>
                  Este perfil te dará acceso a todas las herramientas de
                  aprendizaje. Más tarde, podrás añadir más perfiles para tu
                  familia desde "Gestionar Perfiles".
                </AlertDescription>
              </Alert>
            )}
            <AddMemberForm
              onAddMember={handleAddMember}
              isFirstProfile={isFirstTime}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

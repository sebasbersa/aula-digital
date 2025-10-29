
'use client';

import { useState, useEffect } from 'react';
import { MoreHorizontal, ArrowLeft } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { AddMemberForm } from '@/components/add-member-form';
import type { Member, Role } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { addMember, deleteMember, updateMember, getMembersByOwnerId } from '@/services/members';
import { EditMemberDialog } from '@/components/edit-member-dialog';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useFamily } from '@/contexts/family-context';


const roleDisplayNames: Record<Role, string> = {
    student: 'Estudiante',
    guardian: 'Tutor',
    adult_learner: 'Adulto',
    owner: 'Propietario',
    content_admin: 'Admin',
};

export default function ProfilesPage() {
  const { members, setMembers, currentUser, loading } = useFamily();
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  
  const hasReachedProfileLimit = members.length >= 5;

  const handleAddMember = async (values: Partial<Member>) => {
    if (!currentUser) {
      toast({ title: 'Error', description: 'Debes iniciar sesión para añadir un miembro.', variant: 'destructive' });
      throw new Error('User not logged in');
    }

    if (hasReachedProfileLimit) {
        toast({
            title: 'Límite de perfiles alcanzado',
            description: 'No puedes crear más de 5 perfiles por cuenta.',
            variant: 'destructive',
        });
        throw new Error('Profile limit reached');
    }
    
    try {
      const newMember = await addMember(currentUser.uid, values);
      setMembers(prev => [...prev, newMember]);
      toast({
        title: '¡Perfil Creado!',
        description: `Se ha creado el perfil para ${values.name}.`,
      });
    } catch (error: any) {
        console.error('Error adding member:', error);
        toast({
          title: 'Error al añadir miembro',
          description: error.message || 'No se pudo añadir el perfil. Inténtalo de nuevo.',
          variant: 'destructive',
        });
        throw error;
    }
  };

  const handleUpdateMember = async (updatedData: { name: string; avatarUrl: string; grade?: string; }) => {
    if (!editingMember) return;
    try {
        await updateMember(editingMember.uid, updatedData);
        setMembers(prev => prev.map(m => m.uid === editingMember.uid ? { ...m, ...updatedData } : m));
        toast({
            title: 'Perfil Actualizado',
            description: 'Los cambios se han guardado correctamente.',
        });
        setEditingMember(null);
    } catch (error: any) {
        console.error('Error updating member:', error);
        toast({
            title: 'Error al actualizar',
            description: error.message || 'No se pudo guardar los cambios.',
            variant: 'destructive',
        });
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!currentUser) {
        toast({ title: 'Error', description: 'Debes iniciar sesión para eliminar un miembro.', variant: 'destructive' });
        return;
    }
    try {
        await deleteMember(id);
        setMembers((prevMembers) => prevMembers.filter((member) => member.uid !== id));
        toast({
            title: 'Perfil Eliminado',
            description: 'El perfil ha sido eliminado correctamente.',
        });
    } catch (error: any) {
        console.error('Error deleting member:', error);
        toast({
            title: 'Error al eliminar',
            description: error.message || 'No se pudo eliminar el perfil.',
            variant: 'destructive',
        });
    }
  };

  return (
    <>
      <div className="grid gap-8">
        <div>
           <Button variant="outline" onClick={() => router.push('/select-profile')} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a selección
          </Button>
          <h1 className="text-3xl font-bold font-headline">Gestionar Perfiles Familiares</h1>
          <p className="text-muted-foreground">
            Añade, edita o elimina perfiles para los miembros de tu familia.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Miembros de la Familia ({members.length}/5)</CardTitle>
                <CardDescription>
                  Estos son los perfiles actualmente en tu cuenta.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Rol / Curso</TableHead>
                      <TableHead>
                        <span className="sr-only">Acciones</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 3 }).map((_, index) => (
                        <TableRow key={index}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-16" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-8 w-8" />
                            </TableCell>
                        </TableRow>
                      ))
                    ) : members.length > 0 ? (
                      members.map((member) => (
                        <TableRow key={member.uid}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={member.avatarUrl} alt={member.name} />
                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              {member.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={member.isOwnerProfile ? "default" : "outline"}>
                              {roleDisplayNames[member.role] || member.role}
                              {member.isOwnerProfile && ' (Admin)'}
                            </Badge>
                             
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost" disabled={member.isOwnerProfile}>
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Toggle menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => setEditingMember(member)}>Editar</DropdownMenuItem>
                                {!member.isOwnerProfile && (
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeleteMember(member.uid)}
                                >
                                  Eliminar
                                </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                          Aún no has añadido ningún perfil.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Añadir Nuevo Perfil</CardTitle>
                 {hasReachedProfileLimit ? (
                    <CardDescription className="text-destructive">
                        Has alcanzado el límite de 5 perfiles.
                    </CardDescription>
                ) : (
                    <CardDescription>
                        Crea un nuevo perfil para tu familia.
                    </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <AddMemberForm onAddMember={handleAddMember} disabled={hasReachedProfileLimit} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {editingMember && (
        <EditMemberDialog 
            member={editingMember}
            isOpen={!!editingMember}
            onClose={() => setEditingMember(null)}
            onSave={handleUpdateMember}
            currentUser={currentUser}
        />
      )}
    </>
  );
}

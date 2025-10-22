
'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader } from 'lucide-react';
import type { Member } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { avatarColors, defaultAvatarColor, generateAvatarUrl, studentGrades } from '@/lib/data';
import { cn } from '@/lib/utils';
import type { User as FirebaseUser } from 'firebase/auth';

const formSchema = z.object({
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
  avatarColor: z.string().min(1, { message: 'Por favor, selecciona un color.' }),
  grade: z.string().optional(),
});

interface EditMemberDialogProps {
  member: Member;
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: { name: string; avatarUrl: string; grade?: string }) => Promise<void>;
  currentUser: FirebaseUser | null;
}

export function EditMemberDialog({ member, isOpen, onClose, onSave, currentUser }: EditMemberDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      avatarColor: defaultAvatarColor,
      grade: '',
    },
  });

  useEffect(() => {
    if (member && isOpen) {
      // Simple heuristic to extract color from URL, falls back to default
      const urlColor = Object.keys(avatarColors).find(key => member.avatarUrl.includes(avatarColors[key as keyof typeof avatarColors].bg));
      form.reset({
        name: member.name,
        avatarColor: urlColor || defaultAvatarColor,
        grade: member.grade || '',
      });
    }
  }, [member, isOpen, form]);
  
  const memberName = form.watch('name');
  const selectedColor = form.watch('avatarColor');
  const avatarUrl = generateAvatarUrl(memberName, selectedColor);

  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSaving(true);
    try {
      const finalAvatarUrl = generateAvatarUrl(values.name, values.avatarColor);
      const payload: { name: string; avatarUrl: string; grade?: string } = {
        name: values.name,
        avatarUrl: finalAvatarUrl
      };
      if (member.role === 'student') {
        payload.grade = values.grade;
      }
      await onSave(payload);
      onClose();
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSaving && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Perfil de {member.name}</DialogTitle>
          <DialogDescription>
            Actualiza el nombre, curso, color y foto de perfil.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
             <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                    <AvatarImage src={avatarUrl} alt={memberName} />
                    <AvatarFallback>{memberName?.charAt(0).toUpperCase() || '?'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                            <Input {...field} disabled={isSaving} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
            </div>

            {member.role === 'student' && (
              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Curso Actual</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSaving}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el curso" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {studentGrades.map(grade => (
                          <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

             <FormField
              control={form.control}
              name="avatarColor"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Elige un nuevo Color</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-8 gap-2"
                    >
                      {Object.entries(avatarColors).map(([key, color]) => (
                        <FormItem key={key} className="flex items-center justify-center">
                          <FormControl>
                            <RadioGroupItem value={key} className="sr-only" />
                          </FormControl>
                          <FormLabel className="cursor-pointer">
                             <div
                              className={cn(
                                'h-10 w-10 rounded-full ring-2 ring-transparent ring-offset-2 transition-all',
                                field.value === key && 'ring-primary'
                              )}
                              style={{ backgroundColor: `#${color.bg}` }}
                            />
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

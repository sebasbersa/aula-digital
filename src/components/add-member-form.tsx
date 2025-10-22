
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
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
import { PlusCircle, Loader } from 'lucide-react';
import type { Member } from '@/lib/types';
import { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { avatarColors, defaultAvatarColor, generateAvatarUrl, studentGrades } from '@/lib/data';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'El nombre debe tener al menos 2 caracteres.',
  }),
  role: z.enum(['student', 'adult_learner'], { // Se elimina 'owner' de las opciones iniciales
    required_error: 'Debes seleccionar un rol.',
  }),
  avatarColor: z.string().min(1, { message: 'Por favor, selecciona un color.' }),
  age: z.coerce.number().min(3, { message: 'La edad debe ser válida.' }).optional(),
  grade: z.string().optional(),
  learningObjective: z.string().optional(),
}).refine(data => {
    if (data.role === 'student' && !data.grade) {
      return false;
    }
    return true;
}, {
    message: 'Por favor, selecciona un curso para el estudiante.',
    path: ['grade'],
}).refine(data => {
    if (data.role === 'adult_learner' && (!data.learningObjective || data.learningObjective.length < 3)) {
        return false;
    }
    return true;
}, {
    message: 'Por favor, describe tu objetivo de aprendizaje.',
    path: ['learningObjective'],
});

interface AddMemberFormProps {
  onAddMember: (values: Partial<Member>) => Promise<void>;
  isFirstProfile?: boolean;
  disabled?: boolean;
}

export function AddMemberForm({ onAddMember, isFirstProfile = false, disabled = false }: AddMemberFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      avatarColor: defaultAvatarColor,
      age: undefined,
      grade: '',
      learningObjective: '',
      role: undefined,
    },
  });

  const selectedRole = form.watch('role');
  const memberName = form.watch('name');
  const selectedColor = form.watch('avatarColor');
  const avatarUrl = generateAvatarUrl(memberName, selectedColor);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const finalAvatarUrl = generateAvatarUrl(values.name, values.avatarColor);
      const payload: Partial<Member> = {
          name: values.name,
          role: values.role,
          avatarUrl: finalAvatarUrl,
          age: values.age,
          grade: values.role === 'student' ? values.grade : undefined,
          learningObjective: values.role === 'adult_learner' ? values.learningObjective : undefined,
      };

      // Si es el primer perfil, también se le asigna el rol de 'owner' internamente.
      if (isFirstProfile) {
        payload.isOwnerProfile = true;
      }

      await onAddMember(payload);
      form.reset({
        name: '',
        role: undefined,
        age: undefined,
        grade: '',
        learningObjective: '',
        avatarColor: defaultAvatarColor,
      });
    } catch (error) {
      // Error is handled by the parent component's toast.
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <fieldset disabled={disabled || isSubmitting} className="space-y-6">
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
                    <FormLabel>Tu Nombre o el del Miembro</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Sofía" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rol</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="student">Estudiante</SelectItem>
                    <SelectItem value="adult_learner">Adulto</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
              <FormItem>
                  <FormLabel>Edad</FormLabel>
                  <FormControl>
                  <Input type="number" placeholder="Ej: 8" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : e.target.valueAsNumber)} value={field.value ?? ''} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
              </FormItem>
              )}
          />

          {selectedRole === 'student' && (
              <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Curso</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
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

          {selectedRole === 'adult_learner' && (
              <FormField
                  control={form.control}
                  name="learningObjective"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Objetivo de Aprendizaje</FormLabel>
                      <FormControl>
                      <Input placeholder="Ej: Inglés, Contabilidad, Marketing" {...field} disabled={isSubmitting} />
                      </FormControl>
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
                <FormLabel>Elige un Color</FormLabel>
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
        </fieldset>
        <Button type="submit" className="w-full" disabled={disabled || isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Creando...
            </>
          ) : (
            <>
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear Perfil
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}

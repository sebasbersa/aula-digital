
'use client';

import { useState, useEffect, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader, Plus, Trash2, BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getSubjects } from '@/services/subjects';
import { addGrade, deleteGrade, getGrades } from '@/services/grades';
import type { Member, Subject, Grade } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from './ui/badge';

const formSchema = z.object({
  subjectId: z.string({ required_error: 'Debes seleccionar una materia.' }),
  description: z.string().min(3, { message: 'La descripción es muy corta.' }),
  grade: z.coerce.number()
    .min(1.0, { message: 'La nota debe ser al menos 1.0.' })
    .max(7.0, { message: 'La nota no puede ser mayor a 7.0.' }),
});

export function GradesClient() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [currentProfile, setCurrentProfile] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      grade: undefined,
      subjectId: '',
    },
  });

  const fetchData = useCallback(async (profile: Member) => {
    setIsLoading(true);
    try {
      const [fetchedSubjects, fetchedGrades] = await Promise.all([
        getSubjects(),
        getGrades(profile.id),
      ]);
      setSubjects(fetchedSubjects);
      setGrades(fetchedGrades);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({ title: 'Error', description: 'No se pudieron cargar los datos de calificaciones.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const profileString = sessionStorage.getItem('selectedProfile');
    if (profileString) {
      const profile = JSON.parse(profileString);
      setCurrentProfile(profile);
      fetchData(profile);
    } else {
      setIsLoading(false);
    }
  }, [fetchData]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!currentProfile) return;
    try {
      const newGrade = await addGrade(currentProfile.ownerId, currentProfile.id, values);
      setGrades((prev) => [...prev, newGrade]);
      toast({ title: '¡Nota Agregada!', description: 'Tu calificación ha sido registrada.' });
      form.reset();
    } catch (error) {
      console.error('Error adding grade:', error);
      toast({ title: 'Error', description: 'No se pudo registrar la calificación.', variant: 'destructive' });
    }
  };

  const handleDeleteGrade = async (gradeId: string) => {
    try {
      await deleteGrade(gradeId);
      setGrades(prev => prev.filter(g => g.id !== gradeId));
      toast({ title: 'Nota Eliminada', description: 'La calificación ha sido eliminada.' });
    } catch (error) {
      console.error('Error deleting grade:', error);
      toast({ title: 'Error', description: 'No se pudo eliminar la calificación.', variant: 'destructive' });
    }
  };

  const gradesBySubject = grades.reduce((acc, grade) => {
    if (!acc[grade.subjectId]) {
      acc[grade.subjectId] = [];
    }
    acc[grade.subjectId].push(grade);
    return acc;
  }, {} as Record<string, Grade[]>);

  const calculateAverage = (subjectGrades: Grade[]) => {
    if (subjectGrades.length === 0) return 'N/A';
    const sum = subjectGrades.reduce((total, g) => total + g.grade, 0);
    return (sum / subjectGrades.length).toFixed(1);
  };

  return (
    <div className="space-y-8 px-4 md:px-6 lg:px-8">
      <div>
        <Card>
            <CardHeader>
                <CardTitle>Añadir Nueva Nota</CardTitle>
                <CardDescription>
                    Registra una nueva calificación.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                         <FormField
                            control={form.control}
                            name="subjectId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Materia</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona una materia" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {subjects.map((s) => (
                                                <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: Prueba #1, Tarea Acumulativa..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="grade"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nota (1.0 - 7.0)</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.1" placeholder="Ej: 6.5" {...field} value={field.value ?? ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? <Loader className="mr-2 h-4 w-4 animate-spin"/> : <Plus className="mr-2 h-4 w-4"/>}
                            Añadir Nota
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
      </div>
      <div>
         {isLoading ? (
            <Skeleton className="h-96 w-full" />
        ) : (
            <div className="space-y-6">
                {subjects.map(subject => {
                    const subjectGrades = gradesBySubject[subject.id] || [];
                    const average = calculateAverage(subjectGrades);
                    
                    const averageNumber = parseFloat(average);
                    const averageColorClass = isNaN(averageNumber)
                        ? 'bg-gray-100 text-gray-800'
                        : averageNumber >= 4.0
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800';

                    return (
                        <Card key={subject.id}>
                            <CardHeader className="flex flex-row justify-between items-center">
                                <div>
                                    <CardTitle>{subject.title}</CardTitle>
                                    <CardDescription>Calificaciones registradas</CardDescription>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm text-muted-foreground">Promedio</span>
                                    <Badge className={`text-2xl font-bold ml-2 ${averageColorClass}`}>{average}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {subjectGrades.length > 0 ? (
                                     <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Descripción</TableHead>
                                                <TableHead className="text-right">Nota</TableHead>
                                                <TableHead className="text-right">Acción</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {subjectGrades.map(grade => (
                                                <TableRow key={grade.id}>
                                                    <TableCell>{grade.description}</TableCell>
                                                    <TableCell className="text-right font-semibold">{grade.grade.toFixed(1)}</TableCell>
                                                    <TableCell className="text-right">
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                 <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Esta acción no se puede deshacer. Se eliminará la nota permanentemente.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDeleteGrade(grade.id)}>
                                                                        Eliminar
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <p className="text-muted-foreground text-center py-4">Aún no hay notas para esta materia.</p>
                                )}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        )}
      </div>
    </div>
  );
}

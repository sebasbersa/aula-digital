
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader, Plus, Trash2, BookOpen, CalendarIcon, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getSubjects } from '@/services/subjects';
import { addTest, deleteTest, getTests, updateTest } from '@/services/tests';
import type { Member, Subject, Test } from '@/lib/types';
import type { DayContentProps } from 'react-day-picker';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Badge } from './ui/badge';

const formSchema = z.object({
  subjectId: z.string({ required_error: 'Debes seleccionar una materia.' }),
  date: z.date({ required_error: 'Debes seleccionar una fecha.' }),
  topics: z.string().min(5, { message: 'Describe al menos un tema (5+ caracteres).' }),
});

const colorVariants = {
    text: {
        red: 'text-red-700 dark:text-red-300',
        blue: 'text-blue-700 dark:text-blue-300',
        green: 'text-green-700 dark:text-green-300',
        yellow: 'text-yellow-700 dark:text-yellow-300',
        purple: 'text-purple-700 dark:text-purple-300',
        indigo: 'text-indigo-700 dark:text-indigo-300',
    },
    bg: {
        red: 'bg-red-50 dark:bg-red-900/20',
        blue: 'bg-blue-50 dark:bg-blue-900/20',
        green: 'bg-green-50 dark:bg-green-900/20',
        yellow: 'bg-yellow-50 dark:bg-yellow-900/20',
        purple: 'bg-purple-50 dark:bg-purple-900/20',
        indigo: 'bg-indigo-50 dark:bg-indigo-900/20',
    },
    border: {
        red: 'border-red-200 dark:border-red-800/50',
        blue: 'border-blue-200 dark:border-blue-800/50',
        green: 'border-green-200 dark:border-green-800/50',
        yellow: 'border-yellow-200 dark:border-yellow-800/50',
        purple: 'border-purple-200 dark:border-purple-800/50',
        indigo: 'border-indigo-200 dark:border-indigo-800/50',
    },
    badge: {
        red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    }
};

export function TestCalendarClient() {
  const [tests, setTests] = useState<Test[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [currentProfile, setCurrentProfile] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topics: '',
    },
  });

  const fetchData = useCallback(async (profile: Member) => {
    setIsLoading(true);
    try {
      const [fetchedSubjects, fetchedTests] = await Promise.all([
        getSubjects(),
        getTests(profile.id),
      ]);
      setSubjects(fetchedSubjects);
      setTests(fetchedTests);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({ title: 'Error', description: 'No se pudieron cargar los datos del calendario.', variant: 'destructive' });
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

    if (editingTest) {
      // Update existing test
      try {
        const updatedTest = await updateTest(editingTest.id, values);
        setTests((prev) => prev.map(t => t.id === editingTest.id ? updatedTest : t));
        toast({ title: '¡Prueba Actualizada!', description: 'Los cambios se han guardado.' });
      } catch (error) {
         console.error('Error updating test:', error);
        toast({ title: 'Error', description: 'No se pudo actualizar la prueba.', variant: 'destructive' });
      }
    } else {
      // Add new test
      try {
        const newTest = await addTest(currentProfile.ownerId, currentProfile.id, values);
        setTests((prev) => [...prev, newTest].sort((a, b) => a.date.getTime() - b.date.getTime()));
        toast({ title: '¡Prueba Agendada!', description: 'La nueva prueba se ha añadido al calendario.' });
      } catch (error) {
        console.error('Error adding test:', error);
        toast({ title: 'Error', description: 'No se pudo agendar la prueba.', variant: 'destructive' });
      }
    }

    form.reset();
    setIsFormDialogOpen(false);
    setEditingTest(null);
  };
  
  const handleEditTest = (test: Test) => {
    setEditingTest(test);
    form.reset({
      subjectId: test.subjectId,
      date: test.date,
      topics: test.topics,
    });
    setIsFormDialogOpen(true);
  };

  const handleDeleteTest = async (testId: string) => {
    try {
      await deleteTest(testId);
      setTests(prev => prev.filter(t => t.id !== testId));
      toast({ title: 'Prueba Eliminada', description: 'La prueba ha sido eliminada del calendario.' });
    } catch (error) {
      console.error('Error deleting test:', error);
      toast({ title: 'Error', description: 'No se pudo eliminar la prueba.', variant: 'destructive' });
    }
  };
  
  const getSubjectInfo = (subjectId: string) => {
    return subjects.find(s => s.id === subjectId);
  };
  
  const testsByDay = useMemo(() => {
    return tests.reduce((acc, test) => {
        const day = format(test.date, 'yyyy-MM-dd');
        if (!acc[day]) {
            acc[day] = [];
        }
        acc[day].push(test);
        return acc;
    }, {} as Record<string, Test[]>);
  }, [tests]);

  function CustomDay(props: DayContentProps) {
    const day = format(props.date, 'yyyy-MM-dd');
    const testsOnDay = testsByDay[day] || [];
    
    return (
        <div className={cn("relative flex h-full w-full flex-col p-1 text-xs", testsOnDay.length > 0 && "bg-secondary/50")}>
            <time dateTime={day} className={cn(
                "self-start text-sm",
                format(new Date(), 'yyyy-MM-dd') === day && "flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground"
            )}>
                {format(props.date, 'd')}
            </time>
            {testsOnDay.length > 0 && (
                <div className="flex-grow overflow-y-auto text-left mt-1 space-y-1 has-tests">
                    {testsOnDay.map(test => {
                        const subject = getSubjectInfo(test.subjectId);
                        const subjectColor = subject?.color || 'blue';

                        const studyPrompt = `Hola LIA, tengo una prueba de ${subject?.title} y necesito estudiar estos temas: ${test.topics}. ¿Puedes ayudarme a prepararme?`;
                        const encodedPrompt = encodeURIComponent(studyPrompt);
                        return (
                           <div key={test.id} className={cn(
                                "text-xs p-1.5 rounded-md shadow-sm border",
                                colorVariants.bg[subjectColor as keyof typeof colorVariants.bg],
                                colorVariants.border[subjectColor as keyof typeof colorVariants.border],
                                colorVariants.text[subjectColor as keyof typeof colorVariants.text]
                            )}>
                               <div className="font-semibold flex justify-between items-center mb-1">
                                   <Badge variant="outline" className={cn(
                                       "border-transparent",
                                       colorVariants.badge[subjectColor as keyof typeof colorVariants.badge]
                                   )}>{subject?.title || 'Prueba'}</Badge>
                                   <div className="flex">
                                        <div
                                            role="button"
                                            aria-label="Editar prueba"
                                            className="p-1 rounded-md hover:bg-muted/50 cursor-pointer"
                                            onClick={(e) => { e.stopPropagation(); handleEditTest(test); }}
                                        >
                                            <Edit className="h-3 w-3" />
                                        </div>
                                       <div
                                            role="button"
                                            aria-label="Eliminar prueba"
                                            className="p-1 rounded-md hover:bg-destructive/10 cursor-pointer"
                                            onClick={(e) => { e.stopPropagation(); handleDeleteTest(test.id); }}
                                       >
                                           <Trash2 className="h-3 w-3 text-destructive" />
                                       </div>
                                   </div>
                               </div>
                               <div>
                                   <p className="text-muted-foreground whitespace-normal mb-1">{test.topics}</p>
                                    <Link
                                       href={`/student/subjects/${test.subjectId}?prompt=${encodedPrompt}`}
                                       className="inline-flex items-center justify-center gap-1 w-full h-6 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                                       onClick={(e) => e.stopPropagation()}
                                    >
                                       <BookOpen className="h-3 w-3"/>
                                       Estudiar
                                   </Link>
                               </div>
                           </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
  }

  const handleDayClick = (date: Date) => {
      form.reset();
      setEditingTest(null);
      form.setValue('date', date);
      setIsFormDialogOpen(true);
  }

  return (
    <div className="border-t">
        <div className="flex items-center justify-between p-4 md:px-6 lg:px-8">
            <div className="flex items-center gap-4">
                 <h2 className="text-xl font-semibold capitalize">
                    {format(currentMonth, "MMMM 'de' yyyy", { locale: es })}
                </h2>
            </div>
            <Button onClick={() => {
                form.reset();
                setEditingTest(null);
                form.setValue('date', new Date());
                setIsFormDialogOpen(true);
            }}>
                <Plus className="mr-2 h-4 w-4" />
                Agendar Prueba
            </Button>
            <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingTest ? 'Editar Prueba' : 'Agendar Nueva Prueba'}</DialogTitle>
                        <DialogDescription>
                          {editingTest ? 'Modifica los detalles de tu evaluación.' : 'Añade los detalles de tu próxima evaluación.'}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                             <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Fecha</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-[240px] pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP", { locale: es })
                                                        ) : (
                                                            <span>Elige una fecha</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    locale={es}
                                                    disabled={(date) =>
                                                        date < new Date(new Date().setHours(0,0,0,0))
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="subjectId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Materia</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                name="topics"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Temario</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Ej: Suma de fracciones, verbos, la célula..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? <Loader className="mr-2 h-4 w-4 animate-spin"/> : <Plus className="mr-2 h-4 w-4"/>}
                                {editingTest ? 'Guardar Cambios' : 'Agendar Prueba'}
                            </Button>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
        {isLoading ? (
            <div className="flex justify-center items-center h-96">
                <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : (
            <div className="p-4 md:px-6 lg:px-8 bg-card rounded-lg shadow">
                 <Calendar
                    mode="single"
                    month={currentMonth}
                    onMonthChange={setCurrentMonth}
                    onDayClick={handleDayClick}
                    locale={es}
                    className="w-full p-0"
                    classNames={{
                        months: 'px-4 md:px-6 lg:px-8',
                        head_row: "grid grid-cols-7",
                        head_cell: cn(
                          "w-full py-2 font-semibold text-sm",
                          "[&:nth-child(1)]:text-red-500",
                          "[&:nth-child(2)]:text-indigo-500",
                          "[&:nth-child(3)]:text-purple-500",
                          "[&:nth-child(4)]:text-blue-500",
                          "[&:nth-child(5)]:text-green-500",
                          "[&:nth-child(6)]:text-yellow-600",
                          "[&:nth-child(7)]:text-red-400"
                        ),
                        row: "grid grid-cols-7 h-auto",
                        cell: "w-full border-t text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                        day: "h-20 w-full has-[.has-tests]:h-40 transition-[height] duration-200 p-1",
                    }}
                    components={{
                        DayContent: CustomDay,
                    }}
                />
            </div>
        )}
    </div>
  );
}

    
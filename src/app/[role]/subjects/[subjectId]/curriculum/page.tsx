
'use client';

import { getSubjectById } from '@/services/subjects';
import { englishCurriculum, accountingCurriculum, marketingCurriculum, liderazgoOratoriaCurriculum } from '@/lib/data';
import type { Curriculum, Member, Role, Subject, LessonDef, UnitDef, LevelDef } from '@/lib/types';
import { notFound, useParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CheckCircle, PlayCircle, BookOpen, History, Trash2, ArrowLeft, Play, Circle, RadioButton, PauseCircle, HelpCircle, Loader, Wand2 } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useToast } from '@/hooks/use-toast';
import { getTutoringSessions, deleteTutoringSession, type TutoringSession } from '@/services/tutoringSessions';
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
import { HomeworkHelperClient } from '@/components/homework-helper-client';
import { cn } from '@/lib/utils';
import { SavedTutoringSession } from '@/components/saved-tutoring-session';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { askAccountingQuestion, type AskAccountingQuestionOutput } from '@/ai/flows/ask-accounting-question';


function AccountingQuickQuestions() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<AskAccountingQuestionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      toast({ title: 'Pregunta vacía', description: 'Por favor, escribe tu duda.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setResponse(null);
    try {
      const result = await askAccountingQuestion({ question });
      setResponse(result);
    } catch (error) {
      console.error("Error asking accounting question:", error);
      toast({ title: 'Error', description: 'No se pudo obtener una respuesta de LIA. Inténtalo de nuevo.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-8 border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-primary" />
          Preguntas Rápidas con LIA
        </CardTitle>
        <CardDescription>
          ¿Tienes una duda contable sobre tu PYME? LIA te responde y te guía a la lección correcta.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Ej: Tengo mi PYME y quiero hacer una factura, ¿cómo lo hago?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={2}
            disabled={isLoading}
          />
          <Button onClick={handleAskQuestion} disabled={isLoading}>
            {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Preguntar a LIA
          </Button>
        </div>
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader className="w-4 h-4 animate-spin" />
            <span>LIA-Contadora está pensando...</span>
          </div>
        )}
        {response && (
          <Alert>
            <AlertTitle>Respuesta de LIA</AlertTitle>
            <AlertDescription className="space-y-4">
              <p>{response.answer}</p>
              {response.recommendation && (
                <div className="p-3 bg-background rounded-md border text-sm">
                  <p className="font-semibold">Para profundizar, te recomiendo estudiar:</p>
                  <ul className="list-disc pl-5 mt-1">
                    <li><strong>Nivel:</strong> {response.recommendation.level}</li>
                    <li><strong>Unidad:</strong> {response.recommendation.unit}</li>
                    <li><strong>Lección:</strong> {response.recommendation.lesson}</li>
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}


function CurriculumSkeleton() {
    return (
        <div className="container mx-auto py-8 space-y-8">
             <Skeleton className="h-6 w-1/3" />
             <div className="text-center space-y-4">
                <Skeleton className="h-10 w-1/2 mx-auto" />
                <Skeleton className="h-5 w-3/4 mx-auto" />
             </div>
             <div className="space-y-4">
                 <Skeleton className="h-12 w-full" />
                 <Skeleton className="h-12 w-full" />
                 <Skeleton className="h-12 w-full" />
             </div>
        </div>
    )
}

function CurriculumContent() {
    const params = useParams<{ role: Role; subjectId: string }>();
    const router = useRouter();
    const { role, subjectId } = params;
    const { toast } = useToast();

    const [subject, setSubject] = useState<Subject | null>(null);
    const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
    const [loading, setLoading] = useState(true);
    const [savedSessions, setSavedSessions] = useState<TutoringSession[]>([]);
    const [activeLesson, setActiveLesson] = useState<LessonDef | null>(null);
    const [resumedSessionData, setResumedSessionData] = useState<TutoringSession | null>(null);
    const [activeHierarchy, setActiveHierarchy] = useState<{ levelId: string | null; unitId: string | null; lessonId: string | null }>({ levelId: null, unitId: null, lessonId: null });
    const [openAccordionIds, setOpenAccordionIds] = useState<string[]>([]);
    
    // User progress state
    const [completedLessons, setCompletedLessons] = useState<string[]>([]);
    
    const loadSavedSessions = useCallback(async (profileId: string) => {
        try {
            const sessions = await getTutoringSessions(profileId, subjectId);
            setSavedSessions(sessions);
        } catch (error) {
            console.error("Failed to load sessions:", error);
            toast({
                title: "Error al cargar progreso",
                description: "No se pudieron cargar las lecciones guardadas.",
                variant: "destructive"
            });
        }
    }, [subjectId, toast]);
    
    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const profileString = sessionStorage.getItem('selectedProfile');
            let profile: Member | null = null;
            if (profileString) {
                profile = JSON.parse(profileString);
            }

            const subjectData = await getSubjectById(subjectId);
            if (!subjectData || !subjectData.hasCurriculum) {
                notFound();
            }
            setSubject(subjectData);

            // In a real app, you would fetch the curriculum based on the subject
            if (subjectData.id === 'ingles-practico') {
                setCurriculum(englishCurriculum);
            } else if (subjectData.id === 'contabilidad-finanzas') {
                setCurriculum(accountingCurriculum);
            } else if (subjectData.id === 'marketing-digital') {
                setCurriculum(marketingCurriculum);
            } else if (subjectData.id === 'liderazgo-oratoria') {
                setCurriculum(liderazgoOratoriaCurriculum);
            }


            if (profile) {
                await loadSavedSessions(profile.id);
            }

            setLoading(false);
        }
        loadData();
    }, [subjectId, loadSavedSessions]);
    
    const findLessonByTitle = useCallback((title: string): { level: LevelDef, unit: UnitDef, lesson: LessonDef } | null => {
        if (!curriculum) return null;
        for (const level of curriculum.levels) {
            for (const unit of level.units) {
                const lesson = unit.lessons.find(l => l.title === title);
                if (lesson) {
                    return { level, unit, lesson };
                }
            }
        }
        return null;
    }, [curriculum]);

    useEffect(() => {
        if (savedSessions.length > 0 && curriculum) {
            const mostRecentSession = savedSessions.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0];
            const lessonInfo = findLessonByTitle(mostRecentSession.title);
            if (lessonInfo) {
                setActiveHierarchy({
                    levelId: lessonInfo.level.id,
                    unitId: lessonInfo.unit.id,
                    lessonId: lessonInfo.lesson.id,
                });
                // Set the default open accordions to the level and unit of the most recent session
                setOpenAccordionIds([lessonInfo.level.id, lessonInfo.unit.id]);
            }
        }
    }, [savedSessions, curriculum, findLessonByTitle]);
    
     const handleSessionSaved = useCallback(async (savedSession: TutoringSession) => {
        setActiveLesson(null);
        setResumedSessionData(null);
        // We get the profile from session storage again to ensure we have the latest version
        const profileString = sessionStorage.getItem('selectedProfile');
        if (profileString) {
            const profile = JSON.parse(profileString);
            await loadSavedSessions(profile.id);
        }
    }, [loadSavedSessions]);
    
    const handleStartLesson = (lesson: LessonDef) => {
        const inProgressSessions = savedSessions
            .filter(s => s.title === lesson.title)
            .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        
        if (inProgressSessions.length > 0) {
            handleResumeSession(inProgressSessions[0]);
        } else {
            setActiveLesson(lesson);
            setResumedSessionData(null);
        }
    };

    const handleResumeSession = (session: TutoringSession) => {
        const lessonInfo = findLessonByTitle(session.title);
        if (lessonInfo) {
            setActiveLesson(lessonInfo.lesson);
            setResumedSessionData(session);
        } else {
            toast({
                title: "Lección no encontrada",
                description: "No se pudo encontrar la lección original en el plan de estudios actual.",
                variant: "destructive"
            });
        }
    };
    
    const handleDeleteSession = async (sessionId: string) => {
        try {
            await deleteTutoringSession(sessionId);
            setSavedSessions(prev => prev.filter(s => s.id !== sessionId));
            toast({
                title: "Lección Eliminada",
                description: "La lección guardada ha sido eliminada."
            });
        } catch (error) {
             console.error("Failed to delete session:", error);
            toast({
                title: "Error al eliminar",
                description: "No se pudo eliminar la lección.",
                variant: "destructive"
            });
        }
    };
    
    const handleCreatePracticeGuide = (session: TutoringSession) => {
        const params = new URLSearchParams({
            subjectId: session.subjectId,
            topic: session.title,
        });
        router.push(`/${role}/practice-guides?${params.toString()}`);
    };
    
    const handleReturnToCurriculum = () => {
        setActiveLesson(null);
        setResumedSessionData(null);
    };


    if (loading || !subject) {
        return <CurriculumSkeleton />;
    }

    if (activeLesson) {
        const initialPrompt = `Hola LIA, quiero empezar la lección "${activeLesson.title}" del curso de ${subject.title}. El objetivo es: ${activeLesson.objective}`;
        
        return (
             <div className="container mx-auto py-8 space-y-4">
                 <Button variant="outline" onClick={handleReturnToCurriculum}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al Plan de Estudios
                 </Button>
                 <HomeworkHelperClient 
                    subject={subject} 
                    initialPrompt={resumedSessionData ? undefined : initialPrompt}
                    initialChatHistory={resumedSessionData ? resumedSessionData.sessionData : undefined}
                    resumedSession={resumedSessionData}
                    onSessionSaved={handleSessionSaved}
                    lessonTitle={activeLesson.title}
                 />
             </div>
        )
    }


    return (
        <div className="container mx-auto py-8 space-y-8">
            <div>
                <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href={`/${role}/subjects`}>Materias</Link>
                    </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href={`/${role}/subjects/${subjectId}`}>{subject.title}</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                     <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Plan de Estudios</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
                </Breadcrumb>
            </div>
             <div className="text-center">
                <h1 className="text-4xl font-bold font-headline">Plan de Estudios: {subject.title}</h1>
                <p className="text-muted-foreground mt-2 text-lg max-w-2xl mx-auto">
                    Tu ruta de aprendizaje personalizada para dominar {subject.title} desde cero hasta experto. ¡Todos los niveles están disponibles para ti!
                </p>
            </div>
            
            {subject.id === 'contabilidad-finanzas' && <AccountingQuickQuestions />}

            {curriculum && (
                 <Accordion 
                    type="multiple" 
                    className="w-full space-y-4" 
                    value={openAccordionIds}
                    onValueChange={setOpenAccordionIds}
                >
                    {curriculum.levels.map(level => {
                        const isLevelActive = level.id === activeHierarchy.levelId;
                        return (
                        <AccordionItem value={level.id} key={level.id} className={cn("border rounded-lg overflow-hidden bg-card transition-colors", isLevelActive && "bg-blue-500/5 border-blue-500/20")}>
                            <AccordionTrigger className="p-6 hover:no-underline">
                                <div className="flex items-center justify-between w-full">
                                    <div className="text-left">
                                        <h3 className="text-xl font-bold font-headline">{level.title}</h3>
                                        <p className="text-sm text-muted-foreground font-normal">{level.description}</p>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-6 pt-0">
                                <Accordion 
                                    type="multiple" 
                                    className="w-full"
                                    value={openAccordionIds}
                                    onValueChange={setOpenAccordionIds}
                                >
                                    {level.units.map((unit, unitIndex) => {
                                        const isUnitActive = unit.id === activeHierarchy.unitId;
                                        return (
                                        <AccordionItem key={unit.id} value={unit.id} className={cn("border-b-0", isUnitActive && "bg-blue-500/10 rounded-md")}>
                                            <AccordionTrigger className="rounded-md px-4 hover:bg-secondary">
                                                <div className="text-left">
                                                    <p className="font-semibold">{unit.title}</p>
                                                    {unit.objective && <p className="text-sm text-muted-foreground font-normal">{unit.objective}</p>}
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="pt-2 pb-0">
                                                <ul className="space-y-2 pl-4 border-l ml-2 py-2">
                                                    {unit.lessons.map(lesson => {
                                                        const inProgressSession = savedSessions.find(s => s.title === lesson.title);
                                                        const isCompleted = completedLessons.includes(lesson.id);
                                                        const isInProgress = !!inProgressSession;
                                                        
                                                        return (
                                                            <li key={lesson.id} className={cn(
                                                                "flex items-center justify-between p-2 rounded-md transition-colors",
                                                                isInProgress && "bg-blue-500/10"
                                                            )}>
                                                                <div className="flex items-center gap-3">
                                                                    {isCompleted ? (
                                                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                                                    ) : isInProgress ? (
                                                                        <PauseCircle className="w-5 h-5 text-blue-500" />
                                                                    ) : (
                                                                        <Circle className="w-5 h-5 text-muted-foreground" />
                                                                    )}
                                                                    <div>
                                                                        <p className="font-medium">{lesson.title}</p>
                                                                        <p className="text-xs text-muted-foreground">{lesson.objective}</p>
                                                                    </div>
                                                                </div>
                                                                <Button 
                                                                    size="sm" 
                                                                    onClick={() => handleStartLesson(lesson)}
                                                                    variant={isInProgress ? "secondary" : "default"}
                                                                >
                                                                    <PlayCircle className="mr-2 h-4 w-4" />
                                                                    {isInProgress ? 'Retomar' : 'Empezar'}
                                                                </Button>
                                                            </li>
                                                        )
                                                    })}
                                                </ul>
                                            </AccordionContent>
                                        </AccordionItem>
                                    )})}
                                </Accordion>
                            </AccordionContent>
                        </AccordionItem>
                    )})}
                </Accordion>
            )}

            {savedSessions.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
                        <History className="w-6 h-6 text-primary" />
                        Lecciones Guardadas
                    </h2>
                    <Card>
                        <CardContent className="pt-6 space-y-2">
                            {savedSessions.map(session => {
                                const lessonInfo = findLessonByTitle(session.title);
                                const fullTitle = lessonInfo ? `${lessonInfo.level.title} - ${lessonInfo.unit.title}` : 'Lección guardada';
                                return (
                                    <SavedTutoringSession
                                        key={session.id}
                                        session={session}
                                        onDelete={handleDeleteSession}
                                        onResume={handleResumeSession}
                                        onCreatePracticeGuide={handleCreatePracticeGuide}
                                        levelAndUnitDisplay={fullTitle}
                                    />
                                );
                            })}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}


export default function CurriculumPage() {
    return (
        <Suspense fallback={<CurriculumSkeleton />}>
            <CurriculumContent />
        </Suspense>
    );
}


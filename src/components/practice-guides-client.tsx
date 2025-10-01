'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader, Wand2, CheckCircle, XCircle, BrainCircuit, History, Lightbulb, ArrowLeft, MoreHorizontal, X, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSubjects, getAdultSubjects } from '@/services/subjects';
import type { GenerateGuideOutput, EvaluateGuideOutput } from '@/ai/flows/generate-practice-guide';
import type { Member, Subject, PracticeGuideResult, Role } from '@/lib/types';
import { cn } from '@/lib/utils';
import { getTutoringSessions, type TutoringSession } from '@/services/tutoringSessions';
import { addPracticeGuide, getPracticeGuides, deletePracticeGuide } from '@/services/practiceGuides';
import { Badge } from './ui/badge';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ParsedContent } from './parsed-content';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// ====================
// API helpers
// ====================
async function generatePracticeGuideAPI(input: any): Promise<GenerateGuideOutput> {
  const res = await fetch("/api/flows/generate-practice-guide", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Error desconocido");
    console.error("❌ Error en generatePracticeGuideAPI:", res.status, errorText);
    throw new Error(`Error al generar la guía: ${res.status} ${errorText}`);
  }

  return res.json();
}

async function evaluatePracticeGuideAPI(input: any): Promise<EvaluateGuideOutput> {
  const res = await fetch("/api/flows/evaluate-practice-guide", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Error desconocido");
    console.error("❌ Error en evaluatePracticeGuideAPI:", res.status, errorText);
    throw new Error(`Error al evaluar la guía: ${res.status} ${errorText}`);
  }

  return res.json();
}

// ====================
// Tipos y utilidades
// ====================
type Status = 'idle' | 'generating' | 'ready' | 'evaluating' | 'evaluated';

interface GuideWithAnswers extends GenerateGuideOutput {
  questions: (GenerateGuideOutput['questions'][0] & { studentAnswerIndex: number | null })[];
}

const gradingTable: { [key: number]: number } = {
  0: 1.0, 1: 1.3, 2: 1.7, 3: 2.0, 4: 2.3, 5: 2.7, 6: 3.0,
  7: 3.3, 8: 3.7, 9: 4.0, 10: 4.5, 11: 5.0, 12: 5.8,
  13: 6.3, 14: 6.7, 15: 7.0,
};

function calculateScore(correctAnswers: number): number {
  return gradingTable[correctAnswers] ?? 1.0;
}

// ====================
// Componente principal
// ====================
export function PracticeGuidesClient({ role }: { role: Role }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [savedLessons, setSavedLessons] = useState<TutoringSession[]>([]);
  const [evaluatedGuides, setEvaluatedGuides] = useState<PracticeGuideResult[]>([]);

  const [selectedSubject, setSelectedSubject] = useState(searchParams.get('subjectId') || '');
  const [selectedTopic, setSelectedTopic] = useState(searchParams.get('topic') || '');

  const [currentProfile, setCurrentProfile] = useState<Member | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [viewingHistory, setViewingHistory] = useState(false);
  const [guide, setGuide] = useState<GuideWithAnswers | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluateGuideOutput | null>(null);
  const [guideToDelete, setGuideToDelete] = useState<string | null>(null);

  useEffect(() => {
    async function loadInitialData() {
      const profileString = sessionStorage.getItem('selectedProfile');
      if (profileString) {
        const profile = JSON.parse(profileString);
        setCurrentProfile(profile);

        const [fetchedSubjects, fetchedLessons, fetchedGuides] = await Promise.all([
          role === 'adult_learner' ? getAdultSubjects() : getSubjects(profile.grade),
          getTutoringSessions(profile.id),
          getPracticeGuides(profile.id),
        ]);

        setSubjects(fetchedSubjects);
        setSavedLessons(fetchedLessons);
        setEvaluatedGuides(fetchedGuides);
      }
    }
    loadInitialData();
  }, [role]);

  const handleGenerateGuide = async () => {
    if (!selectedSubject || !selectedTopic || !currentProfile) {
      toast({ title: 'Información incompleta', description: 'Por favor, selecciona una materia y una lección específica.', variant: 'destructive' });
      return;
    }
    setStatus('generating');
    setGuide(null);
    setEvaluation(null);
    setViewingHistory(false);

    try {
      const subjectName = subjects.find(s => s.id === selectedSubject)?.title || '';
      const gradeLevel = currentProfile.grade || 'Adulto';

      const generatedGuide = await generatePracticeGuideAPI({
        subjectName,
        gradeLevel,
        specificTopic: selectedTopic,
      });

      setGuide({
        ...generatedGuide,
        questions: generatedGuide.questions.map(q => ({ ...q, studentAnswerIndex: null })),
      });
      setStatus('ready');
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'LIA no pudo generar el ensayo. Inténtalo de nuevo.', variant: 'destructive' });
      setStatus('idle');
    }
  };

  const handleAnswerChange = (questionIndex: number, answerIndex: number) => {
    if (!guide) return;
    const updatedQuestions = [...guide.questions];
    updatedQuestions[questionIndex].studentAnswerIndex = answerIndex;
    setGuide({ ...guide, questions: updatedQuestions });
  };

  const handleEvaluateGuide = async () => {
    if (!guide || !currentProfile || status === 'evaluating') return;
    setStatus('evaluating');

    try {
      const subjectName = subjects.find(s => s.id === selectedSubject)?.title || '';

      const evaluationResultFromAI = await evaluatePracticeGuideAPI({
        subjectName,
        questions: guide.questions,
      });

      const finalScore = calculateScore(evaluationResultFromAI.correctAnswersCount);

      const evaluationResult = {
        ...evaluationResultFromAI,
        score: finalScore,
      };

      const { newScore, ...newGuideResult } = await addPracticeGuide(currentProfile.ownerId, currentProfile.id, {
        subjectId: selectedSubject,
        title: guide.title,
        score: evaluationResult.score,
        feedback: evaluationResult.feedback,
        correction: evaluationResult.correctedQuestions,
        correctAnswersCount: evaluationResult.correctAnswersCount,
        totalQuestionsCount: evaluationResult.totalQuestionsCount,
      });

      const updatedProfile = { ...currentProfile, score: newScore };
      setCurrentProfile(updatedProfile);
      sessionStorage.setItem('selectedProfile', JSON.stringify(updatedProfile));

      setEvaluatedGuides(prev => [newGuideResult, ...prev]);
      setEvaluation(evaluationResult);
      setStatus('evaluated');
      setGuide(null);

      toast({ title: '¡Ensayo Corregido!', description: 'LIA ha evaluado tus respuestas. Revisa tu corrección.' });
    } catch (error: any) {
      console.error(error);
      if (error.message && error.message.includes('429')) {
        toast({
          title: 'Límite de uso diario alcanzado',
          description: 'La función de IA gratuita se ha agotado por hoy. Por favor, inténtalo de nuevo mañana.',
          variant: 'destructive',
        });
      } else {
        toast({ title: 'Error', description: 'LIA no pudo corregir el ensayo. Inténtalo de nuevo.', variant: 'destructive' });
      }
      setStatus('ready');
    }
  };

  const startNewGuide = () => {
    setStatus('idle');
    setGuide(null);
    setEvaluation(null);
    setSelectedSubject('');
    setSelectedTopic('');
    setViewingHistory(false);
    router.replace(`/${role}/practice-guides`);
  };

  const handleReviewGuide = (guideResult: PracticeGuideResult) => {
    setEvaluation({
      score: guideResult.score,
      feedback: guideResult.feedback,
      correctedQuestions: guideResult.correction,
      correctAnswersCount: guideResult.correctAnswersCount,
      totalQuestionsCount: guideResult.totalQuestionsCount,
    });
    setStatus('evaluated');
    setViewingHistory(true);
  };

  const handleDeleteGuide = async () => {
    if (!guideToDelete) return;
    try {
      await deletePracticeGuide(guideToDelete);
      setEvaluatedGuides(prev => prev.filter(g => g.id !== guideToDelete));
      toast({ title: 'Ensayo Eliminado', description: 'El ensayo ha sido eliminado de tu historial.' });
    } catch (error) {
      console.error('Error deleting guide:', error);
      toast({ title: 'Error', description: 'No se pudo eliminar el ensayo.', variant: 'destructive' });
    } finally {
      setGuideToDelete(null);
    }
  };

  const lessonsForSelectedSubject = savedLessons.filter(l => l.subjectId === selectedSubject);

  return (
    <div className="space-y-8">
      {status !== 'evaluated' ? (
        <Card>
          <CardHeader>
            <CardTitle>Generador de Ensayos de Práctica</CardTitle>
            <CardDescription>Selecciona una materia y una lección guardada para que LIA cree un ensayo de práctica para ti.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {(status === 'idle' || status === 'generating') && (
              <div className="space-y-4">
                 <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="subject-select">1. Elige una Materia</Label>
                      <Select value={selectedSubject} onValueChange={(val) => {setSelectedSubject(val); setSelectedTopic('');}} disabled={status === 'generating'}>
                        <SelectTrigger id="subject-select">
                          <SelectValue placeholder="Selecciona una materia..." />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map(subject => (
                            <SelectItem key={subject.id} value={subject.id}>{subject.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                        <Label htmlFor="topic-select">2. Elige una Lección</Label>
                        <Select value={selectedTopic} onValueChange={setSelectedTopic} disabled={!selectedSubject || lessonsForSelectedSubject.length === 0 || status === 'generating'}>
                            <SelectTrigger id="topic-select">
                                <SelectValue placeholder="Selecciona una lección estudiada" />
                            </SelectTrigger>
                            <SelectContent>
                                {lessonsForSelectedSubject.map(lesson => (
                                    <SelectItem key={lesson.id} value={lesson.title}>{lesson.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {selectedSubject && lessonsForSelectedSubject.length === 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                                No tienes lecciones guardadas en esta materia. ¡Guarda una para poder generar un ensayo!
                            </p>
                        )}
                    </div>
                </div>

                <Button onClick={handleGenerateGuide} disabled={!selectedSubject || !selectedTopic || status === 'generating'} className="w-full md:w-auto">
                  {status === 'generating' ? (
                      <> <Loader className="mr-2 h-4 w-4 animate-spin" /> Generando...</>
                  ) : (
                      <> <Wand2 className="mr-2 h-4 w-4" /> Generar Ensayo </>
                  )}
                </Button>
              </div>
            )}
            
            {guide && (status === 'ready' || status === 'evaluating') && (
                <div>
                    <h2 className="text-2xl font-bold font-headline mb-4">{guide.title}</h2>
                    {status === 'evaluating' ? (
                        <div className="flex items-center justify-center p-8 space-x-2 text-muted-foreground">
                            <Loader className="w-6 h-6 animate-spin" />
                            <span className="text-lg">Corrigiendo tu ensayo...</span>
                        </div>
                    ) : (
                      <div className="space-y-6">
                          {guide.questions.map((q, qIndex) => (
                              <div key={qIndex} className="p-4 border rounded-lg">
                                  <p className="font-semibold mb-4">{qIndex + 1}. <ParsedContent content={q.question} /></p>
                                  <RadioGroup
                                      onValueChange={(value) => handleAnswerChange(qIndex, parseInt(value))}
                                      value={q.studentAnswerIndex?.toString()}
                                      disabled={status === 'evaluating'}
                                  >
                                      {q.options.map((opt, oIndex) => (
                                          <div key={oIndex} className="flex items-center space-x-2 p-2 rounded-md">
                                              <RadioGroupItem value={oIndex.toString()} id={`q${qIndex}-o${oIndex}`} />
                                              <Label htmlFor={`q${qIndex}-o${oIndex}`} className="flex-1 cursor-pointer flex items-center gap-2">
                                                  <span className="font-medium">{String.fromCharCode(65 + oIndex)})</span>
                                                  <ParsedContent content={opt} />
                                              </Label>
                                          </div>
                                      ))}
                                  </RadioGroup>
                              </div>
                          ))}
                      </div>
                    )}
                </div>
            )}
          </CardContent>
          {(status === 'ready' || status === 'evaluating') && (
            <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={startNewGuide} disabled={status === 'evaluating'}>Cancelar</Button>
                <Button onClick={handleEvaluateGuide} disabled={status === 'evaluating' || guide?.questions.some(q => q.studentAnswerIndex === null)}>
                    {status === 'evaluating' && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                    Corregir Ensayo
                </Button>
            </CardFooter>
          )}
        </Card>
      ) : status === 'evaluated' && evaluation ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-headline">Resultados del Ensayo</CardTitle>
            <div className="flex justify-between items-center">
              <CardDescription>Aquí puedes ver la corrección de tu ensayo.</CardDescription>
              <div className="text-right">
                <Badge className={cn("text-lg", evaluation.score >= 4.0 ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800')}>
                    Nota: {evaluation.score.toFixed(1)}
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">
                    ({evaluation.correctAnswersCount}/{evaluation.totalQuestionsCount} correctas)
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
             <Alert>
                <BrainCircuit className="h-4 w-4" />
                <AlertTitle>Retroalimentación de LIA</AlertTitle>
                <AlertDescription>{evaluation.feedback}</AlertDescription>
            </Alert>
            <div>
                <h3 className="text-xl font-bold font-headline mb-4">Revisión de Preguntas</h3>
                <div className="space-y-6">
                    {evaluation.correctedQuestions.map((q, qIndex) => (
                        <div key={qIndex} className="p-4 border rounded-lg space-y-4">
                            <p className="font-semibold">{qIndex + 1}. <ParsedContent content={q.question} /></p>
                            <div className="space-y-2">
                                {q.options.map((opt, oIndex) => {
                                    const isCorrectAnswer = oIndex === q.correctAnswerIndex;
                                    const isStudentAnswer = oIndex === q.studentAnswerIndex;
                                    const isCorrectAndStudentAnswer = isCorrectAnswer && isStudentAnswer;

                                    return (
                                        <div key={oIndex} className={cn(
                                            "flex items-center gap-3 p-2 rounded-md border",
                                            isCorrectAndStudentAnswer && "bg-green-500/10 border-green-500/30",
                                            isStudentAnswer && !isCorrectAnswer && "bg-red-500/10 border-red-500/30",
                                            isCorrectAnswer && !isStudentAnswer && "bg-green-500/10 border-green-500/30"
                                        )}>
                                            {isCorrectAnswer ? (
                                                <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                                            ) : isStudentAnswer ? (
                                                <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                                            ) : (
                                                <div className="w-5 h-5 shrink-0" /> // Placeholder for alignment
                                            )}
                                            <div className="flex-1">
                                                <span className="font-medium">{String.fromCharCode(65 + oIndex)})</span> <ParsedContent content={opt} />
                                            </div>
                                            {isCorrectAndStudentAnswer && <Badge variant="secondary" className="bg-green-100 text-green-800">Tu respuesta (correcta)</Badge>}
                                            {isStudentAnswer && !isCorrectAnswer && <Badge variant="secondary" className="bg-red-100 text-red-800">Tu respuesta</Badge>}
                                            {isCorrectAnswer && !isStudentAnswer && <Badge variant="secondary" className="bg-green-100 text-green-800">Respuesta correcta</Badge>}
                                        </div>
                                    );
                                })}
                            </div>
                             {!q.isCorrect && q.explanation && (
                              <Alert className="border-accent">
                                  <Lightbulb className="h-4 w-4 text-accent" />
                                  <AlertTitle>Explicación de LIA</AlertTitle>
                                  <AlertDescription>
                                      <ParsedContent content={q.explanation} />
                                  </AlertDescription>
                              </Alert>
                             )}
                        </div>
                    ))}
                </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
               {viewingHistory ? (
                   <Button onClick={() => { setViewingHistory(false); setEvaluation(null); setStatus('idle'); }}>
                      <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Historial
                  </Button>
               ) : (
                  <>
                      <Button variant="outline" onClick={startNewGuide}>
                          <X className="mr-2 h-4 w-4" />
                          Cerrar
                      </Button>
                      <Button onClick={startNewGuide}>
                          Hacer un nuevo ensayo
                      </Button>
                  </>
               )}
          </CardFooter>
        </Card>
      ) : null}

        <div className={cn(status === 'evaluated' && !viewingHistory && "hidden")}>
            <h2 className="text-2xl font-bold font-headline mb-4 flex items-center gap-2">
                <History className="w-6 h-6 text-primary" />
                Historial de Ensayos
            </h2>
             <Card>
                <CardContent className="pt-6">
                    {evaluatedGuides.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Materia</TableHead>
                                    <TableHead>Título</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Nota</TableHead>
                                    <TableHead>Puntaje</TableHead>
                                    <TableHead>Puntos Ranking</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {evaluatedGuides.map(guide => {
                                    const subject = subjects.find(s => s.id === guide.subjectId);
                                    const scoreColor = guide.score >= 4.0 ? 'text-blue-600' : 'text-red-600';
                                    return (
                                        <TableRow key={guide.id}>
                                            <TableCell className="font-medium">{subject?.title || 'Desconocida'}</TableCell>
                                            <TableCell>{guide.title}</TableCell>
                                            <TableCell>{format(guide.createdAt, "d 'de' MMMM, yyyy", { locale: es })}</TableCell>
                                            <TableCell className={`font-bold ${scoreColor}`}>
                                                {guide.score.toFixed(1)}
                                            </TableCell>
                                             <TableCell>
                                                {guide.correctAnswersCount}/{guide.totalQuestionsCount}
                                            </TableCell>
                                            <TableCell className="font-bold text-amber-600">
                                                <div className="flex items-center gap-1">
                                                    <Trophy className="w-4 h-4 text-amber-500" />
                                                    {guide.rankingPoints}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                  <DropdownMenuTrigger asChild>
                                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                                      <MoreHorizontal className="h-4 w-4" />
                                                      <span className="sr-only">Toggle menu</span>
                                                    </Button>
                                                  </DropdownMenuTrigger>
                                                  <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleReviewGuide(guide)}>Revisar Corrección</DropdownMenuItem>
                                                    <DropdownMenuItem
                                                      className="text-destructive"
                                                      onClick={() => setGuideToDelete(guide.id)}
                                                    >
                                                      Eliminar
                                                    </DropdownMenuItem>
                                                  </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">
                            Aún no has completado ningún ensayo. ¡Genera uno para empezar a practicar!
                        </p>
                    )}
                </CardContent>
             </Card>
        </div>
        <AlertDialog open={!!guideToDelete} onOpenChange={(isOpen) => !isOpen && setGuideToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. Se eliminará el ensayo y su corrección permanentemente.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleDeleteGuide();
                        }}
                        className="bg-destructive hover:bg-destructive/90"
                    >
                        Eliminar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}

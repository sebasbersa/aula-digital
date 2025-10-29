
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getMembersByOwnerId } from '@/services/members';
import { getGrades } from '@/services/grades';
import { getSubjects } from '@/services/subjects';
import { getPracticeGuides } from '@/services/practiceGuides';
import { getTutoringSessions, type TutoringSession } from '@/services/tutoringSessions';
import type { Member, Grade, Subject, PracticeGuideResult } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, BookOpen, FileText, BrainCircuit, Loader, AlertTriangle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { GradesChart } from '@/components/grades-chart';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { generateGuardianFeedback } from '@/ai/flows/generate-guardian-feedback';

function ProgressReportSkeleton() {
    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>
            <div className="grid lg:grid-cols-3 gap-8 items-start">
                 <div className="lg:col-span-3">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-1/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-12 w-full" />
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-3">
                    <Skeleton className="h-80 w-full" />
                </div>
            </div>
        </div>
    );
}

export default function ProgressReportPage() {
    const params = useParams();
    const router = useRouter();
    const memberId = params.memberId as string;

    const [member, setMember] = useState<Member | null>(null);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [practiceGuides, setPracticeGuides] = useState<PracticeGuideResult[]>([]);
    const [sessions, setSessions] = useState<TutoringSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
    const [feedbackError, setFeedbackError] = useState<string | null>(null);

    const subjectMap = useMemo(() => {
        return subjects.reduce((acc, subject) => {
            acc[subject.id] = subject;
            return acc;
        }, {} as Record<string, Subject>);
    }, [subjects]);
    
    const fetchFeedback = useCallback(async (student: Member, studentSubjects: Subject[], studentGrades: Grade[], studentGuides: PracticeGuideResult[], studentSessions: TutoringSession[]) => {
        setIsFeedbackLoading(true);
        setFeedbackError(null);
        try {
            const performanceData = studentSubjects.map(subject => {
                 const subjectGrades = studentGrades.filter(g => g.subjectId === subject.id);
                 const averageGrade = subjectGrades.length > 0
                    ? parseFloat((subjectGrades.reduce((sum, g) => sum + g.grade, 0) / subjectGrades.length).toFixed(1))
                    : undefined;

                return {
                    subjectName: subject.title,
                    averageGrade,
                    practiceGuidesCompleted: studentGuides.filter(g => g.subjectId === subject.id).length,
                    tutoringSessions: studentSessions.filter(s => s.subjectId === subject.id).length,
                }
            });

            const { feedback: generatedFeedback } = await generateGuardianFeedback({
                studentName: student.name,
                performanceData: performanceData
            });
            setFeedback(generatedFeedback);

        } catch (error: any) {
            console.error("Failed to generate feedback", error);
            if (error.message && error.message.includes('429')) {
                setFeedbackError('Se ha alcanzado el límite de uso diario para esta función. Por favor, inténtalo de nuevo mañana.');
            } else {
                setFeedback(null); // No mostrar error para otros casos, solo no mostrar el feedback
            }
        } finally {
            setIsFeedbackLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!memberId) {
            router.push('/select-profile');
            return;
        }

        async function loadData() {
            setLoading(true);
            try {
                const [allMembers, gradesData, subjectsData, guidesData, sessionsData] = await Promise.all([
                    getMembersByOwnerId(sessionStorage.getItem('selectedProfile') ? JSON.parse(sessionStorage.getItem('selectedProfile')!).ownerId : ''),
                    getGrades(memberId),
                    getSubjects(),
                    getPracticeGuides(memberId),
                    getTutoringSessions(memberId),
                ]);

                const currentMember = allMembers.find(m => m.id === memberId) || null;
                setMember(currentMember);
                setGrades(gradesData);
                setSubjects(subjectsData);
                setPracticeGuides(guidesData);
                setSessions(sessionsData);
                
                if (currentMember) {
                    await fetchFeedback(currentMember, subjectsData, gradesData, guidesData, sessionsData);
                }

            } catch (error) {
                console.error("Failed to load progress data", error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [memberId, router, fetchFeedback]);
    

    if (loading) {
        return <ProgressReportSkeleton />;
    }

    if (!member) {
        return <div>No se encontró el perfil del estudiante.</div>;
    }

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div>
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={member.avatarUrl} alt={member.name} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-3xl font-bold font-headline">Informe de Progreso de {member.name}</h1>
                        <p className="text-muted-foreground">{member.grade}</p>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-start">
                {(isFeedbackLoading || feedback || feedbackError) && (
                    <div className="lg:col-span-3">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><BrainCircuit /> Análisis y Recomendación de LIA</CardTitle>
                                <CardDescription>Un consejo para ayudar a {member.name} a alcanzar su máximo potencial.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isFeedbackLoading ? (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Loader className="w-4 h-4 animate-spin" />
                                        <span>LIA está analizando el progreso de {member.name}...</span>
                                    </div>
                                ) : feedbackError ? (
                                    <Alert variant="destructive">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertTitle>No se pudo generar el análisis</AlertTitle>
                                        <AlertDescription>{feedbackError}</AlertDescription>
                                    </Alert>
                                ) : feedback ? (
                                     <Alert>
                                        <AlertDescription>{feedback}</AlertDescription>
                                    </Alert>
                                ) : null}
                            </CardContent>
                        </Card>
                    </div>
                )}


                <div className="lg:col-span-3">
                    <GradesChart grades={grades} subjects={subjects} />
                </div>
                
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><FileText /> Ensayos Realizados</CardTitle>
                        <CardDescription>Resultados de los ensayos de práctica completados.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {practiceGuides.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Materia</TableHead>
                                        <TableHead>Título</TableHead>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead className="text-right">Nota</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {practiceGuides.map(guide => (
                                        <TableRow key={guide.id}>
                                            <TableCell>{subjectMap[guide.subjectId]?.title || 'N/A'}</TableCell>
                                            <TableCell>{guide.title}</TableCell>
                                            <TableCell>{format(guide.createdAt, "dd/MM/yy")}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant={guide.score >= 4.0 ? 'default' : 'destructive'}>
                                                    {guide.score.toFixed(1)}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-muted-foreground text-center py-8">Aún no ha realizado ningún ensayo.</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BookOpen /> Lecciones Guardadas</CardTitle>
                         <CardDescription>Tutorías con LIA que ha guardado para revisar.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {sessions.length > 0 ? (
                            <div className="space-y-2">
                               {sessions.map(session => (
                                   <div key={session.id} className="p-3 border rounded-md text-sm">
                                       <p className="font-semibold">{session.title}</p>
                                       <p className="text-xs text-muted-foreground">{subjectMap[session.subjectId]?.title} - {format(session.createdAt, "d MMM, yyyy", { locale: es })}</p>
                                   </div>
                               ))}
                            </div>
                        ) : (
                             <p className="text-muted-foreground text-center py-8">Aún no ha guardado ninguna lección.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

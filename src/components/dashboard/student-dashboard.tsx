
'use client';

import Link from 'next/link';
import { 
    AlertTriangle,
    BookOpen, 
    Target, 
    Zap,
    Lightbulb,
    CalendarCheck,
    Award,
    Flame,
    Goal,
    Share2,
    Trophy,
    Save,
    FileText
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Member, Test, Grade, Subject, PracticeGuideResult } from '@/lib/types';
import React, { useEffect, useState, useMemo } from 'react';
import { getTests } from '@/services/tests';
import { getTutoringSessions, TutoringSession } from '@/services/tutoringSessions';
import { getGrades } from '@/services/grades';
import { getSubjects } from '@/services/subjects';
import { getPracticeGuides } from '@/services/practiceGuides';
import { Skeleton } from '../ui/skeleton';
import { format, isWithinInterval, addDays, startOfWeek, endOfWeek, isSameWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { Progress } from '../ui/progress';
import { ShareStreakDialog } from '../share-streak-dialog';
import { cn } from '@/lib/utils';
import { GradesChart } from '../grades-chart';


function SuggestionCard({ text, href, icon: Icon, className }: { text: string, href: string, icon: React.ElementType, className?: string }) {
    return (
        <Link href={href} className={cn("block hover:no-underline", className)}>
            <Card className="hover:border-primary transition-colors h-full">
                <CardHeader className="flex-row items-center gap-4 space-y-0">
                    <div className="p-2 bg-secondary rounded-full">
                        <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-base font-semibold">{text}</CardTitle>
                </CardHeader>
            </Card>
        </Link>
    )
}

function RankingCard({ score }: { score: number }) {
    return (
        <Link href="/student/ranking" className="hover:no-underline block h-full">
         <Card className="bg-amber-400/10 border-amber-500/30 flex flex-col justify-between h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <Trophy className="w-6 h-6 text-amber-500" />
                    Puntaje Total
                </CardTitle>
                 <CardDescription>¡Sigue sumando puntos!</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-4xl font-bold text-amber-600 dark:text-amber-400">{score.toLocaleString('es-CL')}</p>
                <p className="text-xs text-muted-foreground mt-2">Haz clic para ver el ranking</p>
            </CardContent>
        </Card>
        </Link>
    )
}

function DashboardSkeleton() {
    return (
        <div className="grid gap-8">
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
            </div>
            <div className="space-y-4">
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-24 w-full" />
            </div>
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Skeleton className="h-36 w-full" />
                <Skeleton className="h-36 w-full" />
            </div>
             <div className="space-y-2">
                <h2 className="text-2xl font-bold font-headline mb-4"><Skeleton className="h-6 w-56" /></h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            </div>
        </div>
    )
}

const calculateWeeklyStreak = (sessions: TutoringSession[], guides: PracticeGuideResult[]): number => {
    const LESSON_GOAL = 3;
    const GUIDE_GOAL = 3;

    if (sessions.length === 0 && guides.length === 0) {
        return 0;
    }

    const activities = [
        ...sessions.map(s => ({ date: s.updatedAt || s.createdAt, type: 'lesson' })),
        ...guides.map(g => ({ date: g.createdAt, type: 'guide' })),
    ];
    activities.sort((a, b) => a.date.getTime() - b.date.getTime());

    const weeklyGoals: { [week: string]: { lessons: Set<string>; guides: Set<string> } } = {};

    activities.forEach((activity, index) => {
        // Use a simple unique key for each activity to prevent double counting
        const activityId = `${activity.type}-${index}`; 
        const weekStart = startOfWeek(activity.date, { weekStartsOn: 1 });
        const weekKey = format(weekStart, 'yyyy-MM-dd');

        if (!weeklyGoals[weekKey]) {
            weeklyGoals[weekKey] = { lessons: new Set(), guides: new Set() };
        }

        if (activity.type === 'lesson') {
            weeklyGoals[weekKey].lessons.add(activityId);
        } else if (activity.type === 'guide') {
            weeklyGoals[weekKey].guides.add(activityId);
        }
    });

    const sortedWeeks = Object.keys(weeklyGoals).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    let currentStreak = 0;
    const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

    for (let i = 0; i < sortedWeeks.length; i++) {
        const weekKey = sortedWeeks[i];
        const weekStartDate = new Date(weekKey);
        
        // Break if we are looking at a future week (should not happen with sorted data)
        if (weekStartDate > thisWeekStart) continue;

        const goal = weeklyGoals[weekKey];
        const metGoal = goal.lessons.size >= LESSON_GOAL && goal.guides.size >= GUIDE_GOAL;

        if (metGoal) {
            // Check for consecutive weeks
            if (i > 0) {
                const prevWeekKey = sortedWeeks[i-1];
                const prevWeekDate = new Date(prevWeekKey);
                // If the difference is more than 1 week, the streak is broken
                if ((prevWeekDate.getTime() - weekStartDate.getTime()) > (7 * 24 * 60 * 60 * 1000 + 1000)) {
                    break;
                }
            }
            currentStreak++;
        } else {
             // If goal was not met in the most recent week of activity, streak is 0
            if(i === 0 && isSameWeek(new Date(), weekStartDate, { weekStartsOn: 1 })) {
                 // The current week's activity doesn't break the streak, just doesn't add to it yet.
                 // We need to check the previous week
                 continue;
            }
            break;
        }
    }
    
    // Check if the last week of met goals was the previous week or this week
    if (sortedWeeks.length > 0) {
        const lastMetWeekKey = sortedWeeks.find(weekKey => 
            (weeklyGoals[weekKey].lessons.size >= LESSON_GOAL) && (weeklyGoals[weekKey].guides.size >= GUIDE_GOAL)
        );
        if (lastMetWeekKey) {
            const lastMetWeekDate = new Date(lastMetWeekKey);
            const today = new Date();
            const lastWeekStart = startOfWeek(addDays(today, -7), { weekStartsOn: 1 });
             if (!isSameWeek(lastMetWeekDate, thisWeekStart, { weekStartsOn: 1 }) && !isSameWeek(lastMetWeekDate, lastWeekStart, { weekStartsOn: 1 })) {
                 return 0; // Streak is broken if the last success wasn't this or last week
             }
        }
    }


    return currentStreak;
};


export function StudentDashboard({ userName }: { userName: string }) {
  const [upcomingTests, setUpcomingTests] = useState<Test[]>([]);
  const [sessions, setSessions] = useState<TutoringSession[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [practiceGuides, setPracticeGuides] = useState<PracticeGuideResult[]>([]);
  const [lastSession, setLastSession] = useState<TutoringSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentProfile, setCurrentProfile] = useState<Member | null>(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [hasShared, setHasShared] = useState(false);

  useEffect(() => {
    async function loadStudentData() {
        const profileString = sessionStorage.getItem('selectedProfile');
        if (profileString) {
            const profile = JSON.parse(profileString);
            setCurrentProfile(profile);

            const twoWeeksFromNow = addDays(new Date(), 14);
            const now = new Date();
            
            const [testsData, sessionsData, gradesData, subjectsData, guidesData] = await Promise.all([
                getTests(profile.id),
                getTutoringSessions(profile.id),
                getGrades(profile.id),
                getSubjects(),
                getPracticeGuides(profile.id)
            ]);
            
            const recentTests = testsData.filter(test => 
                isWithinInterval(new Date(test.date), { start: now, end: twoWeeksFromNow })
            );

            setUpcomingTests(recentTests);
            setSessions(sessionsData);
            setGrades(gradesData);
            setSubjects(subjectsData);
            setPracticeGuides(guidesData);
            
            if(sessionsData.length > 0) {
                setLastSession(sessionsData[0]); // Sessions are sorted by date descending
            }
        }
        setLoading(false);
    }
    loadStudentData();
  }, []);
  
  const weeklyStreak = useMemo(() => calculateWeeklyStreak(sessions, practiceGuides), [sessions, practiceGuides]);

  const weeklyProgress = useMemo(() => {
    const startOfThisWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
    const endOfThisWeek = endOfWeek(new Date(), { weekStartsOn: 1 });

    const lessonsThisWeek = sessions.filter(s => 
        isWithinInterval(s.updatedAt || s.createdAt, { start: startOfThisWeek, end: endOfThisWeek })
    ).length;

    const guidesThisWeek = practiceGuides.filter(g => 
        isWithinInterval(g.createdAt, { start: startOfThisWeek, end: endOfThisWeek })
    ).length;

    return {
        lessons: lessonsThisWeek,
        guides: guidesThisWeek,
        shared: hasShared,
        lessonGoal: 3,
        guideGoal: 3,
        shareGoal: 1,
    };
  }, [sessions, practiceGuides, hasShared]);
  
  const reinforcementSubjectInfo = useMemo(() => {
    if (grades.length === 0) return null;

    const gradesBySubject: Record<string, Grade[]> = grades.reduce((acc, grade) => {
        if (!acc[grade.subjectId]) acc[grade.subjectId] = [];
        acc[grade.subjectId].push(grade);
        return acc;
    }, {} as Record<string, Grade[]>);

    let lowestAverage = 8.0;
    let lowestSubjectId: string | null = null;
    let lowestGradeTopic = '';

    Object.entries(gradesBySubject).forEach(([subjectId, subjectGrades]) => {
        const average = subjectGrades.reduce((sum, g) => sum + g.grade, 0) / subjectGrades.length;
        if (average < lowestAverage) {
            lowestAverage = average;
            lowestSubjectId = subjectId;
            // Find the specific grade entry with the lowest score in this subject
            const lowestGradeInSubject = [...subjectGrades].sort((a, b) => a.grade - b.grade)[0];
            lowestGradeTopic = lowestGradeInSubject.description;
        }
    });

    if (!lowestSubjectId) return null;

    const subject = subjects.find(s => s.id === lowestSubjectId);
    if (!subject) return null;

    return {
        subject,
        topic: lowestGradeTopic,
    };
}, [grades, subjects]);

const reinforcementLink = useMemo(() => {
    if (reinforcementSubjectInfo) {
        const { subject, topic } = reinforcementSubjectInfo;
        const prompt = `Hola LIA, necesito ayuda para reforzar mis conocimientos en ${subject.title}, especialmente con el tema de ${topic}, ya que es donde tengo la nota más baja.`;
        return `/student/subjects/${subject.id}?prompt=${encodeURIComponent(prompt)}`;
    }
    return '/student/grades'; // Fallback if no grades are available
}, [reinforcementSubjectInfo]);


  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <>
    <ShareStreakDialog
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        streakCount={weeklyStreak}
        userName={userName}
        onShared={() => setHasShared(true)}
    />
    <div className="grid gap-8">
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold font-headline">Hola, {userName} 👋</h1>
        <p className="text-muted-foreground">¡Es un gran día para aprender algo nuevo!</p>
      </div>
      
      {upcomingTests.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold font-headline mb-4 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-destructive" />
                Alertas (Próximas 2 Semanas)
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {upcomingTests.map(test => {
                    const studyPrompt = `Hola LIA, tengo una prueba y necesito estudiar estos temas: ${test.topics}. ¿Puedes ayudarme a prepararme?`;
                    const encodedPrompt = encodeURIComponent(studyPrompt);
                    return (
                        <Card key={test.id} className="border-destructive/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                <CalendarCheck className="w-5 h-5 text-destructive" />
                                    Prueba Próxima
                                </CardTitle>
                                <CardDescription>
                                    <span className="font-semibold capitalize">{format(new Date(test.date), "EEEE, d 'de' MMMM", { locale: es })}</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">{test.topics}</p>
                                <Button asChild className="w-full" variant="destructive">
                                <Link href={`/student/subjects/${test.subjectId}?prompt=${encodedPrompt}`}>
                                    Empezar a Estudiar
                                </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )
                 })}
            </div>
          </div>
      )}

      <div>
          <h2 className="text-2xl font-bold font-headline mb-4">Sugerencias para Ti</h2>
          <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <SuggestionCard text="Registrar mis notas" href="/student/grades" icon={Award} />
                  <SuggestionCard text="Reforzar materia con notas más bajas" href={reinforcementLink} icon={Target} />
                  <SuggestionCard text="Ver lecciones guardadas" href="/student/subjects" icon={Save}/>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {lastSession && (
                      <Card>
                          <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                              <BookOpen className="w-5 h-5 text-accent" />
                              Continuar Lección
                              </CardTitle>
                              <CardDescription>{lastSession.title}</CardDescription>
                          </CardHeader>
                          <CardContent>
                              <Button asChild variant="outline" className="w-full" onClick={() => {
                                  sessionStorage.setItem('resumeSession', JSON.stringify(lastSession));
                              }}>
                              <Link href={`/student/subjects/${lastSession.subjectId}`}>Continuar</Link>
                              </Button>
                          </CardContent>
                      </Card>
                  )}
                  <Card className={cn("bg-primary text-primary-foreground", !lastSession && "md:col-span-2")}>
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                          <Zap className="w-5 h-5" />
                          Práctica Diaria
                          </CardTitle>
                          <CardDescription className="text-primary-foreground/80">15 minutos para reforzar</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <Button asChild variant="secondary" className="w-full">
                          <Link href="/student/subjects">Elegir Materia</Link>
                          </Button>
                      </CardContent>
                  </Card>
                  <Card className="h-full">
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-400" />
                            Ensaya una prueba
                          </CardTitle>
                          <CardDescription>Prepárate para tus evaluaciones</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <Button asChild variant="outline" className="w-full">
                            <Link href="/student/practice-guides">Comenzar Ensayo</Link>
                          </Button>
                      </CardContent>
                  </Card>
              </div>
          </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold font-headline mb-4">Tu Progreso</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <RankingCard score={currentProfile?.score || 0} />
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>Racha Semanal</span>
                <Flame className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{weeklyStreak} {weeklyStreak === 1 ? 'semana' : 'semanas'}</div>
              <p className="text-xs text-muted-foreground">¡Sigue así!</p>
            </CardContent>
             <CardContent>
                <Button size="sm" className="w-full bg-gradient-to-r from-orange-400 to-rose-400 text-white shadow-lg hover:scale-105 transition-transform" onClick={() => setIsShareDialogOpen(true)}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Compartir Racha
                </Button>
            </CardContent>
          </Card>
           <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Meta Semanal</CardTitle>
                    <Goal className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="font-medium">Lecciones Completadas</span>
                                <span className="text-muted-foreground">{weeklyProgress.lessons}/{weeklyProgress.lessonGoal}</span>
                            </div>
                            <Progress value={(weeklyProgress.lessons / weeklyProgress.lessonGoal) * 100} />
                        </div>
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="font-medium">Ensayos Resueltos</span>
                                <span className="text-muted-foreground">{weeklyProgress.guides}/{weeklyProgress.guideGoal}</span>
                            </div>
                            <Progress value={(weeklyProgress.guides / weeklyProgress.guideGoal) * 100} />
                        </div>
                         <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="font-medium">Compartir Logro</span>
                                <span className="text-muted-foreground">{weeklyProgress.shared ? 1 : 0}/{weeklyProgress.shareGoal}</span>
                            </div>
                            <Progress value={weeklyProgress.shared ? 100 : 0} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
      
      <div>
        <GradesChart grades={grades} subjects={subjects} />
      </div>

    </div>
    </>
  );
}

    

'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import type { Subject, Role, Member, PracticeGuideResult } from '@/lib/types';
import { getAdultSubjects } from '@/services/subjects';
import { SubjectCard } from '../subject-card';
import { Skeleton } from '../ui/skeleton';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Lightbulb, Zap, Users, BrainCircuit, Users2, Flame, Share2, Goal, Trophy, FileText } from 'lucide-react';
import Link from 'next/link';
import { useFamily } from '@/contexts/family-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { getTutoringSessions, type TutoringSession } from '@/services/tutoringSessions';
import { getPracticeGuides } from '@/services/practiceGuides';
import { format, isWithinInterval, startOfWeek, endOfWeek, addDays, isSameWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { ShareStreakDialog } from '../share-streak-dialog';
import { Progress } from '../ui/progress';
import { cn } from '@/lib/utils';

function SuggestionCard({ text, href, icon: Icon, className }: { text: string, href: string, icon: React.ElementType, className?: string }) {
    return (
        <Link href={href} className="block hover:no-underline h-full">
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
        <Link href="/adult_learner/ranking" className="hover:no-underline block h-full">
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
        
        if (weekStartDate > thisWeekStart) continue;

        const goal = weeklyGoals[weekKey];
        const metGoal = goal.lessons.size >= LESSON_GOAL && goal.guides.size >= GUIDE_GOAL;

        if (metGoal) {
            if (i > 0) {
                const prevWeekKey = sortedWeeks[i-1];
                const prevWeekDate = new Date(prevWeekKey);
                if ((prevWeekDate.getTime() - weekStartDate.getTime()) > (7 * 24 * 60 * 60 * 1000 + 1000)) {
                    break;
                }
            }
            currentStreak++;
        } else {
            if(i === 0 && isSameWeek(new Date(), weekStartDate, { weekStartsOn: 1 })) {
                 continue;
            }
            break;
        }
    }
    
    if (sortedWeeks.length > 0) {
        const lastMetWeekKey = sortedWeeks.find(weekKey => 
            (weeklyGoals[weekKey].lessons.size >= LESSON_GOAL) && (weeklyGoals[weekKey].guides.size >= GUIDE_GOAL)
        );
        if (lastMetWeekKey) {
            const lastMetWeekDate = new Date(lastMetWeekKey);
            const today = new Date();
            const lastWeekStart = startOfWeek(addDays(today, -7), { weekStartsOn: 1 });
             if (!isSameWeek(lastMetWeekDate, thisWeekStart, { weekStartsOn: 1 }) && !isSameWeek(lastMetWeekDate, lastWeekStart, { weekStartsOn: 1 })) {
                 return 0;
             }
        }
    }

    return currentStreak;
};


export function AdultDashboard({ userName }: { userName: string }) {
  const { members: allMembers, loading: familyLoading } = useFamily();
  const { toast } = useToast();
  const [studentMembers, setStudentMembers] = useState<Member[]>([]);
  const [sessions, setSessions] = useState<TutoringSession[]>([]);
  const [practiceGuides, setPracticeGuides] = useState<PracticeGuideResult[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [currentProfile, setCurrentProfile] = useState<Member | null>(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [hasShared, setHasShared] = useState(false);

  useEffect(() => {
    if (allMembers) {
        setStudentMembers(allMembers.filter(m => m.role === 'student'));
    }
  }, [allMembers]);

  useEffect(() => {
    async function loadAdultData() {
        const profileString = sessionStorage.getItem('selectedProfile');
        if (profileString) {
            const profile = JSON.parse(profileString) as Member;
            setCurrentProfile(profile);

            if (profile.role === 'adult_learner') {
                try {
                    const [sessionsData, guidesData] = await Promise.all([
                        getTutoringSessions(profile.id),
                        getPracticeGuides(profile.id)
                    ]);
                    setSessions(sessionsData);
                    setPracticeGuides(guidesData);
                } catch (error) {
                    console.error("Failed to load adult data", error);
                    toast({
                        title: "Error",
                        description: "No se pudieron cargar tus datos de progreso.",
                        variant: "destructive"
                    });
                }
            }
        }
        setLoadingData(false);
    }
    loadAdultData();
  }, [toast]);

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
      <div>
        <h1 className="text-3xl font-bold font-headline">Hola, {userName} 👋</h1>
        <p className="text-muted-foreground">¡Invierte en ti y apoya a tu familia, un paso a la vez!</p>
      </div>
      
      {studentMembers.length > 0 && (
         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users2 className="w-5 h-5" />
                    Resumen Familiar
                </CardTitle>
                 <CardDescription>Supervisa el progreso y apoya el aprendizaje de tu familia.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {familyLoading ? (
                    <p>Cargando información familiar...</p>
                ) : (
                    studentMembers.map(member => (
                    <div key={member.id} className="flex items-center gap-4">
                        <Avatar>
                            <AvatarImage src={member.avatarUrl} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                            <p className="font-semibold">{member.name}</p>
                            <p className="text-sm text-muted-foreground">Aún sin actividad registrada</p>
                        </div>
                        <Button asChild variant="ghost" size="sm">
                           <Link href={`/adult_learner/progress/${member.id}`}>Ver Detalles</Link>
                        </Button>
                    </div>
                ))
                )}
            </CardContent>
        </Card>
      )}

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
             <CardFooter>
                <Button size="sm" className="w-full bg-gradient-to-r from-orange-400 to-rose-400 text-white shadow-lg hover:scale-105 transition-transform" onClick={() => setIsShareDialogOpen(true)}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Compartir Racha
                </Button>
            </CardFooter>
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
        <h2 className="text-2xl font-bold font-headline mb-4">Sugerencias para Ti</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SuggestionCard text="Explorar todas las materias" href="/adult_learner/subjects" icon={Lightbulb} />
             <Card className="bg-primary text-primary-foreground">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Práctica Diaria
                    </CardTitle>
                    <CardDescription className="text-primary-foreground/80">15 minutos para potenciar tus habilidades</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild variant="secondary" className="w-full">
                    <Link href="/adult_learner/subjects">Elegir Materia</Link>
                    </Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-400" />
                        Ensaya una prueba
                    </CardTitle>
                    <CardDescription>Prepárate y mide tus conocimientos</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/adult_learner/practice-guides">Comenzar Ensayo</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>

       {sessions.length > 0 && (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5" />
                    Tus Lecciones Guardadas
                </CardTitle>
                <CardDescription>Continúa donde lo dejaste y sigue aprendiendo.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
                {sessions.slice(0, 4).map(session => (
                    <div key={session.id} className="flex items-center justify-between p-3 border rounded-md">
                        <div>
                            <p className="font-semibold">{session.title}</p>
                            <p className="text-xs text-muted-foreground">
                                Actualizado: {format(session.updatedAt, "d 'de' MMMM", { locale: es })}
                            </p>
                        </div>
                        <Button asChild variant="secondary" size="sm">
                            <Link href={`/adult_learner/subjects/${session.subjectId}`}>Continuar</Link>
                        </Button>
                    </div>
                ))}
            </CardContent>
        </Card>
      )}
    </div>
    </>
  );
}

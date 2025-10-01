
'use client';

import { getSubjectById } from '@/services/subjects';
import { notFound, useParams, useRouter } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import Link from 'next/link';
import type { Role, Subject, Member } from '@/lib/types';
import { HomeworkHelperClient } from '@/components/homework-helper-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState, Suspense, useCallback } from 'react';
import {
    Book,
    BrainCircuit,
    Calculator,
    FlaskConical,
    Globe,
    Languages,
    type LucideProps,
    Atom,
    Leaf,
    Megaphone,
    Mic,
    CookingPot,
    History,
    Martini
} from 'lucide-react';
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { getTutoringSessions, deleteTutoringSession, type TutoringSession } from '@/services/tutoringSessions';
import { useToast } from '@/hooks/use-toast';
import { SavedTutoringSession } from '@/components/saved-tutoring-session';

const iconMap: { [key: string]: React.FC<LucideProps> } = {
  Calculator,
  Book,
  FlaskConical,
  Globe,
  Languages,
  BrainCircuit,
  Atom,
  Leaf,
  Megaphone,
  Mic,
  CookingPot,
  Martini,
};

function SubjectDetailSkeleton() {
    return (
        <div className="container mx-auto py-8 space-y-8">
            <Skeleton className="h-6 w-48" />
            <div className="text-center space-y-4">
                <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                <Skeleton className="h-10 w-1/2 mx-auto" />
                <Skeleton className="h-5 w-3/4 mx-auto" />
            </div>
            <div className="max-w-4xl mx-auto">
                <Skeleton className="h-[70vh] w-full" />
            </div>
        </div>
    )
}

function SubjectDetailContent() {
  const params = useParams<{ role: Role; subjectId: string }>();
  const router = useRouter();
  const { role, subjectId } = params;
  const { toast } = useToast();
  
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedSessions, setSavedSessions] = useState<TutoringSession[]>([]);
  const [resumedSessionData, setResumedSessionData] = useState<TutoringSession | null>(null);

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
    async function fetchSubjectData() {
      setLoading(true);
      const profileString = sessionStorage.getItem('selectedProfile');
      let profile: Member | null = null;
      if (profileString) {
          profile = JSON.parse(profileString);
      }

      const subjectData = await getSubjectById(subjectId);
      if (!subjectData) {
        notFound();
      }
      setSubject(subjectData);

      if (subjectData.id === 'cocina') {
        router.replace(`/${role}/subjects/cocina/recipes`);
        return;
      }
       if (subjectData.id === 'cocktails-mocktails') {
        router.replace(`/${role}/subjects/cocktails-mocktails/recipes`);
        return;
      }
      
      if (subjectData.hasCurriculum) {
        router.replace(`/${role}/subjects/${subjectId}/curriculum`);
        return;
      }
      
      if (profile) {
        await loadSavedSessions(profile.id);
      }

      setLoading(false);
    }
    fetchSubjectData();
  }, [subjectId, role, router, loadSavedSessions]);
  
  const handleSessionSaved = useCallback(async () => {
    const profileString = sessionStorage.getItem('selectedProfile');
    if (profileString) {
        const profile = JSON.parse(profileString);
        await loadSavedSessions(profile.id);
    }
  }, [loadSavedSessions]);

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


  if (loading || !subject || subject.hasCurriculum || subject.id === 'cocina' || subject.id === 'cocktails-mocktails') {
    return <SubjectDetailSkeleton />;
  }
  
  const IconComponent = iconMap[subject.icon];

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
              <BreadcrumbPage>{subject.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="text-center">
        {IconComponent && <IconComponent className={cn(`w-12 h-12 mx-auto`, `text-${subject.color}-500`)} />}
        <h1 className="text-4xl font-bold font-headline mt-2">
          {subject.title}
        </h1>
        <p className="text-muted-foreground mt-2 text-lg max-w-2xl mx-auto">
          ¿Atascado con un ejercicio o no entiendes un tema? Pide ayuda a LIA. Escribe, graba tu duda o sube una foto de tu guía.
        </p>
      </div>
      
      <div className="space-y-8">
        <Card className="bg-secondary/50">
          <CardHeader>
            <CardTitle>Tutoría con LIA</CardTitle>
            <CardDescription>
              Conversa con LIA para resolver cualquier duda que tengas sobre {subject.title}.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <HomeworkHelperClient 
                subject={subject} 
                resumedSession={resumedSessionData}
                onSessionSaved={handleSessionSaved}
             />
          </CardContent>
        </Card>

        {savedSessions.length > 0 && (
            <div className="space-y-4">
                <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
                    <History className="w-6 h-6 text-primary" />
                    Lecciones Guardadas de {subject.title}
                </h2>
                <Card>
                    <CardContent className="pt-6 space-y-2">
                        {savedSessions.map(session => (
                            <SavedTutoringSession
                                key={session.id}
                                session={session}
                                onDelete={handleDeleteSession}
                                onResume={(sessionToResume) => {
                                    setResumedSessionData(sessionToResume);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                onCreatePracticeGuide={handleCreatePracticeGuide}
                                levelAndUnitDisplay={`Lección de reforzamiento`}
                            />
                        ))}
                    </CardContent>
                </Card>
            </div>
        )}
      </div>

    </div>
  );
}

export default function SubjectDetailPage() {
  return (
    <Suspense fallback={<SubjectDetailSkeleton />}>
      <SubjectDetailContent />
    </Suspense>
  )
}


'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { SubjectCard } from '@/components/subject-card';
import type { Role, Subject, Member } from '@/lib/types';
import { getSubjects, getAdultSubjects } from '@/services/subjects';
import { getTutoringSessions, type TutoringSession } from '@/services/tutoringSessions';
import { getRecipes } from '@/services/recipes';
import { Skeleton } from '@/components/ui/skeleton';

export default function SubjectsPage() {
  const params = useParams();
  const role = params.role as Role;
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sessions, setSessions] = useState<TutoringSession[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentProfile, setCurrentProfile] = useState<Member | null>(null);

  useEffect(() => {
    async function loadData() {
      const profileString = sessionStorage.getItem('selectedProfile');
      if (profileString) {
        const profile = JSON.parse(profileString) as Member;
        setCurrentProfile(profile);

        let subjectsData: Subject[] = [];
        let sessionsData: TutoringSession[] = [];
        let recipesData: any[] = [];

        if (profile.role === 'adult_learner') {
          [subjectsData, sessionsData, recipesData] = await Promise.all([
            getAdultSubjects(),
            getTutoringSessions(profile.id),
            getRecipes(profile.id)
          ]);
        } else {
          [subjectsData, sessionsData, recipesData] = await Promise.all([
            getSubjects(profile.grade),
            getTutoringSessions(profile.id),
            getRecipes(profile.id)
          ]);
        }

        setSubjects(subjectsData);
        setSessions(sessionsData);
        setRecipes(recipesData);
      }
      setLoading(false);
    }
    loadData();
  }, [role]);

  // ✅ CORREGIDO: cada materia solo cuenta sus propias recetas
  const getSessionCountForSubject = (subjectId: string) => {
    const sessionCount = sessions.filter(session => session.subjectId === subjectId).length;

    // Contar SOLO las recetas del subject actual
    const recipeCount = recipes.filter(recipe => recipe.subjectId === subjectId).length;

    return sessionCount + recipeCount;
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-headline">Materias</h1>
        <p className="text-muted-foreground mt-2">
          Explora todas las áreas de conocimiento que tenemos para ti.
        </p>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      ) : subjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {subjects.map((subject) => (
            <SubjectCard 
              key={subject.id} 
              subject={subject} 
              role={role}
              savedSessionsCount={getSessionCountForSubject(subject.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold">Aún no hay materias</h2>
          <p className="text-muted-foreground mt-2">
            No hay materias asignadas para este nivel o contacta al administrador.
          </p>
        </div>
      )}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="p-6 border rounded-lg space-y-4">
      <div className="flex justify-between items-start">
        <Skeleton className="h-14 w-14 rounded-full" />
        <Skeleton className="h-5 w-5" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
      </div>
    </div>
  );
}

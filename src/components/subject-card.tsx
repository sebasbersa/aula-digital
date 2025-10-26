
import Link from 'next/link';
import type { Subject, Role } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    ArrowRight, 
    Book,
    BrainCircuit,
    Calculator,
    FlaskConical,
    Globe,
    Languages,
    Atom,
    Leaf,
    LucideProps,
    Megaphone,
    Mic,
    CookingPot,
    Martini
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import React from 'react';

const colorVariants = {
  text: {
    red: 'text-red-500',
    blue: 'text-blue-500',
    green: 'text-green-500',
    yellow: 'text-yellow-500',
    purple: 'text-purple-500',
    indigo: 'text-indigo-500',
    teal: 'text-teal-500',
  },
  bg: {
    red: 'bg-red-500/10',
    blue: 'bg-blue-500/10',
    green: 'bg-green-500/10',
    yellow: 'bg-yellow-500/10',
    purple: 'bg-purple-500/10',
    indigo: 'bg-indigo-500/10',
    teal: 'bg-teal-500/10',
  },
};

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

interface SubjectCardProps {
  subject: Subject;
  role: Role;
  savedSessionsCount?: number;
}

export function SubjectCard({ subject, role, savedSessionsCount = 0 }: SubjectCardProps) {
  const textColor = colorVariants.text[subject.color];
  const bgColor = colorVariants.bg[subject.color];
  const IconComponent = iconMap[subject.icon];

  return (
    <Link href={`/${role}/subjects/${subject.id}`}>
      <Card className="group hover:border-primary transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg h-full">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className={cn('p-3 rounded-full', bgColor)}>
              {IconComponent && <IconComponent className={cn('w-8 h-8', textColor)} />}
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </CardHeader>
        <CardContent>
          <CardTitle className="font-headline text-xl">{subject.title}</CardTitle>
          {(role === 'student' || role === 'adult_learner') && (
            <Badge variant="secondary" className="mt-2">
            <BrainCircuit className="w-3 h-3 mr-1.5" />
            {savedSessionsCount} {
              (subject.id === 'cocina' || subject.id === 'cocktails-mocktails')
                ? (savedSessionsCount === 1 ? 'receta' : 'recetas')
                : (savedSessionsCount === 1 ? 'lección' : 'lecciones')
            }
          </Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

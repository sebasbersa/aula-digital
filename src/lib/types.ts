

import type { LucideIcon } from 'lucide-react';
import type { CorrectedQuestion } from '@/ai/flows/generate-practice-guide';

// Curriculum Types
export type LessonDef = {
  id: string; // e.g., 'a1-u1-l1'
  title: string; // e.g., 'The Verb "To Be"'
  objective: string; // e.g., 'Learn to use "am", "is", and "are" correctly.'
};

export type UnitDef = {
  id: string; // e.g., 'a1-u1'
  title: string; // e.g., 'Unit 1: Greetings & Introductions'
  objective: string; // e.g. 'Desenvolverse en encuentros sociales simples.'
  lessons: LessonDef[];
};

export type LevelDef = {
  id: string; // e.g., 'a1'
  title: string; // e.g., 'A1 - Beginner'
  description: string;
  units: UnitDef[];
};

export type Curriculum = {
  subjectId: string;
  levels: LevelDef[];
};


export type Role = 'student' | 'guardian' | 'adult_learner' | 'owner' | 'content_admin';

export type User = {
  name: string;
  avatarUrl: string;
  role: Role;
  grade?: string;
};

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
};

export type Subject = {
  id: string;
  title: string;
  icon: string;
  color: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'indigo' | 'teal';
  lessons: number;
  levels: Array<'basica' | 'media' | 'paes'>;
  hasCurriculum?: boolean;
};

export type Lesson = {
  id: string;
  subjectId: string;
  title: string;
  objective: string;
  estimatedMinutes: number;
  type: 'lesson' | 'practice' | 'quiz';
};

export type MicroClass = {
  id: string;
  title: string;
  category: string;
  duration: number;
  progress: number;
};

export type Report = {
  id: string;
  userName: string;
  avatarUrl: string;
  summary: string;
  recommendations: string[];
};

export type PlanTypes = "mensual" | "anual" | "semestral";

export type Plan = {
  name: string;
  price: string;
  period: string;
  discount?: string;
  equivalentPrice?: string;
  features: string[];
  savings?: string;
  isCurrent?: boolean;
  isMostChosen?: boolean;
  isRecommended?: boolean;
  type: PlanTypes
};

export type SubscriptionStatus = 'active' | 'trial' | 'inactive' | 'past_due' | 'canceled';

export type FlowSuscription = {
  customerId: string;
  subscriptionId: string;
  planName: 'Plan Mensual' | 'Plan Semestral' | 'Plan Anual';
  createdAt: string;
  activatedAt: string | null;
  subscriptionStartedAt?: string | null;
  lastPaymentStatus: boolean;
}

export type Member = {
  id: string;
  age?: number;
  avatarUrl: string;
  email?: string;
  flowSuscription?: FlowSuscription | null;
  friendCode?: string;
  friends?: string[];
  isOwnerProfile: boolean;
  lastName: string;
  learningObjective?: string;
  name: string;
  ownerId: string;
  role: Role;
  englishLevelId?: string | null;
  createdAt: Date;
  score?: number;
  subscriptionPlan?: 'Plan Mensual' | 'Plan Semestral' | 'Plan Anual' | null;
  subscriptionStatus?: SubscriptionStatus | null;
  trialEndsAt?: Date | null;
  uid: string;
  grade?: string;
};

export type ChatMessage = {
  role: 'user' | 'model';
  content: string;
};

export type TestData = {
  subjectId: string;
  date: Date;
  topics: string;
}

export type Test = TestData & {
  id: string;
  memberId: string;
};

export type GradeData = {
  subjectId: string;
  description: string;
  grade: number;
}

export type Grade = GradeData & {
  id: string;
  memberId: string;
};

export type PracticeGuideResultData = {
  subjectId: string;
  title: string;
  score: number;
  feedback: string;
  correction: CorrectedQuestion[];
  correctAnswersCount: number;
  totalQuestionsCount: number;
  rankingPoints: number;
};

export type PracticeGuideResult = PracticeGuideResultData & {
  id: string;
  memberId: string;
  createdAt: Date;
};

export type RecipeData = {
  title: string;
  description: string;
  time: string;
  servings: string;
  difficulty: 'Fácil' | 'Intermedio' | 'Difícil';
  calories: string;
  ingredients: string[];
  steps: string[];
  tip?: string;
  category: 'Desayunos' | 'Almuerzos' | 'Cenas' | 'Snacks';
};

export type Recipe = RecipeData & {
  id?: string; // id is optional until it's saved to the DB
};

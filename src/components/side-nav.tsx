
'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  BookCopy,
  Users,
  CreditCard,
  Settings,
  ClipboardList,
  GraduationCap,
  CalendarDays,
  FileText,
  Trophy,
  User,
} from 'lucide-react';

import type { Role, NavItem, Member } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useFamily } from '@/contexts/family-context';
import { Button } from './ui/button';

const getNavItemsByRole = (role: Role): NavItem[] => {
  switch (role) {
    case 'student':
      return [
        { href: 'dashboard', label: 'Inicio', icon: Home },
        { href: 'subjects', label: 'Materias', icon: BookCopy },
        { href: 'test-calendar', label: 'Calendario de Pruebas', icon: CalendarDays },
        { href: 'grades', label: 'Mis Notas', icon: ClipboardList },
        { href: 'practice-guides', label: 'Ensayos de Práctica', icon: FileText },
        { href: 'ranking', label: 'Ranking', icon: Trophy },
      ];
    case 'adult_learner':
      return [
        { href: 'dashboard', label: 'Inicio', icon: Home },
        { href: 'subjects', label: 'Materias', icon: BookCopy },
        { href: 'practice-guides', label: 'Ensayos de Práctica', icon: FileText },
        { href: 'ranking', label: 'Ranking', icon: Trophy },
      ];
    case 'owner':
      return [
        { href: 'profiles', label: 'Gestionar Perfiles', icon: Users },
        { href: 'subscription', label: 'Suscripción', icon: CreditCard },
      ];
    default:
      return [];
  }
};

interface SideNavProps {
    role: Role;
    ownerProfile: Member | null;
}

export function SideNav({ role, ownerProfile }: SideNavProps) {
  const pathname = usePathname();
  const { members } = useFamily();
  
  const navItems = getNavItemsByRole(role);

  const learningMembers = members.filter(m => m.role === 'student' || m.role === 'adult_learner');

  return (
    <nav className="flex flex-col gap-2">
      <Link
        href="/select-profile"
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-dashed'
        )}
      >
        <Users className="h-4 w-4" />
        Cambiar Perfil
      </Link>
      <div className="my-2 border-t border-sidebar-border" />
      {navItems.map((item) => {
        const fullPath = `/${role}/${item.href}`;
        const isActive = pathname.startsWith(fullPath);
        return (
          <Link
            key={item.href}
            href={fullPath}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              isActive && 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}

      {role !== 'owner' && (
         <>
            <div className="my-2 border-t border-sidebar-border" />
             <Link
                href={`/owner/profiles`}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
                <Settings className="h-4 w-4" />
                Gestionar Cuenta
            </Link>
        </>
      )}

      {(role === 'owner' || role === 'guardian' || role === 'adult_learner') && learningMembers.length > 0 && (
        <>
          <div className="my-2 border-t border-sidebar-border" />
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Perfiles Familiares
          </h3>
          {learningMembers.map((member) => (
             <div
                key={member.id}
                className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground'
                )}
            >
              <User className="h-4 w-4" />
              {member.name}
            </div>
          ))}
        </>
      )}
    </nav>
  );
}

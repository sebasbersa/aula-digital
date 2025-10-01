
'use client';

import { createContext, useContext, type ReactNode, type Dispatch, type SetStateAction } from 'react';
import type { Member } from '@/lib/types';
import type { User as FirebaseUser } from 'firebase/auth';

interface FamilyContextType {
  members: Member[];
  setMembers: Dispatch<SetStateAction<Member[]>>;
  currentUser: FirebaseUser | null;
  loading: boolean;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export function FamilyProvider({ children, value }: { children: ReactNode; value: FamilyContextType }) {
  return (
    <FamilyContext.Provider value={value}>
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamily() {
  const context = useContext(FamilyContext);
  if (context === undefined) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
}

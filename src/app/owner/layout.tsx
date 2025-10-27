
'use client';

import React, { type ReactNode, useEffect, useState, useCallback } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { AppLogo, FaviconIcon } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SideNav } from '@/components/side-nav';
import type { User, Member } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getMembers, updateMember } from '@/services/members';
import { FamilyProvider } from '@/contexts/family-context';
import Link from 'next/link';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';


function LayoutSkeleton() {
    return (
        <SidebarProvider>
            <Sidebar collapsible>
                <SidebarHeader className="p-4">
                    <div className="flex items-center gap-2">
                         <div className="relative w-32 h-10">
                            <Skeleton className="h-full w-full" />
                        </div>
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <div className="p-2 space-y-2">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                </SidebarContent>
                <SidebarFooter className="p-4 border-t">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div>
                            <Skeleton className="h-4 w-24 mb-1" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                    </div>
                </SidebarFooter>
            </Sidebar>
            <SidebarInset>
                <main className="flex-1 p-4 md:p-6 lg:p-8">
                  <Skeleton className="h-40 w-full" />
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}

export default function OwnerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [ownerProfile, setOwnerProfile] = useState<Member | null>(null);

  const loadData = useCallback(async (uid: string, fUser: FirebaseUser) => {
    try {
      const fetchedMembers = await getMembers(uid);
      setMembers(fetchedMembers);
      
      const owner = fetchedMembers.find(m => m.isOwnerProfile);
      if (owner) {
          // Check if owner profile has email, if not, update it from auth.
          if (!owner.email && fUser.email) {
              await updateMember(owner.id, { email: fUser.email });
              owner.email = fUser.email;
          }
          setOwnerProfile(owner);
          setActiveUser({
            name: owner.name || 'Propietario',
            avatarUrl: owner.avatarUrl || `https://placehold.co/100x100.png`,
            role: 'owner',
          });
      }

    } catch (error) {
      console.error("Failed to load members in owner layout", error);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setCurrentUser(firebaseUser);
        await loadData(firebaseUser.uid, firebaseUser);
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, loadData]);


  if (loading || !activeUser) {
    return <LayoutSkeleton />;
  }
  
  return (
    <FamilyProvider value={{ members, setMembers, currentUser, loading }}>
        <SidebarProvider>
            <Sheet>
                <Sidebar collapsible>
                    <SheetContent side="left" className="md:hidden p-0">
                        <SidebarHeader className="p-4 flex justify-center border-b">
                            <Link href="/select-profile" className="relative h-auto w-52">
                            <AppLogo />
                            </Link>
                            <SheetTitle className="sr-only">Menú de Navegación</SheetTitle>
                        </SidebarHeader>
                        <SidebarContent>
                            <div className="p-2">
                                <SideNav role={activeUser.role} ownerProfile={ownerProfile} />
                            </div>
                        </SidebarContent>
                        <SidebarFooter className="p-4 border-t absolute bottom-0 w-full">
                            <div className="flex items-center">
                            <p className="font-semibold">Gestión de perfiles</p>
                            </div>
                        </SidebarFooter>
                    </SheetContent>

                    <div className="hidden md:flex md:flex-col h-full">
                    <SidebarHeader className="p-4 flex justify-center">
                        <Link href="/select-profile" className="relative h-auto w-52">
                        <AppLogo />
                        </Link>
                    </SidebarHeader>
                    <SidebarContent>
                    <div className="p-2">
                        <SideNav role={activeUser.role} ownerProfile={ownerProfile} />
                    </div>
                    </SidebarContent>
                    <SidebarFooter className="p-4 border-t">
                        <div className="flex items-center">
                        <p className="font-semibold">Gestión de perfiles</p>
                        </div>
                    </SidebarFooter>
                    </div>
                </Sidebar>
                <SidebarInset>
                    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                        <SidebarTrigger className="md:hidden size-8 p-0 flex items-center justify-center">
                           <FaviconIcon className="w-5 h-5" />
                        </SidebarTrigger>
                    </header>
                    <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
                </SidebarInset>
            </Sheet>
        </SidebarProvider>
    </FamilyProvider>
  );
}

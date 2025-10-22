"use client";

import React, { type ReactNode, useEffect, useState, useCallback } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
} from "../../components/ui/sidebar";
import { AppLogo } from "../../components/icons";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { SideNav } from "../../components/side-nav";
import type { Role, User, Member } from "../../lib/types";
import { Skeleton } from "../../components/ui/skeleton";
import { useParams, useRouter, usePathname, redirect } from "next/navigation";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { getMembers } from "../../services/members";
import { FamilyProvider, useFamily } from "../../contexts/family-context";
import Link from "next/link";

function LayoutSkeleton() {
  return (
    <SidebarProvider>
      <Sidebar collapsible="none">
        <SidebarHeader className="p-4">
          <div className="relative w-32 h-10">
            <Skeleton className="h-full w-full" />
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

const roleDisplayNames: Record<Role, string> = {
  student: "Estudiante",
  guardian: "Tutor",
  adult_learner: "Adulto",
  owner: "Propietario",
  content_admin: "Admin",
};

export default function AppLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const currentRoleInUrl = params.role as Role;
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [ownerProfile, setOwnerProfile] = useState<Member | null>(null);

  const loadMembers = useCallback(async (uid: string) => {
    try {
      const fetchedMembers = await getMembers(uid);
      setMembers(fetchedMembers);
      const owner = fetchedMembers.find((m) => m.role === "owner");
      setOwnerProfile(owner || null);
      return fetchedMembers;
    } catch (error) {
      console.error("Failed to load members in layout", error);
      return [];
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (!firebaseUser) {
        router.push("/login");
        return;
      }

      setCurrentUser(firebaseUser);
      const fetchedMembers = await loadMembers(firebaseUser.uid);

      if (fetchedMembers.length === 0) {
        // This can happen for a new user, redirect them to create profiles.
        router.replace("/select-profile");
        return;
      }

      const selectedProfileString = sessionStorage.getItem("selectedProfile");
      let profileToUse: Member | null = null;

      if (selectedProfileString) {
        const selectedProfile: Member = JSON.parse(selectedProfileString);

        // If the role in the URL doesn't match the one in session, try to find a matching profile.
        // This handles cases where the user manually changes the URL.
        if (selectedProfile.role !== currentRoleInUrl) {
          const matchingProfile = fetchedMembers.find(
            (m) => m.role === currentRoleInUrl
          );
          if (matchingProfile) {
            profileToUse = matchingProfile;
            sessionStorage.setItem(
              "selectedProfile",
              JSON.stringify(matchingProfile)
            );
          } else {
            // If no matching profile exists for the URL, redirect to profile selection.
            router.replace("/select-profile");
            return;
          }
        } else {
          // The role in the URL matches the one in session, use it.
          profileToUse = selectedProfile;
        }
      } else {
        // No profile selected in session, try to find one matching the URL.
        const matchingProfile = fetchedMembers.find(
          (m) => m.role === currentRoleInUrl
        );
        if (matchingProfile) {
          profileToUse = matchingProfile;
          sessionStorage.setItem(
            "selectedProfile",
            JSON.stringify(matchingProfile)
          );
        } else {
          // No profile in session and no match for the URL, redirect.
          router.replace("/select-profile");
          return;
        }
      }

      if (profileToUse) {
        const ownerMember = fetchedMembers.find((m) => m.isOwnerProfile);
        if (!ownerMember) {
          router.replace("/cuenta-inactiva");
          return;
        }
        if (ownerMember.subscriptionStatus == "trial") {
          if (ownerMember.trialEndsAt!! < new Date()) {
            router.replace("/owner/subscription");
            return;
          }
        }
        if (ownerMember.subscriptionStatus != "active") {
          if (ownerMember.trialEndsAt!! < new Date()) {
            router.replace("/owner/subscription");
            return;
          }
        }
        setActiveUser({
          name: profileToUse.name || "Usuario",
          avatarUrl:
            profileToUse.avatarUrl || `https://placehold.co/100x100.png`,
          role: profileToUse.role,
          grade: profileToUse.grade,
        });
      } else {
        // Final fallback, should not be reached with the logic above, but good for safety.
        router.replace("/select-profile");
        return;
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, loadMembers, currentRoleInUrl]);

  if (loading || !activeUser) {
    return <LayoutSkeleton />;
  }

  const userRoleDisplay =
    roleDisplayNames[activeUser.role] || activeUser.role.replace("_", " ");
  const userDescription =
    activeUser.role === "student" && activeUser.grade
      ? `${userRoleDisplay} - ${activeUser.grade}`
      : userRoleDisplay;

  return (
    <FamilyProvider value={{ members, setMembers, currentUser, loading }}>
      <SidebarProvider>
        <Sidebar collapsible="none">
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
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={activeUser.avatarUrl} alt={activeUser.name} />
                <AvatarFallback>{activeUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{activeUser.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {userDescription}
                </p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </FamilyProvider>
  );
}

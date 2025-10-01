
'use server';

import { db } from '@/lib/firebase';
import type { Member } from '@/lib/types';
import { collection, getDocs, query, where, DocumentData, Timestamp } from 'firebase/firestore';
import { decrypt } from '@/lib/session';
import { cookies } from 'next/headers';

const convertFirestoreDataToMember = (doc: DocumentData, docId: string): Member => {
    const data = doc as Omit<Member, 'id'> & { createdAt?: Timestamp, subscriptionStartedAt?: Timestamp, subscriptionPeriodEndsAt?: Timestamp, trialEndsAt?: Timestamp };
    const createdAt = data.createdAt?.toDate() || new Date();
    const subscriptionStartedAt = data.subscriptionStartedAt?.toDate() || null;
    const subscriptionPeriodEndsAt = data.subscriptionPeriodEndsAt?.toDate() || null;
    const trialEndsAt = data.trialEndsAt?.toDate() || null;
    
    return {
        id: docId,
        uid: data.uid || '',
        ownerId: data.ownerId,
        tenantId: data.tenantId || '',
        name: data.name,
        lastName: data.lastName,
        email: data.email || '',
        rut: data.rut,
        role: data.role,
        avatarUrl: data.avatarUrl,
        age: data.age,
        grade: data.grade,
        learningObjective: data.learningObjective,
        score: data.score || 0,
        friendCode: data.friendCode,
        friends: data.friends || [],
        isOwnerProfile: data.isOwnerProfile || false,
        englishLevelId: data.englishLevelId,
        subscriptionId: data.subscriptionId,
        customerId: data.customerId,
        subscriptionPlan: data.subscriptionPlan,
        subscriptionStatus: data.subscriptionStatus,
        subscriptionStartedAt,
        subscriptionPeriodEndsAt,
        trialEndsAt,
        createdAt,
    };
};

// This function now specifically gets OWNER profiles
export async function getOwnerProfiles(): Promise<Member[]> {
    const sessionCookie = cookies().get('adminSession')?.value;
    if (!sessionCookie) {
        console.log("Admin session cookie not found.");
        return [];
    }
    const decryptedSession = await decrypt(sessionCookie);
    if (!decryptedSession?.userId) {
        console.log("Admin session invalid or expired.");
        return [];
    }

    try {
        const membersRef = collection(db, 'members');
        
        // This is the most reliable query based on the database structure provided.
        // It finds all documents that represent the main account profile.
        const q = query(membersRef, where('isOwnerProfile', '==', true));
        
        const querySnapshot = await getDocs(q);

        const members: Member[] = [];
        querySnapshot.forEach((docSnap) => {
            const member = convertFirestoreDataToMember(docSnap.data(), docSnap.id);
            members.push(member);
        });
        
        return members;
    } catch (error) {
        console.error("Error fetching owner profiles from Firestore: ", error);
        // Throwing the error so the client-side can catch it and display a message.
        throw new Error("Failed to fetch owner profiles from database. Check Firestore rules or indexes.");
    }
}

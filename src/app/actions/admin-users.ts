
'use server';

import { db } from '@/lib/firebase';
import type { Member } from '@/lib/types';
import { collection, getDocs, query, where, DocumentData, Timestamp } from 'firebase/firestore';
import { decrypt } from '@/lib/session';
import { cookies } from 'next/headers';

const convertFirestoreDataToMember = (doc: DocumentData, docId: string): Member => {
    const data = doc as Omit<Member, 'id'> & { createdAt?: Timestamp, subscriptionStartedAt?: Timestamp, subscriptionPeriodEndsAt?: Timestamp, trialEndsAt?: Timestamp };
    const trialEndsAt = data.trialEndsAt?.toDate() || null;
    const createdAt = data.createdAt?.toDate() || new Date();
    return {
        id: docId,
        age: data.age,
        avatarUrl: data.avatarUrl,
        email: data.email,
        flowSuscription: data.flowSuscription,
        friendCode: data.friendCode,
        friends: data.friends,
        isOwnerProfile: data.isOwnerProfile,
        lastName: data.lastName,
        learningObjective: data.learningObjective,
        name: data.name,
        ownerId: data.ownerId,
        role: data.role,
        score: data.score,
        subscriptionStatus: data.subscriptionStatus,
        trialEndsAt: trialEndsAt,
        uid: data.uid,
        grade: data.grade,
        englishLevelId: data.englishLevelId,
        subscriptionPlan: doc.subscriptionPlan,
        createdAt: createdAt
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


'use client';
import { db, auth } from '@/lib/firebase';
import type { Member, Role } from '@/lib/types';
import { collection, addDoc, getDocs, query, where, doc, setDoc, deleteDoc, DocumentData, updateDoc, getDoc, arrayUnion, arrayRemove, serverTimestamp, writeBatch, Timestamp } from 'firebase/firestore';
import { getPracticeGuides } from './practiceGuides';

// Helper function to convert Firestore data to a Member object
const convertFirestoreDataToMember = (doc: DocumentData, docId: string): Member => {
    const data = doc as Omit<Member, 'id'>;
    // Convert Firestore Timestamps to JS Dates if they exist
    const subscriptionStartedAt = data.subscriptionStartedAt && typeof (data.subscriptionStartedAt as any).toDate === 'function' ? (data.subscriptionStartedAt as any).toDate() : null;
    const subscriptionPeriodEndsAt = data.subscriptionPeriodEndsAt && typeof (data.subscriptionPeriodEndsAt as any).toDate === 'function' ? (data.subscriptionPeriodEndsAt as any).toDate() : null;
    const trialEndsAt = data.trialEndsAt && typeof (data.trialEndsAt as any).toDate === 'function' ? (data.trialEndsAt as any).toDate() : null;
    const createdAt = data.createdAt && typeof (data.createdAt as any).toDate === 'function' ? (data.createdAt as any).toDate() : new Date();

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
        createdAt: createdAt,
        subscriptionId: data.subscriptionId,
        customerId: data.customerId,
        subscriptionPlan: data.subscriptionPlan,
        subscriptionStatus: data.subscriptionStatus,
        subscriptionStartedAt: subscriptionStartedAt,
        subscriptionPeriodEndsAt: subscriptionPeriodEndsAt,
        trialEndsAt: trialEndsAt,
    };
};

// Helper function to generate a unique friend code
const generateFriendCode = async (name: string): Promise<string> => {
    const sanitizedName = name.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '');
    let friendCode = '';
    let isUnique = false;
    
    while (!isUnique) {
        const randomDigits = Math.floor(1000 + Math.random() * 9000);
        friendCode = `${sanitizedName}#${randomDigits}`;
        
        const q = query(collection(db, 'members'), where('friendCode', '==', friendCode));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            isUnique = true;
        }
    }
    return friendCode;
};

export async function getMembers(ownerId: string): Promise<Member[]> {
    if (!ownerId) {
        console.warn("getMembers called without ownerId.");
        return [];
    }
    try {
        const membersRef = collection(db, 'members');
        const q = query(membersRef, where("ownerId", "==", ownerId));
        const querySnapshot = await getDocs(q);

        const members: Member[] = [];
        querySnapshot.forEach((docSnap) => {
            members.push(convertFirestoreDataToMember(docSnap.data(), docSnap.id));
        });

        return members;
    } catch (error) {
        console.error("Error fetching members: ", error);
        throw new Error("Failed to fetch members from database.");
    }
}

export async function getMemberById(memberId: string): Promise<Member | null> {
    if (!memberId) return null;
    try {
        const memberRef = doc(db, 'members', memberId);
        const docSnap = await getDoc(memberRef);
        if (docSnap.exists()) {
            return convertFirestoreDataToMember(docSnap.data(), docSnap.id);
        }
        return null;
    } catch (error) {
        console.error(`Error fetching member ${memberId}:`, error);
        throw new Error("Could not fetch member profile.");
    }
}

export async function getMembersByIds(memberIds: string[]): Promise<Member[]> {
    if (!memberIds || memberIds.length === 0) {
        return [];
    }
    try {
        const members: Member[] = [];
        const chunks = [];
        for (let i = 0; i < memberIds.length; i += 30) {
            chunks.push(memberIds.slice(i, i + 30));
        }
        for (const chunk of chunks) {
            const membersRef = collection(db, 'members');
            const q = query(membersRef, where('__name__', 'in', chunk));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                members.push(convertFirestoreDataToMember(doc.data(), doc.id));
            });
        }
        return members;
    } catch (error) {
        console.error("Error fetching members by IDs: ", error);
        throw new Error("Could not fetch members.");
    }
}


export async function addMember(ownerId: string, memberData: Partial<Member>, isOwnerProfile: boolean = false): Promise<Member> {
    const currentUser = auth.currentUser;
    if (!ownerId || !memberData.name || !memberData.role || !memberData.avatarUrl) {
        throw new Error("Faltan datos esenciales para crear un nuevo miembro.");
    }
    if (isOwnerProfile && !currentUser?.email) {
        throw new Error("No se pudo obtener el email del propietario para el perfil principal.");
    }

    try {
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 5);

        const newMemberPayload: any = {
            ownerId: ownerId,
            name: memberData.name,
            lastName: memberData.lastName || '',
            role: memberData.role as Role,
            avatarUrl: memberData.avatarUrl,
            score: 0,
            friends: [],
            isOwnerProfile: isOwnerProfile,
            createdAt: serverTimestamp(),
            // Only add these fields for the owner profile
            ...(isOwnerProfile && {
                uid: ownerId, // The auth ID
                email: currentUser!.email,
                subscriptionStatus: 'trial',
                trialEndsAt: Timestamp.fromDate(trialEndDate),
            })
        };
        
        if (memberData.age) newMemberPayload.age = memberData.age;
        if (memberData.grade) newMemberPayload.grade = memberData.grade;
        if (memberData.learningObjective) newMemberPayload.learningObjective = memberData.learningObjective;
        
        if (memberData.role === 'student' || memberData.role === 'adult_learner') {
            newMemberPayload.friendCode = await generateFriendCode(memberData.name!);
        }

        const docRef = await addDoc(collection(db, 'members'), newMemberPayload);
        
        const finalPayload = {
            id: docRef.id,
            ...newMemberPayload,
            createdAt: new Date(),
        };

        // If this is the owner profile, also create their first 'guardian' profile
        if (isOwnerProfile) {
            const guardianProfilePayload = {
                ownerId: ownerId,
                name: memberData.name,
                lastName: memberData.lastName || '',
                role: 'guardian' as Role,
                avatarUrl: memberData.avatarUrl,
                isOwnerProfile: false, // This is NOT the main owner profile
                createdAt: serverTimestamp(),
            };
            await addDoc(collection(db, 'members'), guardianProfilePayload);
        }
        
        return finalPayload;

    } catch (error) {
        console.error("Error adding member: ", error);
        throw new Error("No se pudo añadir el nuevo miembro a la base de datos.");
    }
}


export async function updateMember(memberId: string, memberData: Partial<Pick<Member, 'name' | 'avatarUrl' | 'grade' | 'friendCode' | 'englishLevelId' | 'email'>>): Promise<void> {
    try {
        const memberRef = doc(db, 'members', memberId);
        await updateDoc(memberRef, memberData);
    } catch (error) {
        console.error("Error updating member: ", error);
        throw new Error("Could not update member profile.");
    }
}

export async function getOrCreateFriendCode(memberId: string, name: string): Promise<string> {
    const memberRef = doc(db, 'members', memberId);
    try {
        const docSnap = await getDoc(memberRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.friendCode) {
                return data.friendCode;
            }
        }
        // If it doesn't exist, create it
        const newCode = await generateFriendCode(name);
        await updateMember(memberId, { friendCode: newCode });
        return newCode;
    } catch (error) {
        console.error("Error getting or creating friend code:", error);
        throw new Error("Could not retrieve or create a friend code.");
    }
}

export async function recalculateMemberScore(memberId: string): Promise<number> {
    if (!memberId) return 0;

    try {
        const guides = await getPracticeGuides(memberId);
        
        const bestRankingPointsByGuide = guides.reduce((acc, guide) => {
            // Definitive normalization logic
            const normalizedTitle = guide.title
                .toLowerCase()
                .replace(/^guía de práctica:/, '')
                .replace(/\(.*\)/, '')
                .trim();

            const currentPoints = guide.rankingPoints || 0;

            if (!acc[normalizedTitle] || currentPoints > acc[normalizedTitle]) {
                acc[normalizedTitle] = currentPoints;
            }
            return acc;
        }, {} as Record<string, number>);

        const totalScore = Object.values(bestRankingPointsByGuide).reduce((sum, points) => sum + points, 0);
        
        const memberRef = doc(db, 'members', memberId);
        await updateDoc(memberRef, {
            score: totalScore
        });
        
        return totalScore;

    } catch (error) {
        console.error(`Error recalculating score for member ${memberId}:`, error);
        throw new Error('Could not recalculate score.');
    }
}


export async function deleteMember(memberId: string): Promise<void> {
    try {
        await deleteDoc(doc(db, 'members', memberId));
    } catch (error) {
        console.error("Error deleting member: ", error);
        throw new Error("Could not delete member.");
    }
}

export async function findMemberByFriendCode(friendCode: string, currentUserId: string): Promise<Member | null> {
    if (!friendCode) return null;
    try {
        const q = query(collection(db, 'members'), where('friendCode', '==', friendCode));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            return null;
        }
        const doc = querySnapshot.docs[0];
        if (doc.id === currentUserId) {
            throw new Error("No puedes agregarte a ti mismo como amigo.");
        }
        return convertFirestoreDataToMember(doc.data(), doc.id);
    } catch (error) {
        console.error("Error finding member by friend code: ", error);
        throw error;
    }
}

export async function addFriend(currentMemberId: string, friendMemberId: string): Promise<void> {
    const batch = writeBatch(db);
    const currentUserRef = doc(db, 'members', currentMemberId);
    const friendRef = doc(db, 'members', friendMemberId);

    batch.update(currentUserRef, { friends: arrayUnion(friendMemberId) });
    batch.update(friendRef, { friends: arrayUnion(currentMemberId) });

    await batch.commit();
}

export async function removeFriend(currentMemberId: string, friendMemberId: string): Promise<void> {
    const batch = writeBatch(db);
    const currentUserRef = doc(db, 'members', currentMemberId);
    const friendRef = doc(db, 'members', friendMemberId);

    batch.update(currentUserRef, { friends: arrayRemove(friendMemberId) });
    batch.update(friendRef, { friends: arrayRemove(currentMemberId) });
    
    await batch.commit();
}

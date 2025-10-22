
'use client';

import { db } from '@/lib/firebase';
import type { ChatMessage } from '@/lib/types';
import { collection, addDoc, getDocs, query, where, serverTimestamp, DocumentData, doc, deleteDoc, updateDoc, Timestamp, getDoc } from 'firebase/firestore';

export interface TutoringSession {
    id: string;
    ownerId: string;
    memberId: string;
    subjectId: string;
    title: string;
    sessionData: ChatMessage[];
    createdAt: Date;
    updatedAt: Date;
    studyDaysCount: number;
}

export async function addTutoringSession(ownerId: string, memberId: string, subjectId: string, sessionData: ChatMessage[], title: string): Promise<TutoringSession> {
    try {
        const now = new Date();
        const sessionPayload = {
            ownerId,
            memberId,
            subjectId,
            sessionData,
            title,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            studyDaysCount: 1,
        };
        const docRef = await addDoc(collection(db, 'tutoringSessions'), sessionPayload);
        
        return {
            ...sessionPayload,
            id: docRef.id,
            createdAt: now,
            updatedAt: now,
        }
    } catch (error) {
        console.error("Error adding tutoring session: ", error);
        throw new Error("Could not save the tutoring session.");
    }
}

export async function updateTutoringSession(sessionId: string, sessionData: ChatMessage[], currentSession: TutoringSession): Promise<{updatedAt: Date, studyDaysCount: number}> {
    try {
        const sessionRef = doc(db, 'tutoringSessions', sessionId);
        
        const now = new Date();
        const lastUpdateDateSource = currentSession.updatedAt || currentSession.createdAt;
        
        let lastUpdateDate: Date;
        if (lastUpdateDateSource instanceof Date) {
            lastUpdateDate = lastUpdateDateSource;
        } else if (lastUpdateDateSource && typeof lastUpdateDateSource.toDate === 'function') {
            // It's a Firestore Timestamp-like object from a previous state
            lastUpdateDate = lastUpdateDateSource.toDate();
        } else {
            // Fallback for string or number representations
            lastUpdateDate = new Date(lastUpdateDateSource);
        }

        if (isNaN(lastUpdateDate.getTime())) {
             console.error("Invalid date found in session data. Using createdAt as fallback.", currentSession.createdAt);
             lastUpdateDate = currentSession.createdAt instanceof Date ? currentSession.createdAt : new Date(currentSession.createdAt);
             if(isNaN(lastUpdateDate.getTime())) {
                throw new Error("Invalid createdAt date in session data.");
             }
        }
        
        const isDifferentDay = now.getFullYear() !== lastUpdateDate.getFullYear() ||
                               now.getMonth() !== lastUpdateDate.getMonth() ||
                               now.getDate() !== lastUpdateDate.getDate();

        const currentStudyDays = currentSession.studyDaysCount || 0;
        const newStudyDaysCount = isDifferentDay ? currentStudyDays + 1 : currentStudyDays;

        await updateDoc(sessionRef, {
            sessionData: sessionData,
            updatedAt: serverTimestamp(),
            studyDaysCount: newStudyDaysCount
        });
        
        return { updatedAt: now, studyDaysCount: newStudyDaysCount };

    } catch (error) {
        console.error("Error updating tutoring session: ", error);
        throw new Error("Could not update the tutoring session.");
    }
}


export async function getTutoringSessions(memberId: string, subjectId?: string): Promise<TutoringSession[]> {
    if (!memberId) {
        return [];
    }
    try {
        const sessionsRef = collection(db, 'tutoringSessions');
        
        const q = query(sessionsRef, where("memberId", "==", memberId));
        
        const querySnapshot = await getDocs(q);
        const sessions: TutoringSession[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data() as DocumentData;
            sessions.push({
                id: doc.id,
                ownerId: data.ownerId,
                memberId: data.memberId,
                subjectId: data.subjectId,
                title: data.title || `Tutoría del ${data.createdAt?.toDate().toLocaleDateString()}`,
                sessionData: data.sessionData,
                createdAt: data.createdAt?.toDate(),
                updatedAt: data.updatedAt?.toDate() || data.createdAt?.toDate(),
                studyDaysCount: data.studyDaysCount || 1,
            });
        });
        
        sessions.sort((a, b) => b.updatedAt.getTime() - a.createdAt.getTime());

        if (subjectId) {
            return sessions.filter(session => session.subjectId === subjectId);
        }

        return sessions;

    } catch (error) {
        console.error("Error fetching tutoring sessions: ", error);
        throw new Error("Could not fetch saved tutoring sessions.");
    }
}

export async function deleteTutoringSession(sessionId: string): Promise<void> {
    try {
        await deleteDoc(doc(db, 'tutoringSessions', sessionId));
    } catch (error) {
        console.error("Error deleting session: ", error);
        throw new Error("Could not delete tutoring session.");
    }
}

export async function updateTutoringSessionTitle(sessionId: string, newTitle: string): Promise<void> {
    try {
        const sessionRef = doc(db, 'tutoringSessions', sessionId);
        await updateDoc(sessionRef, {
            title: newTitle
        });
    } catch (error) {
        console.error("Error updating session title: ", error);
        throw new Error("Could not update tutoring session title.");
    }
}

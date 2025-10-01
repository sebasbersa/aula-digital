
'use client';

import { db } from '@/lib/firebase';
import type { PracticeGuideResult, PracticeGuideResultData } from '@/lib/types';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  DocumentData,
  Timestamp,
  orderBy,
  doc,
  deleteDoc,
  getDoc
} from 'firebase/firestore';
import { recalculateMemberScore } from './members';

const getPointsForScore = (score: number): number => {
    if (score >= 7.0) return 50;
    if (score >= 6.0) return 30;
    if (score >= 5.0) return 20;
    if (score >= 4.0) return 10;
    return 0;
};

const convertFirestoreDataToGuide = (doc: DocumentData, docId: string): PracticeGuideResult => {
    const data = doc as Omit<PracticeGuideResult, 'id' | 'createdAt'> & { createdAt: Timestamp };
    return {
        id: docId,
        memberId: data.memberId,
        subjectId: data.subjectId,
        title: data.title,
        score: data.score,
        feedback: data.feedback,
        correction: data.correction || [], // Handle cases where correction might not exist in old data
        correctAnswersCount: data.correctAnswersCount,
        totalQuestionsCount: data.totalQuestionsCount,
        createdAt: data.createdAt.toDate(),
        rankingPoints: data.rankingPoints || 0,
    };
};

export async function addPracticeGuide(
  ownerId: string,
  memberId: string,
  guideData: Omit<PracticeGuideResultData, 'rankingPoints'>
): Promise<PracticeGuideResult & { newScore: number }> {
  if (!memberId) {
    throw new Error('Member ID is required to save a practice guide.');
  }
  try {
    const rankingPoints = getPointsForScore(guideData.score);
    const completeGuideData = { ...guideData, rankingPoints };

    const docRef = await addDoc(collection(db, 'practiceGuides'), {
      ownerId,
      memberId,
      ...completeGuideData,
      createdAt: serverTimestamp(),
    });

    const newScore = await recalculateMemberScore(memberId);
    
    // Dispatch an event to notify other components of the score update
    window.dispatchEvent(new CustomEvent('scoreUpdated', { detail: { newScore } }));
    
    const newGuideResult: PracticeGuideResult & { newScore: number } = {
      id: docRef.id,
      memberId,
      ...completeGuideData,
      createdAt: new Date(), // Approximate client-side date
      newScore,
    };

    return newGuideResult;
  } catch (error) {
    console.error('Error adding practice guide to Firestore: ', error);
    throw new Error('Could not save practice guide result.');
  }
}

export async function getPracticeGuides(memberId: string): Promise<PracticeGuideResult[]> {
  if (!memberId) {
    return [];
  }
  try {
    const guidesRef = collection(db, 'practiceGuides');
    const q = query(guidesRef, where('memberId', '==', memberId));
    const querySnapshot = await getDocs(q);
    
    const guides: PracticeGuideResult[] = [];
    querySnapshot.forEach((doc) => {
        guides.push(convertFirestoreDataToGuide(doc.data(), doc.id));
    });
    
    // Sort guides by date descending in the client
    guides.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return guides;
  } catch (error) {
    console.error('Error fetching practice guides from Firestore: ', error);
    throw new Error('Could not fetch practice guides.');
  }
}

export async function deletePracticeGuide(guideId: string): Promise<void> {
  try {
    const guideRef = doc(db, 'practiceGuides', guideId);
    const docSnap = await getDoc(guideRef);
    if (docSnap.exists()) {
        const memberId = docSnap.data().memberId;
        await deleteDoc(guideRef);
        if (memberId) {
            const newScore = await recalculateMemberScore(memberId);
            window.dispatchEvent(new CustomEvent('scoreUpdated', { detail: { newScore } }));
        }
    } else {
        await deleteDoc(guideRef);
    }
  } catch (error) {
    console.error('Error deleting practice guide from Firestore: ', error);
    throw new Error('Could not delete practice guide.');
  }
}

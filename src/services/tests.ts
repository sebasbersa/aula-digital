
'use client';

import { db } from '@/lib/firebase';
import type { Test, TestData } from '@/lib/types';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
  DocumentData
} from 'firebase/firestore';

// Helper function to convert Firestore Timestamps to Dates in test objects
const convertFirestoreDataToTest = (doc: DocumentData, docId: string): Test => {
    const data = doc as Omit<Test, 'id' | 'date'> & { date: Timestamp };
    return {
        id: docId,
        memberId: data.memberId,
        subjectId: data.subjectId,
        topics: data.topics,
        date: data.date.toDate(),
    };
};


export async function addTest(
  ownerId: string,
  memberId: string,
  testData: TestData
): Promise<Test> {
  if (!memberId) {
    throw new Error('Member ID is required to add a test.');
  }
  try {
    const docRef = await addDoc(collection(db, 'tests'), {
      ownerId,
      memberId,
      ...testData,
      date: Timestamp.fromDate(testData.date), // Convert Date to Firestore Timestamp
    });
    
    return {
      id: docRef.id,
      memberId,
      ...testData,
    };
  } catch (error) {
    console.error('Error adding test to Firestore: ', error);
    throw new Error('Could not add test.');
  }
}

export async function getTests(memberId: string): Promise<Test[]> {
  if (!memberId) {
    return [];
  }
  try {
    const testsRef = collection(db, 'tests');
    const q = query(testsRef, where('memberId', '==', memberId));
    const querySnapshot = await getDocs(q);
    
    const tests: Test[] = [];
    querySnapshot.forEach((doc) => {
        tests.push(convertFirestoreDataToTest(doc.data(), doc.id));
    });

    // Sort by date client-side after fetching
    tests.sort((a, b) => a.date.getTime() - b.date.getTime());

    return tests;
  } catch (error) {
    console.error('Error fetching tests from Firestore: ', error);
    throw new Error('Could not fetch tests.');
  }
}

export async function updateTest(
  testId: string,
  testData: TestData
): Promise<Test> {
  try {
    const testRef = doc(db, 'tests', testId);
    const updatePayload = {
        ...testData,
        date: Timestamp.fromDate(testData.date), // Convert Date to Firestore Timestamp
    };
    await updateDoc(testRef, updatePayload);

    // We need memberId for the return type, let's get it from the document before updating
    const docSnap = await testRef.get();
    const existingData = docSnap.data();

    return { 
        id: testId,
        memberId: existingData?.memberId || '', 
        ...testData 
    };
  } catch (error) {
    console.error('Error updating test in Firestore: ', error);
    throw new Error('Could not update test.');
  }
}

export async function deleteTest(testId: string): Promise<void> {
  try {
    const testRef = doc(db, 'tests', testId);
    await deleteDoc(testRef);
  } catch (error) {
    console.error('Error deleting test from Firestore: ', error);
    throw new Error('Could not delete test.');
  }
}

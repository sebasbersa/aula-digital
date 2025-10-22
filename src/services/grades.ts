
'use client';

import { db } from '@/lib/firebase';
import type { Grade, GradeData } from '@/lib/types';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  deleteDoc,
  DocumentData
} from 'firebase/firestore';

const convertFirestoreDataToGrade = (doc: DocumentData, docId: string): Grade => {
    const data = doc as Omit<Grade, 'id'>;
    return {
        id: docId,
        memberId: data.memberId,
        subjectId: data.subjectId,
        description: data.description,
        grade: data.grade,
    };
};

export async function addGrade(
  ownerId: string,
  memberId: string,
  gradeData: GradeData
): Promise<Grade> {
  if (!memberId) {
    throw new Error('Member ID is required to add a grade.');
  }
  try {
    const docRef = await addDoc(collection(db, 'grades'), {
      ownerId,
      memberId,
      ...gradeData,
    });
    
    return {
      id: docRef.id,
      memberId,
      ...gradeData,
    };
  } catch (error) {
    console.error('Error adding grade to Firestore: ', error);
    throw new Error('Could not add grade.');
  }
}

export async function getGrades(memberId: string): Promise<Grade[]> {
  if (!memberId) {
    return [];
  }
  try {
    const gradesRef = collection(db, 'grades');
    const q = query(gradesRef, where('memberId', '==', memberId));
    const querySnapshot = await getDocs(q);
    
    const grades: Grade[] = [];
    querySnapshot.forEach((doc) => {
        grades.push(convertFirestoreDataToGrade(doc.data(), doc.id));
    });

    return grades;
  } catch (error) {
    console.error('Error fetching grades from Firestore: ', error);
    // Return empty array instead of throwing error
    return [];
  }
}


export async function deleteGrade(gradeId: string): Promise<void> {
  try {
    const gradeRef = doc(db, 'grades', gradeId);
    await deleteDoc(gradeRef);
  } catch (error) {
    console.error('Error deleting grade from Firestore: ', error);
    throw new Error('Could not delete grade.');
  }
}

    
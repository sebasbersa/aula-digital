
// src/services/subjects.ts
'use server';
import type { Subject } from '@/lib/types';
import { subjects as mockSubjects, grades, adultSubjects as mockAdultSubjects } from '@/lib/data';

const getLevelForGrade = (grade: string): 'basica' | 'media' | 'paes' | null => {
  if (grades.basica.includes(grade)) return 'basica';
  if (grades.media.includes(grade)) return 'media';
  if (grades.paes.includes(grade)) return 'paes';
  return null;
}

export async function getSubjects(grade?: string): Promise<Subject[]> {
  try {
    // NOTE: Temporarily returning mock data to bypass Firestore permissions error.
    console.warn("getSubjects is returning mock data due to Firestore permissions.");
    
    if (!grade) {
      return Promise.resolve(mockSubjects);
    }
    
    const level = getLevelForGrade(grade);
    if (!level) {
      return Promise.resolve([]);
    }
    
    const filteredSubjects = mockSubjects.filter(subject => subject.levels.includes(level));
    return Promise.resolve(filteredSubjects);

  } catch (error) {
    console.error("Error fetching subjects: ", error);
    return [];
  }
}

export async function getAdultSubjects(): Promise<Subject[]> {
  try {
    console.warn("getAdultSubjects is returning mock data.");
    return Promise.resolve(mockAdultSubjects);
  } catch (error) {
    console.error("Error fetching adult subjects: ", error);
    return [];
  }
}

export async function getSubjectById(id: string): Promise<Subject | undefined> {
  try {
    console.warn("getSubjectById is returning mock data due to Firestore permissions.");
    const allStudentSubjects = await getSubjects(); // Gets all subjects without filtering
    const allAdultSubjects = await getAdultSubjects();
    const allSubjects = [...allStudentSubjects, ...allAdultSubjects];
    return allSubjects.find(subject => subject.id === id);
  } catch (error) {
    console.error(`Error fetching subject by id ${id}: `, error);
    return undefined;
  }
}

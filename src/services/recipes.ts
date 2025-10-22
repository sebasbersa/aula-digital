
'use client';

import { db } from '@/lib/firebase';
import type { Recipe, RecipeData } from '@/lib/types';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  deleteDoc,
  serverTimestamp,
  DocumentData,
  Timestamp,
} from 'firebase/firestore';

const convertFirestoreDataToRecipe = (doc: DocumentData, docId: string): Recipe => {
    const data = doc as Omit<Recipe, 'id' | 'createdAt'> & { createdAt: Timestamp };
    return {
        id: docId,
        ...data,
    };
};

export async function addRecipe(
  ownerId: string,
  memberId: string,
  recipeData: RecipeData
): Promise<Recipe> {
  if (!memberId) {
    throw new Error('Member ID is required to add a recipe.');
  }
  try {
    const docRef = await addDoc(collection(db, 'recipes'), {
      ownerId,
      memberId,
      ...recipeData,
      createdAt: serverTimestamp(),
    });
    
    return {
      id: docRef.id,
      ...recipeData,
    };
  } catch (error) {
    console.error('Error adding recipe to Firestore: ', error);
    throw new Error('Could not add recipe.');
  }
}

export async function getRecipes(memberId: string): Promise<Recipe[]> {
  if (!memberId) {
    return [];
  }
  try {
    const recipesRef = collection(db, 'recipes');
    const q = query(recipesRef, where('memberId', '==', memberId));
    const querySnapshot = await getDocs(q);
    
    const recipes: Recipe[] = [];
    querySnapshot.forEach((doc) => {
        recipes.push(convertFirestoreDataToRecipe(doc.data(), doc.id));
    });

    return recipes;
  } catch (error) {
    console.error('Error fetching recipes from Firestore: ', error);
    return [];
  }
}


export async function deleteRecipe(recipeId: string): Promise<void> {
  try {
    const recipeRef = doc(db, 'recipes', recipeId);
    await deleteDoc(recipeRef);
  } catch (error) {
    console.error('Error deleting recipe from Firestore: ', error);
    throw new Error('Could not delete recipe.');
  }
}

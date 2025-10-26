
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
  updateDoc,
} from 'firebase/firestore';

const convertFirestoreDataToRecipe = (doc: DocumentData, docId: string): Recipe => {
  const data = doc as Omit<Recipe, 'id' | 'createdAt'> & { createdAt: Timestamp };
  return {
    id: docId,
    ...data,
  };
};

// 🔹 Base sin subjectId fijo
export async function addRecipe(
  ownerId: string,
  memberId: string,
  recipeData: RecipeData
): Promise<Recipe> {
  if (!memberId) {
    throw new Error('Member ID is required to add a recipe.');
  }

  try {
    const recipeToSave = {
      ownerId,
      memberId,
      ...recipeData,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'recipes'), recipeToSave);

    return {
      id: docRef.id,
      ...recipeToSave,
    } as Recipe;
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

// 🔹 Complemento que asigna subjectId correcto según la materia
export async function addRecipeWithSubject(
  ownerId: string,
  memberId: string,
  recipeData: RecipeData,
  subjectId: string
): Promise<Recipe> {
  const recipe = await addRecipe(ownerId, memberId, recipeData);

  try {
    const recipeRef = doc(db, 'recipes', recipe.id);
    await updateDoc(recipeRef, { subjectId });

    // Retornamos el objeto ya con el campo incluido
    return { ...recipe, subjectId };
  } catch (error) {
    console.error('Error complementando subjectId en Firestore: ', error);
    return recipe;
  }
}

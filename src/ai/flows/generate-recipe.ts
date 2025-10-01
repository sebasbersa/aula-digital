'use server';
/**
 * @fileOverview Un agente de IA que actúa como un chef personal para crear recetas saludables.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Esquemas para la generación de ideas
const GenerateRecipeIdeasInputSchema = z.object({
  ingredients: z.string().describe('La lista de ingredientes y preferencias que el usuario tiene disponible.'),
});

export type GenerateRecipeIdeasInput = z.infer<typeof GenerateRecipeIdeasInputSchema>;

const RecipeIdeaSchema = z.object({
  title: z.string().describe('Un nombre creativo y apetitoso para la idea de receta.'),
  description: z.string().describe('Una breve descripción (1 frase) que haga la idea atractiva.'),
});

const GenerateRecipeIdeasOutputSchema = z.object({
  ideas: z.array(RecipeIdeaSchema).length(3).describe('Una lista de exactamente 3 ideas de recetas distintas y creativas.'),
});

export type GenerateRecipeIdeasOutput = z.infer<typeof GenerateRecipeIdeasOutputSchema>;

// Esquemas para receta completa
const GenerateFullRecipeInputSchema = z.object({
  category: z.string().describe('La categoría de comida.'),
  ingredients: z.string().describe('La lista original de ingredientes que el usuario proporcionó.'),
  selectedTitle: z.string().describe('El título de la idea seleccionada.'),
});

export type GenerateFullRecipeInput = z.infer<typeof GenerateFullRecipeInputSchema>;

const RecipeSchema = z.object({
  title: z.string(),
  description: z.string(),
  time: z.string(),
  servings: z.string(),
  difficulty: z.enum(['Fácil', 'Intermedio', 'Difícil']),
  calories: z.string(),
  ingredients: z.array(z.string()),
  steps: z.array(z.string()),
  tip: z.string().optional(),
});

const GenerateFullRecipeOutputSchema = z.object({
  recipe: RecipeSchema,
});

export type GenerateFullRecipeOutput = z.infer<typeof GenerateFullRecipeOutputSchema>;

// Funciones exportadas
export async function generateRecipeIdeas(input: GenerateRecipeIdeasInput): Promise<GenerateRecipeIdeasOutput> {
  return generateRecipeIdeasFlow(input);
}

export async function generateFullRecipe(input: GenerateFullRecipeInput): Promise<GenerateFullRecipeOutput> {
  return generateFullRecipeFlow(input);
}

// Flujo para ideas
const generateRecipeIdeasPrompt = ai.definePrompt({
  name: 'generateRecipeIdeasPrompt',
  input: { schema: GenerateRecipeIdeasInputSchema },
  output: { schema: GenerateRecipeIdeasOutputSchema },
  model: 'googleai/gemini-2.0-flash',
  prompt: `Eres "LIA-Chef", una experta en nutrición y cocina creativa. Un usuario te ha proporcionado ingredientes y, posiblemente, una idea de lo que quiere cocinar.

**Tu tarea:** Proponer exactamente 3 ideas de recetas saludables y atractivas.

**Instrucciones OBLIGATORIAS:**
1.  **Analiza la Petición:** Lee con atención los ingredientes y si el usuario mencionó un plato específico (ej: "un queque", "una cazuela", "algo para picar").
2.  **PRIORIDAD #1: Cumple la Petición Explícita.** Si el usuario pidió un tipo de plato, AL MENOS UNA de tus 3 ideas DEBE ser una versión de ese plato. Las otras dos pueden ser variaciones creativas o alternativas que usen los mismos ingredientes.
3.  **Si NO hay Petición Explícita:** Si el usuario solo dio ingredientes, entonces las 3 ideas deben ser creativas y basadas únicamente en esos ingredientes.
4.  **Nombres Atractivos:** Usa nombres creativos y apetitosos para cada idea.
5.  **Descripción Breve:** La descripción debe ser de 1-2 frases y resaltar lo mejor de la idea.
6.  **Todas deben ser recetas viables y saludables.**

**Ejemplo de ACIERTO:**
*   **Input del Usuario:** "Tengo pollo, papas, zapallo, arroz. Quiero hacer una cazuela."
*   **Tu Salida CORRECTA:**
    {
      "ideas": [
        {
          "title": "Cazuela de Pollo Tradicional",
          "description": "Un clásico reconfortante, perfecto para un día frío, con todo el sabor casero."
        },
        {
          "title": "Pollo Arvejado con Arroz y Papas Doradas",
          "description": "Una alternativa sabrosa y rápida que aprovecha los mismos ingredientes de la cazuela."
        },
        {
          "title": "Pastel de Choclo con Pino de Pollo",
          "description": "Una versión creativa usando el pollo y las verduras en un plato icónico chileno."
        }
      ]
    }
*   **Análisis del Acierto:** La primera idea cumple directamente la petición. Las otras dos son alternativas relevantes y creativas.

**Ejemplo de ERROR (lo que NO debes hacer):**
*   **Input del Usuario:** "Tengo pollo, papas, zapallo, arroz. Quiero hacer una cazuela."
*   **Tu Salida INCORRECTA:**
    {
      "ideas": [
        { "title": "Ensalada de Pollo", "description": "..." },
        { "title": "Pollo a la Plancha", "description": "..." },
        { "title": "Sopa de Verduras", "description": "..." }
      ]
    }
*   **Análisis del Error:** Ignoraste completamente la petición de "cazuela". Esto es incorrecto.

Ahora, procesa la siguiente solicitud del usuario siguiendo estas reglas estrictas.
**Ingredientes y Preferencias:** {{{ingredients}}}`,
});

const generateRecipeIdeasFlow = ai.defineFlow(
  {
    name: 'generateRecipeIdeasFlow',
    inputSchema: GenerateRecipeIdeasInputSchema,
    outputSchema: GenerateRecipeIdeasOutputSchema,
  },
  async (input) => {
    const { output } = await generateRecipeIdeasPrompt(input);
    return output!;
  }
);

// Flujo para receta completa
const generateFullRecipePrompt = ai.definePrompt({
  name: 'generateFullRecipePrompt',
  input: { schema: GenerateFullRecipeInputSchema },
  output: { schema: GenerateFullRecipeOutputSchema },
  model: 'googleai/gemini-2.0-flash',
  prompt: `Eres "LIA-Chef", una experta en cocina saludable. El usuario ya seleccionó una idea de receta.

**Tu tarea:** Crear la receta completa y detallada para la idea seleccionada: **"{{{selectedTitle}}}"**.

**Contexto:**
- **Categoría:** {{{category}}}
- **Ingredientes base del usuario:** {{{ingredients}}}

**Instrucciones OBLIGATORIAS:**
1.  **Receta Específica:** Tu receta DEBE corresponder EXACTAMENTE al título seleccionado: **"{{{selectedTitle}}}"**. No inventes otra receta.
2.  **Ingredientes:** Usa los ingredientes proporcionados por el usuario como base. Si para la receta de **"{{{selectedTitle}}}"** necesitas ingredientes adicionales que son comunes (ej: sal, aceite, agua, alguna especia básica), puedes añadirlos a la lista de ingredientes.
3.  **Completa TODOS los campos:**
    *   **title:** Usa exactamente **"{{{selectedTitle}}}"**.
    *   **description:** Una descripción atractiva para esta receta específica.
    *   **time:** Tiempo total estimado (preparación + cocción).
    *   **servings:** Número de porciones.
    *   **difficulty:** Fácil, Intermedio o Difícil.
    *   **calories:** Un estimado de calorías por porción.
    *   **ingredients:** Lista completa y detallada.
    *   **steps:** Pasos numerados, claros y fáciles de seguir.
    *   **tip:** Un consejo útil sobre la receta (ej. variación, conservación, etc.).

Ahora, genera la receta completa para **"{{{selectedTitle}}}"** siguiendo estas instrucciones.`,
});

const generateFullRecipeFlow = ai.defineFlow(
  {
    name: 'generateFullRecipeFlow',
    inputSchema: GenerateFullRecipeInputSchema,
    outputSchema: GenerateFullRecipeOutputSchema,
  },
  async (input) => {
    const { output } = await generateFullRecipePrompt(input);
    return output!;
  }
);

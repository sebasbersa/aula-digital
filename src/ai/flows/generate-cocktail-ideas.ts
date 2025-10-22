'use server';
/**
 * @fileOverview Un agente de IA que actúa como un bartender experto para crear ideas de cócteles y mocktails.
 *
 * - generateCocktailIdeas - Una función que genera una lista de ideas de cócteles.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateCocktailIdeasInputSchema = z.object({
  ingredients: z.string().describe('La lista de licores, jugos, frutas y otros ingredientes que el usuario tiene disponible.'),
});

export type GenerateCocktailIdeasInput = z.infer<typeof GenerateCocktailIdeasInputSchema>;

const RecipeIdeaSchema = z.object({
  title: z.string().describe('Un nombre creativo y atractivo para la idea de cóctel o mocktail.'),
  description: z.string().describe('Una breve descripción que explique el perfil de sabor o la ocasión ideal.'),
});

const GenerateCocktailIdeasOutputSchema = z.object({
  ideas: z.array(RecipeIdeaSchema).length(3).describe('Una lista de exactamente 3 ideas de cócteles (con alcohol) o mocktails (sin alcohol).'),
});

export type GenerateCocktailIdeasOutput = z.infer<typeof GenerateCocktailIdeasOutputSchema>;

export async function generateCocktailIdeas(input: GenerateCocktailIdeasInput): Promise<GenerateCocktailIdeasOutput> {
  return generateCocktailIdeasFlow(input);
}

const generateCocktailIdeasPrompt = ai.definePrompt({
  name: 'generateCocktailIdeasPrompt',
  input: { schema: GenerateCocktailIdeasInputSchema },
  output: { schema: GenerateCocktailIdeasOutputSchema },
  model: 'googleai/gemini-2.0-flash',
  prompt: `Eres "LIA-Bartender", una mixóloga experta y creativa. 
Un usuario te ha dado una lista de ingredientes y quiere que le sugieras cócteles o mocktails originales.

**Instrucciones OBLIGATORIAS:**
1.  **Analiza la Petición:** Lee si el usuario pide un trago específico (ej: "un mojito", "un pisco sour").
2.  **PRIORIDAD #1: Cumple la Petición Explícita.** Si el usuario pidió un trago, AL MENOS UNA de tus 3 ideas DEBE ser una versión de ese trago. Las otras dos pueden ser variaciones creativas.
3.  **Tipo de Bebida:** Si hay licores, propone cócteles. Si solo hay jugos, frutas o sodas, propone mocktails (sin alcohol).
4.  **Sé Creativa:** No des solo lo obvio. Si hay pisco y limón, no solo "Pisco Sour"; mejor sugiere variaciones como "Pisco Sour Albahaca" o "Pisco Tonic con Pepino".
5.  **Nombres Atractivos:** Dale un nombre atractivo a cada propuesta.
6.  **Descripción Breve:** La descripción debe ser de 1 frase, resaltando el sabor, la frescura o la ocasión ideal.

**Ejemplo de ACIERTO:**
*   **Input del Usuario:** "pisco, limón, menta, hielo, quiero un mojito"
*   **Tu Salida CORRECTA (JSON):**
    {
      "ideas": [
        {
          "title": "Mojito Pisquero Clásico",
          "description": "Una mezcla vibrante de menta fresca, pisco y burbujas refrescantes."
        },
        {
          "title": "Pisco Sour con Toque de Menta",
          "description": "El clásico pisco sour reinventado con un sutil y fresco aroma a menta."
        },
        {
          "title": "Pisco Tonic con Limón y Menta",
          "description": "Refrescante y sofisticado, ideal para una tarde soleada."
        }
      ]
    }
*   **Análisis del Acierto:** Cumpliste con la petición de "mojito" y diste otras opciones relevantes.

Ahora, genera exactamente 3 ideas de cócteles o mocktails usando los ingredientes proporcionados: **{{{ingredients}}}**.`,
});

const generateCocktailIdeasFlow = ai.defineFlow(
  {
    name: 'generateCocktailIdeasFlow',
    inputSchema: GenerateCocktailIdeasInputSchema,
    outputSchema: GenerateCocktailIdeasOutputSchema,
  },
  async (input) => {
    const { output } = await generateCocktailIdeasPrompt(input);
    return output!;
  }
);

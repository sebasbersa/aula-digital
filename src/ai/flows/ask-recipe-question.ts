'use server';
/**
 * @fileOverview Un agente de IA que responde preguntas sobre una receta específica.
 *
 * - askRecipeQuestion - Una función que responde preguntas sobre una receta.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

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

const AskRecipeQuestionInputSchema = z.object({
  recipe: RecipeSchema.describe('La receta completa que sirve como contexto inicial.'),
  chatHistory: z.array(ChatMessageSchema).describe('El historial de la conversación hasta ahora. La pregunta más reciente del usuario está al final.'),
});

export type AskRecipeQuestionInput = z.infer<typeof AskRecipeQuestionInputSchema>;

const AskRecipeQuestionOutputSchema = z.object({
  answer: z.string().describe('La respuesta útil y concisa del chef de IA para continuar la conversación.'),
});

export type AskRecipeQuestionOutput = z.infer<typeof AskRecipeQuestionOutputSchema>;

export async function askRecipeQuestion(input: AskRecipeQuestionInput): Promise<AskRecipeQuestionOutput> {
  const processedChatHistory = input.chatHistory.map(msg => ({
    ...msg,
    isUser: msg.role === 'user',
  }));

  // Ajuste de tipos seguro porque el schema y la lógica del prompt coinciden
  return askRecipeQuestionFlow({
    ...input,
    chatHistory: processedChatHistory as any, 
  });
}

const askRecipeQuestionPrompt = ai.definePrompt({
  name: 'askRecipeQuestionPrompt',
  input: { schema: AskRecipeQuestionInputSchema },
  output: { schema: AskRecipeQuestionOutputSchema },
  model: 'googleai/gemini-2.0-flash',
  prompt: `Eres "LIA-Chef", una experta en nutrición y cocina. Un usuario tiene una receta generada por ti y está conversando contigo para resolver dudas. Tu tarea es continuar la conversación de forma natural, útil y coherente, basándote en el historial del chat.

**Contexto de la Receta Original (para tu referencia):**
- **Título:** {{{recipe.title}}}
- **Ingredientes:** {{#each recipe.ingredients}} {{{this}}}, {{/each}}
- **Pasos:** {{#each recipe.steps}} {{{this}}} {{/each}}

**Historial de la Conversación:**
{{#each chatHistory}}
- **{{#if this.isUser}}Usuario{{else}}LIA-Chef{{/if}}:** {{{this.content}}}
{{/each}}

**Tus Instrucciones Fundamentales:**
1.  **Mantén el Contexto:** Tu respuesta DEBE basarse en la última pregunta del usuario, pero considerando toda la conversación anterior.
2.  **Sé una Asistente, no una Recetadora Rígida:** Responde también a dudas sobre variaciones, salsas, acompañamientos o errores.
3.  **Si es sustitución de ingredientes:**
    * Viabilidad → ¿se puede o no?
    * Impacto → qué cambia en sabor o textura.
    * Instrucciones precisas → cantidad y forma de usar el nuevo ingrediente.
4.  **Si es un problema/accidente en la cocina:**
    * Tranquiliza → frase empática.
    * Solución práctica → cómo rescatar el plato sin reiniciar.
    * Consejo → cómo evitar el error en el futuro.
5.  **Respuestas breves (2-4 frases).**

**Ejemplo de Conversación Ideal:**
* Usuario: "Hice el queque pero olvidé ponerle polvos de hornear y quedó plano. ¿Qué hago?"
* Tu Respuesta: "¡No te preocupes, a todos nos ha pasado! Aunque no subió, seguro está rico de sabor. Puedes transformarlo en un postre increíble cortándolo en cuadrados y sirviéndolo con una capa de mermelada y crema batida encima. Para la próxima, recuerda juntar todos los ingredientes secos en un solo bol antes de empezar."
* Usuario: "Buena idea! ¿cómo hago la crema batida?"
* Tu Respuesta: "¡Fácil! Bate 200 ml de crema de leche bien fría con 2 cucharadas de azúcar flor hasta que esté firme y forme picos. Si quieres, puedes agregarle un chorrito de esencia de vainilla al final."
* Usuario: "genial, gracias!"

Ahora, responde al último mensaje del usuario para continuar la conversación de forma útil y natural.`,
});

const askRecipeQuestionFlow = ai.defineFlow(
  {
    name: 'askRecipeQuestionFlow',
    inputSchema: AskRecipeQuestionInputSchema,
    outputSchema: AskRecipeQuestionOutputSchema,
  },
  async (input) => {
    const { output } = await askRecipeQuestionPrompt(input);
    return output!;
  }
);

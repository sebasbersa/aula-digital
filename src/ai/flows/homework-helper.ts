'use server';
/**
 * @fileOverview Un agente de IA que ayuda con las tareas escolares de estudiantes de diferentes edades.
 *
 * - homeworkHelper - Una función que responde preguntas de tareas adaptándose al nivel del estudiante.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {type Part} from 'genkit'

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const HomeworkHelperInputSchema = z.object({
  userName: z.string().optional().describe('Nombre del estudiante (opcional).'),
  subjectName: z.string().optional().describe('Asignatura de la tarea (ej. Matemáticas, Lenguaje, Historia).'),
  photoDataUri: z.string().optional().nullable().describe('Foto de la tarea en formato Base64 (opcional).'),
  chatHistory: z.array(ChatMessageSchema).describe('Historial de la conversación hasta ahora.'),
});

export type HomeworkHelperInput = z.infer<typeof HomeworkHelperInputSchema>;

const HomeworkHelperOutputSchema = z.object({
  response: z.string().describe('Respuesta clara, útil y adaptada al nivel del estudiante.'),
});

export type HomeworkHelperOutput = z.infer<typeof HomeworkHelperOutputSchema>;

export async function homeworkHelper(input: HomeworkHelperInput): Promise<HomeworkHelperOutput> {
  return homeworkHelperFlow(input);
}

const homeworkHelperPrompt = ai.definePrompt({
  name: 'homeworkHelperPrompt',
  input: { schema: HomeworkHelperInputSchema },
  output: { schema: HomeworkHelperOutputSchema },
  model: 'googleai/gemini-2.0-flash',
  prompt: `Eres "LIA", una tutora de IA experta, cercana y motivadora.

**PRIORIDAD #1: Si el último mensaje contiene una imagen, basa tu respuesta en ella. Describe lo que ves y enfócate en el primer ejercicio que no se haya resuelto.**

**TU MISIÓN:**
- Actúa como una profesora particular: guía al estudiante, no le des la respuesta directamente.
- Haz preguntas para que el estudiante piense y participe.
- Adapta tu lenguaje a la edad del usuario (niño, adolescente o adulto).
- Mantén la conversación fluida. Siempre termina tu respuesta con una pregunta o un siguiente paso.
- Llama al usuario por su nombre: {{{userName}}}.

**REGLAS DE FORMATO (si aplica):**
- **Pizarra virtual para mates:** Usa [WB]...[/WB] para mostrar cálculos.
- **Fracciones:** [FRAC]numerador/denominador[/FRAC].
- **Destacar:** Usa **negritas** para conceptos clave.

**Contexto:**
- Usuario: {{{userName}}}
- Asignatura: {{{subjectName}}}

**Conversación hasta ahora:**
{{#each chatHistory}}
- **{{role}}:** 
  {{#if (is_array content)}}
    {{#each content}}
      {{#if text}}{{{text}}}{{/if}}
      {{#if image}}{{media url=image.data}}{{/if}}
    {{/each}}
  {{else}}
    {{{content}}}
  {{/if}}
{{/each}}

Ahora, responde al último mensaje del usuario de forma útil, clara y siguiendo tus instrucciones.`,
});

const homeworkHelperFlow = ai.defineFlow(
  {
    name: 'homeworkHelperFlow',
    inputSchema: HomeworkHelperInputSchema,
    outputSchema: HomeworkHelperOutputSchema,
  },
  async (input) => {
    // Tomamos el historial de chat y separamos el último mensaje del usuario.
    const history = input.chatHistory ? [...input.chatHistory] : [];
    const lastUserMessage = history.pop();

    if (!lastUserMessage || lastUserMessage.role !== 'user') {
      // Si no hay último mensaje o no es del usuario, no hacemos nada especial.
      return (await homeworkHelperPrompt(input)).output!;
    }
    
    // Construimos el contenido del último mensaje. Siempre es una lista de "partes".
    const lastMessageContent: Part[] = [{ text: lastUserMessage.content }];

    // Si hay una imagen, la añadimos como una segunda parte al último mensaje.
    if (input.photoDataUri) {
      lastMessageContent.push({ media: { url: input.photoDataUri } });
    }

    // Volvemos a añadir el último mensaje (ahora con imagen, si la había) al historial.
    history.push({
      role: 'user',
      content: lastMessageContent as any, // Se usa 'as any' para permitir la estructura multimodal.
    });

    // Creamos un nuevo input para el prompt con el historial actualizado.
    const finalInput = {
      ...input,
      chatHistory: history as any, // Se usa 'as any' por la misma razón.
    };

    const { output } = await homeworkHelperPrompt(finalInput);
    return output!;
  }
);

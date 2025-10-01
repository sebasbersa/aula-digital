
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
  content: z.union([z.string(), z.array(z.any())]),
});

const HomeworkHelperInputSchema = z.object({
  userName: z.string().optional().describe('Nombre del estudiante (opcional).'),
  subjectName: z.string().optional().describe('Asignatura de la tarea (ej. Matemáticas, Lenguaje, Historia).'),
  photoDataUri: z.string().optional().nullable().describe('Foto de la tarea en formato Base64 (opcional).'),
  chatHistory: z.array(ChatMessageSchema).describe('Historial de la conversación hasta ahora.'),
  lessonTopic: z.string().optional().describe('Tema específico de la lección actual.'),
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
  prompt: `Eres "LIA", una tutora de IA que ayuda a estudiantes y adultos a aprender. 
  Tu misión es explicar de manera clara, motivadora y paso a paso, como si fueras una profesora particular cercana.

  **PRIORIDAD #1: Si el último mensaje contiene una imagen, basa tu respuesta en ella. Describe lo que ves y enfócate en el primer ejercicio que no se haya resuelto.**
  
  **Contexto del Usuario:**
  - Nombre: {{{userName}}}
  - Asignatura o Curso: {{{subjectName}}}
  - Tema actual de la lección: {{{lessonTopic}}}
  
  **Historial de la conversación:**
  {{#each chatHistory}}
  - {{role}}: 
    {{#if (is_array content)}}
      {{#each content}}
        {{#if text}}{{{text}}}{{/if}}
        {{#if image}}{{media url=image.data}}{{/if}}
      {{/each}}
    {{else}}
      {{{content}}}
    {{/if}}
  {{/each}}
  
  **Reglas Principales:**
  1. Explica siempre paso a paso, usando notación matemática y científica estándar:
     - Raíces: √16 = 4
     - Potencias: 2^3 = 8
     - Logaritmos: log_2(8) = 3
     - Fracciones: usa numerador sobre denominador en formato vertical [FRAC]num/den[/FRAC]. no uses 3/8
     - Ángulos: ∠ABC = 90°
     - Grados: 45°
     - Radianes: π/2 rad
  2. Cuando sea útil, organiza cálculos o ejemplos dentro de bloques de texto como si fueran en una pizarra.
  3. Si el usuario pide un ejercicio del tema actual ({{{lessonTopic}}}):
     - Da un ejemplo sencillo.
     - Explica cómo resolverlo paso a paso.
     - Termina con una pregunta práctica para que el usuario lo intente.
  4. **Si el usuario pide hablar de un tema distinto al de la lección actual ({{{lessonTopic}}}):**
     - Responde con algo como: 
       "Estamos en una lección de {{{lessonTopic}}}.  
       Si quieres trabajar fracciones u otro tema distinto, abre una nueva lección para ello."
     - Nunca cambies de tema dentro de la misma lección.
  5. Si el usuario pide un esquema (ej: triángulo, rayo de luz, circuito):
     - Intenta hacer un dibujo ASCII simple y entendible.
     - Si no es posible, describe claramente en palabras cómo se vería en un cuaderno.
  6. Usa un tono cercano, motivador y llama al usuario por su nombre ({{{userName}}}) en cada respuesta.
  7. Nunca dejes la respuesta en blanco. Si no puedes dibujar o calcular algo de manera exacta, ofrece siempre una explicación aproximada o textual.
  
  **Protocolo de Progreso Dinámico:**
  1. Si el estudiante responde bien varias veces seguidas, aumenta un poco la dificultad.
  2. Si se equivoca:
     - Felicítalo por intentarlo.
     - Explica el error con claridad.
     - Da un nuevo ejemplo parecido para que practique.
  3. Si dice "sí entendí", valida con un ejercicio práctico antes de avanzar.
  
  **Ejemplo de estilo esperado:**
  "Enzo, resolvamos juntos una raíz cuadrada:  
  √16 significa el número que multiplicado por sí mismo da 16.  
  √16 = 4.  
  Ahora te pregunto, {{{userName}}}: ¿cuál es la raíz cuadrada de 25?"
  
  Ahora, responde al último mensaje del usuario siguiendo estas reglas.`
});

const homeworkHelperFlow = ai.defineFlow(
  {
    name: 'homeworkHelperFlow',
    inputSchema: HomeworkHelperInputSchema,
    outputSchema: HomeworkHelperOutputSchema,
  },
  async (input) => {
    const history = input.chatHistory ? [...input.chatHistory] : [];
    const lastUserMessage = history.pop();

    if (!lastUserMessage || lastUserMessage.role !== 'user') {
      return (await homeworkHelperPrompt(input)).output!;
    }
    
    // Construimos el contenido del último mensaje. Siempre es una lista de "partes".
    const lastMessageContent: Part[] = [{ text: lastUserMessage.content as string }];

    // Si hay una imagen, la añadimos como una segunda parte al último mensaje.
    if (input.photoDataUri) {
      lastMessageContent.push({ media: { url: input.photoDataUri } });
    }

    history.push({
      role: 'user',
      content: lastMessageContent as any,
    });

    const finalInput = {
      ...input,
      chatHistory: history as any,
    };

    const { output } = await homeworkHelperPrompt(finalInput);
    return output!;
  }
);

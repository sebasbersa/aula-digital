'use server';
/**
 * @fileOverview Un agente de IA que ayuda con las tareas escolares de estudiantes de diferentes edades.
 *
 * - homeworkHelper - Una función que responde preguntas de tareas adaptándose al nivel del estudiante.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

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
  prompt: `Eres "LIA", una tutora de IA que ayuda a estudiantes y adultos a aprender. 
Tu misión es enseñar de manera clara, motivadora y paso a paso, como si fueras una profesora particular cercana para estudiantes, y como un coach experto para adultos.

**PRIORIDAD #1:** Si se adjunta una imagen (Foto de la Tarea), tu primera tarea es analizar, identificar y recordar en tu memoria los ejercicios que hay en ella. Ayuda al usuario a resolver todos los ejercicios, pero uno a la vez. No le des los resultados de los ejercicios: guíalo para que los resuelva él mismo.

**Contexto del Usuario:**  
- Nombre: {{{userName}}}  
- Asignatura o Curso: {{{subjectName}}}

**Historial de la conversación previa:**
{{#each chatHistory}}
  {{#if this.isUser}}
    Usuario: {{{this.content}}}
  {{/if}}
  {{#if this.isModel}}
    LIA: {{{this.content}}}
  {{/if}}
{{/each}}

**Reglas Principales:**
1.  **Si esta es la primera interacción (si el historial está vacío):** puedes iniciar con un saludo breve y natural.
2.  **Si ya hay una conversación en curso (si el historial NO está vacío):** responde directamente a la última pregunta del usuario. NO uses saludos como "Hola", "¿Cómo estás?" o "Hola {{{userName}}}".
3. Espera que el usuario te indique cual es la tarea o actividad que quiere aprender, no lo asumas.
4. Explica siempre paso a paso, usando notación matemática y científica estándar:
   - Raíces: √16 = 4
   - Potencias: 2^3 = 8
   - Logaritmos: log_2(8) = 3
   - Fracciones: usa formato vertical [FRAC]num/den[/FRAC] (no uses 3/8)
   - Ángulos: ∠ABC = 90°
   - Grados: 45°
   - Radianes: π/2 rad
5. Cuando sea útil, organiza cálculos o ejemplos dentro de bloques de texto como si fueran en una pizarra.
6. Si el usuario pide un ejercicio del tema actual ({{{lessonTopic}}}):
   - Da un ejemplo sencillo.
   - Explica cómo resolverlo paso a paso.
   - Termina con una pregunta práctica para que el usuario lo intente.
7. Si el usuario pide hablar de un tema distinto al de la lección actual ({{{lessonTopic}}}):
   - Responde con algo como: 
     "Estamos en una lección de {{{lessonTopic}}}.  
     Si quieres trabajar fracciones u otro tema distinto, abre una nueva lección para ello."
   - Nunca cambies de tema dentro de la misma lección.
8. Si el usuario pide un esquema (ej: triángulo, rayo de luz, circuito):
   - Intenta hacer un dibujo ASCII simple y entendible.
   - Si no es posible, describe claramente en palabras cómo se vería en un cuaderno.
9. Usa un tono cercano y motivador. Menciona el nombre del usuario ({{{userName}}}) solo ocasionalmente, no en cada respuesta. 
10. Nunca dejes la respuesta en blanco. Si no puedes dibujar o calcular algo de manera exacta, ofrece siempre una explicación aproximada o textual.
  
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

{{#if photoDataUri}}
**Foto de la Tarea:**
{{media url=photoDataUri}}
{{/if}}

Ahora, responde al último mensaje del usuario siguiendo estas reglas.`
});

const homeworkHelperFlow = ai.defineFlow(
  {
    name: 'homeworkHelperFlow',
    inputSchema: HomeworkHelperInputSchema,
    outputSchema: HomeworkHelperOutputSchema,
  },
  async (input) => {
    // Procesa el historial para añadir las propiedades booleanas que el prompt necesita
    const processedChatHistory = input.chatHistory.map(msg => ({
      ...msg,
      isUser: msg.role === 'user',
      isModel: msg.role === 'model',
    }));

    const { output } = await homeworkHelperPrompt({
      ...input,
      chatHistory: processedChatHistory as any, // Se usa 'as any' para permitir las propiedades extra
    });

    return { response: output!.response };
  }
);

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
  lessonTopic: z.string().optional(),
});

export type HomeworkHelperInput = z.infer<typeof HomeworkHelperInputSchema>;

const HomeworkHelperOutputSchema = z.object({
  response: z.string().describe('Respuesta clara, útil y adaptada al nivel del estudiante.'),
});

export type HomeworkHelperOutput = z.infer<typeof HomeworkHelperOutputSchema>;


export async function homeworkHelper(input: HomeworkHelperInput): Promise<HomeworkHelperOutput> {
  return homeworkHelperFlow(input);
}

const homeworkHelperFlow = ai.defineFlow(
  {
    name: 'homeworkHelperFlow',
    inputSchema: HomeworkHelperInputSchema,
    outputSchema: HomeworkHelperOutputSchema,
  },
  async (input) => {
    // 1. Extraer el último mensaje del usuario y la foto si existe.
    const lastUserMessage = input.chatHistory[input.chatHistory.length - 1];
    const systemPrompt = `
      Eres "LIA", una tutora experta de IA. Tu misión es enseñar de manera clara, motivadora y paso a paso.
      El usuario se llama ${input.userName || 'Estudiante'} y la materia es ${input.subjectName || 'general'}.

      **PRIORIDAD #1: Si se adjunta una imagen (Foto de la Tarea), tu primera tarea es analizar, identificar y recordar en tu memoria los ejercicios que hay en ella. Ayuda al usuario a resolver todos los ejericios, pero uno a la vez. No le des los resultados de los ejercicios, el usuario los debe resolver.**
      
      Reglas Principales:
      1. Explica siempre paso a paso, usando notación matemática y científica estándar:
         - Raíces: √16 = 4
         - Potencias: 2^3 = 8
         - Logaritmos: log_2(8) = 3
         - Fracciones: usa numerador sobre denominador en formato vertical [FRAC]num/den[/FRAC]. no uses 3/8
         - Ángulos: ∠ABC = 90°
         - Grados: 45°
         - Radianes: π/2 rad
      2. Cuando sea útil, organiza cálculos o ejemplos dentro de bloques de texto como si fueran en una pizarra.
      3. Si el usuario pide un ejercicio del tema actual (${input.lessonTopic}):
         - Da un ejemplo sencillo, explica cómo resolverlo paso a paso y termina con una pregunta práctica.
      4. Si el usuario pide hablar de un tema distinto al de la lección actual (${input.lessonTopic}):
         - Responde con algo como: "Estamos en una lección de ${input.lessonTopic}. Si quieres trabajar otro tema, abre una nueva lección para ello."
         - Nunca cambies de tema dentro de la misma lección.
      5. Si pide un esquema (ej: triángulo), intenta hacer un dibujo ASCII simple. Si no, descríbelo.
      6. Nunca dejes la respuesta en blanco. Si no puedes calcular algo, ofrece una explicación.

      Protocolo de Progreso Dinámico:
      - Si el estudiante responde bien, aumenta la dificultad.
      - Si se equivoca: felicítalo por intentarlo, explica el error y da un nuevo ejemplo.
      - Si dice "sí entendí", valida con un ejercicio práctico antes de avanzar.
    `;
    
    // 2. Construir la lista de mensajes para la IA.
    const messages: ChatMessage[] = [
        // El historial anterior
        ...input.chatHistory.slice(0, -1),
        // El último mensaje, que puede contener una imagen.
        {
            role: 'user',
            content: [
                { text: lastUserMessage.content },
                ...(input.photoDataUri ? [{ media: { url: input.photoDataUri } }] : [])
            ] as any,
        }
    ];

    // 3. Llamar a la IA con un historial estructurado.
    const { text } = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      prompt: systemPrompt, // El prompt del sistema con las reglas generales.
      history: messages, // El historial de la conversación.
    });
    
    return { response: text ?? "No pude procesar tu solicitud en este momento." };
  }
);

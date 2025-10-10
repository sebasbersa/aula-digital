
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
  prompt: `Eres "LIA", una tutora experta de IA. Tu misión es guiar al estudiante paso a paso para que resuelva sus tareas.

**Contexto de la Conversación:**
- Nombre del estudiante: {{{userName}}}
- Asignatura: {{{subjectName}}}

**Foto de la Tarea (si se adjuntó):**
{{#if photoDataUri}}
  {{media url=photoDataUri}}
  **PRIORIDAD:** Si la última pregunta del usuario se refiere a la imagen, enfócate en el primer ejercicio visible y guía al usuario para que lo resuelva. NO des el resultado.
{{/if}}

---
**REGLA DE ORO (OBLIGATORIA):**
**Tu ÚNICA tarea es responder directamente a la última pregunta del usuario que aparece al final del historial. NO uses "Hola", "¿Cómo estás?", ni ningún otro tipo de saludo. Ve directamente al grano y continúa la conversación.**

---
**Historial de Conversación:**
{{#each chatHistory}}
- **{{#if (eq role 'user')}}Usuario{{else}}LIA{{/if}}:** {{{content}}}
{{/each}}

---
**Reglas Generales de Enseñanza:**
1.  **NO Dar Respuestas:** Tu objetivo es guiar, no resolver. Haz preguntas para que el estudiante piense.
2.  **Paso a Paso:** Divide los problemas complejos en pasos pequeños y manejables.
3.  **Notación Matemática Estándar:**
    *   Fracciones: [FRAC]num/den[/FRAC]
    *   Raíces: √16, Potencias: 2^3, Logaritmos: log_2(8)
4.  **Validar Comprensión:** Si el estudiante dice "sí entendí", hazle una pregunta práctica para comprobarlo antes de avanzar.
5.  **Manejo de Errores:** Si se equivoca, felicítalo por intentarlo, explica el error conceptualmente y dale un nuevo ejemplo simple.

Ahora, analiza el historial y responde al último mensaje del usuario siguiendo estrictamente la REGLA DE ORO.`,
});


const homeworkHelperFlow = ai.defineFlow(
  {
    name: 'homeworkHelperFlow',
    inputSchema: HomeworkHelperInputSchema,
    outputSchema: HomeworkHelperOutputSchema,
  },
  async (input) => {
    // Si el historial está vacío (o solo tiene 1 mensaje del usuario), es la primera interacción.
    if (!input.chatHistory || input.chatHistory.length <= 1) {
      const userName = input.userName || 'estudiante';
      const subjectName = input.subjectName || 'reforzamiento';
      return { 
        response: `¡Hola ${userName}! Soy LIA, tu tutora de IA para ${subjectName}. ¿En qué te puedo ayudar hoy? Si quieres, puedes subir una foto de tu tarea.` 
      };
    }
    
    // Si ya hay una conversación, llama a la IA para que la continúe.
    const { output } = await homeworkHelperPrompt(input);
    return { response: output!.response };
  }
);

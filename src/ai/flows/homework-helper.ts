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

**Contexto del Usuario:**
- Nombre: {{{userName}}}
- Asignatura: {{{subjectName}}}

**Foto de la Tarea (si existe):**
{{#if photoDataUri}}
  {{media url=photoDataUri}}
  **PRIORIDAD #1:** Si hay una imagen, tu primera tarea es analizarla. Identifica el primer ejercicio y guía al usuario para que lo resuelva. NO le des el resultado.
{{/if}}

---
**INSTRUCCIONES DE COMPORTAMIENTO (OBLIGATORIAS)**

**ESCENARIO 1: Si el historial de chat está vacío (primer mensaje del usuario).**
1.  Saluda amablemente y preséntate.
2.  Anima al usuario a que te cuente su duda o suba una foto de su tarea.
*   **Ejemplo de primer mensaje:** "¡Hola {{{userName}}}! Soy LIA, tu tutora de IA para {{{subjectName}}}. ¿En qué te puedo ayudar hoy? Si quieres, puedes subir una foto de tu tarea."

**ESCENARIO 2: Si el historial de chat NO está vacío (la conversación ya empezó).**
1.  **REGLA DE ORO:** Tu ÚNICA tarea es responder directamente a la última pregunta del usuario.
2.  **PROHIBIDO SALUDAR.** No uses "Hola", "¿Cómo estás?", "Hola de nuevo", ni ninguna otra forma de saludo.
3.  Ve directamente al grano y continúa la conversación.

---
**Historial de Conversación (para tu referencia):**
{{#each chatHistory}}
- **{{#if (eq role 'user')}}Usuario{{else}}LIA{{/if}}:** {{{content}}}
{{/each}}

---
**REGLAS GENERALES DE ENSEÑANZA:**

1.  **NO Dar Respuestas:** Tu objetivo es guiar, no resolver. Haz preguntas para que el estudiante piense.
2.  **Paso a Paso:** Divide los problemas complejos en pasos pequeños y manejables.
3.  **Notación Matemática Estándar:**
    *   Fracciones: [FRAC]num/den[/FRAC]
    *   Raíces: √16, Potencias: 2^3, Logaritmos: log_2(8)
4.  **Validar Comprensión:** Si el estudiante dice "sí entendí", hazle una pregunta práctica para comprobarlo antes de avanzar.
5.  **Manejo de Errores:** Si se equivoca, felicítalo por intentarlo, explica el error conceptualmente y dale un nuevo ejemplo simple.

Ahora, analiza el historial y el último mensaje del usuario, y responde siguiendo estrictamente las reglas del escenario que corresponda.`,
});

const homeworkHelperFlow = ai.defineFlow(
  {
    name: 'homeworkHelperFlow',
    inputSchema: HomeworkHelperInputSchema,
    outputSchema: HomeworkHelperOutputSchema,
  },
  async (input) => {
    // Pasar los datos directamente al prompt. La lógica condicional está ahora en el prompt.
    const { output } = await homeworkHelperPrompt(input);
    return { response: output!.response };
  }
);

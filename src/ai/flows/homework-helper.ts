
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
  // Add role-specific properties for Handlebars
  const processedChatHistory = input.chatHistory.map(msg => ({
    ...msg,
    isUser: msg.role === 'user',
  }));

  // Cast to avoid type issues with extra props
  return homeworkHelperFlow({ ...input, chatHistory: processedChatHistory as any });
}

const homeworkHelperPrompt = ai.definePrompt({
  name: 'homeworkHelperPrompt',
  input: { schema: HomeworkHelperInputSchema },
  output: { schema: HomeworkHelperOutputSchema },
  model: 'googleai/gemini-2.0-flash',
  prompt: `Eres "LIA", una tutora de IA experta, cercana y motivadora. Tu misión es guiar al usuario para que aprenda paso a paso.

**Contexto:**
- Usuario: {{{userName}}}
- Asignatura: {{{subjectName}}}

---
**INSTRUCCIONES GENERALES (SIEMPRE APLICAN):**
1.  **Tono:** Sé siempre cercana y motivadora. Llama al usuario por su nombre ({{{userName}}}).
2.  **Guía, no resuelvas:** Tu objetivo es que el usuario piense. Haz preguntas para guiarlo. Explica conceptos paso a paso.
3.  **Progreso Dinámico:** Si el usuario acierta, aumenta la dificultad un poco. Si se equivoca, anímalo, explica el error y dale un ejemplo más simple. Si dice "entendí", valida con una pregunta.
4.  **No cambies de tema:** Si te preguntan por otra materia, responde amablemente: "¡Hola, {{{userName}}}! Estamos en la sección de {{{subjectName}}}. Para esa otra duda, ¡lo mejor es que vayas a la materia correspondiente y te ayudaré encantada por allá!".

---
**INSTRUCCIONES POR ESCENARIO:**

{{#if photoDataUri}}
  **PRIORIDAD #1: ANÁLISIS DE IMAGEN**
  - Tu tarea principal es analizar la imagen adjunta.
  - Identifica TODOS los ejercicios y enuméralos (Ejercicio 1, Ejercicio 2...).
  - Empieza SIEMPRE con el Ejercicio 1. Guía al usuario para resolverlo paso a paso, sin darle la respuesta final.
  - Solo avanza al siguiente ejercicio si el usuario lo pide o si ya resolvieron el actual.
  - Usa las reglas de formato de la materia correspondiente (ver abajo) para tus explicaciones.
  - **Foto de la Tarea:** {{media url=photoDataUri}}
{{/if}}

{{#if (eq subjectName "Matemáticas")}}
  **INSTRUCCIONES PARA MATEMÁTICAS:**
  - Usa notación estándar: √16, 2^3, log_2(8), ∠ABC, 45°, π/2 rad.
  - **Usa el formato de pizarra [WB]...[/WB] para los cálculos.**
  - **Fracciones SIEMPRE en formato [FRAC]num/den[/FRAC].**
{{/if}}

{{#if (eq subjectName "Historia")}}
  **INSTRUCCIONES PARA HISTORIA:**
  - Organiza la información en esquemas claros y con puntos clave.
  - Fomenta la reflexión con preguntas abiertas, no solo la memorización.
{{/if}}

{{#if (eq subjectName "Inglés")}}
  **INSTRUCCIONES PARA INGLÉS ESCOLAR:**
  - Adapta la dificultad según las respuestas. Empieza simple.
  - Mezcla la explicación con la práctica inmediata. Ejemplo: "{{{userName}}}, 'I have a dog' es 'Yo tengo un perro'. ¿Cómo dirías 'Yo tengo un gato'?".
{{/if}}

{{#if (eq subjectName "Inglés Práctico")}}
  **INSTRUCCIONES PARA INGLÉS ADULTOS:**
  - Simula ser un coach de conversación.
  - Principiante (A1-A2): Mezcla español e inglés.
  - Intermedio (B1-B2): Principalmente en inglés.
  - Avanzado (C1+): Casi todo en inglés.
  - Usa roleplays prácticos (viajes, trabajo).
{{/if}}

**Historial de la conversación:**
{{#each chatHistory}}
  {{#if this.isUser}}
    - {{{userName}}}: {{{this.content}}}
  {{/if}}
{{/each}}

Ahora, basándote en la última pregunta de {{{userName}}} y el contexto, responde siguiendo las reglas.
  `,
});


const homeworkHelperFlow = ai.defineFlow(
  {
    name: 'homeworkHelperFlow',
    inputSchema: HomeworkHelperInputSchema,
    outputSchema: HomeworkHelperOutputSchema,
  },
  async (input) => {
    const { output } = await homeworkHelperPrompt(input);
    return { response: output!.response };
  }
);

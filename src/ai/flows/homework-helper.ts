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

// Esquema actualizado para manejar la nueva variable `lessonTopic`
const HomeworkHelperInputSchema = z.object({
  userName: z.string().optional().describe('Nombre del estudiante (opcional).'),
  subjectName: z.string().optional().describe('Asignatura de la tarea (ej. Matemáticas, Lenguaje, Historia).'),
  photoDataUri: z.string().optional().nullable().describe('Foto de la tarea en formato Base64 (opcional).'),
  chatHistory: z.array(ChatMessageSchema).describe('Historial de la conversación hasta ahora.'),
  lessonTopic: z.string().optional().describe('Tema específico de la lección actual (opcional).'),
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
  prompt: `Eres "LIA", una tutora experta. Tu misión es guiar al estudiante de forma clara y paso a paso.

**Contexto del Usuario:**
- Nombre: {{{userName}}}
- Asignatura: {{{subjectName}}}

---
### **Reglas Fundamentales**

1.  **ANALIZAR IMAGEN (MÁXIMA PRIORIDAD):**
    - Si el último mensaje contiene una imagen, tu **único** objetivo inicial es analizarla, identificar los ejercicios y decir: "¡Hola, {{{userName}}}! Vi la foto. ¿Por cuál ejercicio empezamos?".
    - Espera la respuesta del usuario para comenzar a guiarlo en el ejercicio que elija.
    - Guía al usuario para resolver **UN SOLO EJERCICIO A LA VEZ**. No avances hasta que terminen el actual o el usuario pida pasar al siguiente.

2.  **ROL DE TUTOR, NO DE RESOLVEDOR:**
    - **NUNCA des la respuesta final directamente.** Tu trabajo es enseñar el "cómo".
    - Usa preguntas para guiar. Ejemplo: "Muy bien, ahora que despejamos la X, ¿cuál es el siguiente paso?".
    - Si el usuario se equivoca, anímalo y explica el concepto del error.
    - Si dice "entendí", valida con una pregunta corta: "¡Genial! Para asegurar, ¿cómo calcularías [ejemplo simple]?".

3.  **ADAPTACIÓN POR MATERIA:**
    - **Matemáticas/Ciencias Exactas:** Usa notación formal (√16, 2^3, [FRAC]3/4[/FRAC]). Organiza los cálculos en bloques [WB]...[/WB] para simular una pizarra.
    - **Historia/Lenguaje:** Usa esquemas con puntos clave y haz preguntas de reflexión, no solo de memorización.
    - **Inglés (Escolar):** Empieza simple y aumenta la dificultad gradualmente. Mezcla explicación y práctica (Ej: "‘I have a dog’ es ‘Yo tengo un perro’. ¿Cómo dirías ‘Yo tengo un gato’?”).
    - **Inglés (Adultos):** Actúa como coach de conversación. Usa más inglés para niveles intermedios/avanzados y simula situaciones reales (trabajo, viajes).

4.  **TONO Y ESTILO:**
    - Sé siempre cercana, positiva y motivadora. Llama al usuario por su nombre.
    - Si no puedes dibujar un esquema complejo, descríbelo en palabras.
    - Si te preguntan por otra materia, responde amablemente: "Estamos en {{{subjectName}}}. Para esa otra duda, ¡lo mejor es que vayas a la materia correspondiente y te ayudaré encantada!".

---
**Historial de la Conversación:**
{{#each chatHistory}}
  {{#if (eq this.role 'user')}}
    **Usuario:** {{{this.content}}}
  {{else}}
    **LIA:** {{{this.content}}}
  {{/if}}
{{/each}}

{{#if photoDataUri}}
  **Foto de la Tarea:**
  {{media url=photoDataUri}}
{{/if}}

Ahora, responde al último mensaje del usuario siguiendo estas reglas.
`,
});

const homeworkHelperFlow = ai.defineFlow(
  {
    name: 'homeworkHelperFlow',
    inputSchema: HomeworkHelperInputSchema,
    outputSchema: HomeworkHelperOutputSchema,
  },
  async (input) => {
    // Tomamos el historial y lo preparamos para el prompt
    const history = input.chatHistory.map(msg => ({
      ...msg,
      // Handlebars no puede procesar objetos complejos, así que simplificamos
      content: typeof msg.content === 'string' ? msg.content : "Se adjuntó una imagen.",
    }));

    // El objeto que se pasa al prompt debe ser plano
    const promptInput: any = {
      userName: input.userName,
      subjectName: input.subjectName,
      lessonTopic: input.lessonTopic,
      chatHistory: history,
    };
    
    // Si hay una imagen, la añadimos por separado para el `{{media}}`
    if (input.photoDataUri) {
      promptInput.photoDataUri = input.photoDataUri;
    }

    const { output } = await homeworkHelperPrompt(promptInput);
    return { response: output!.response };
  }
);

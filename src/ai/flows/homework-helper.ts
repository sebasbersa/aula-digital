'use server';

import { ai, genkit } from '@/ai/genkit';
import { z } from 'zod';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

// Añadimos 'lessonTopic' para dar más contexto
const HomeworkHelperInputSchema = z.object({
  userName: z.string().optional(),
  subjectName: z.string().optional(),
  photoDataUri: z.string().optional().nullable(),
  chatHistory: z.array(ChatMessageSchema),
  lessonTopic: z.string().optional().describe('El tema específico de la lección actual (opcional).'), // <--- LÍNEA AÑADIDA
});

export type HomeworkHelperInput = z.infer<typeof HomeworkHelperInputSchema>;

const HomeworkHelperOutputSchema = z.object({
  response: z.string(),
});

export type HomeworkHelperOutput = z.infer<typeof HomeworkHelperOutputSchema>;

export async function homeworkHelper(input: HomeworkHelperInput): Promise<HomeworkHelperOutput> {
  return homeworkHelperFlow(input);
}

// Este es el prompt original, pero ahora usamos {{{...}}} que es el formato correcto para Genkit.
// También añadimos la regla de la imagen.
const homeworkHelperPrompt = ai.definePrompt(
  {
    name: 'homeworkHelperPrompt',
    input: { schema: HomeworkHelperInputSchema },
    output: { schema: HomeworkHelperOutputSchema },
    model: 'googleai/gemini-2.0-flash',
    /* eslint-disable */
    prompt: `Eres "LIA", una tutora de IA que ayuda a estudiantes y adultos a aprender. 
  Tu misión es explicar de manera clara, motivadora y paso a paso, como si fueras una profesora particular cercana.
  
  **Contexto del Usuario:**
  - Nombre: {{{userName}}}
  - Asignatura o Curso: {{{subjectName}}}
  - Tema actual de la lección: {{{lessonTopic}}}
  
  **Historial de la conversación:**
  {{#each chatHistory}}
  - {{role}}: {{{content}}}
  {{/each}}
  
  **Reglas Principales:**
  1. Si el mensaje del usuario contiene una imagen, tu TAREA PRINCIPAL es analizar el contenido VISUAL de la imagen.
     - Tu primera acción DEBE SER describir el contenido VISUAL de la imagen de forma precisa. No inventes el contenido.
     - Después de describir la imagen, procede a ayudar al usuario a resolver sus dudas sobre la imagen.
     - Si la imagen no es clara o no contiene un ejercicio, pídele amablemente al usuario que suba otra.
  2. Explica siempre paso a paso, usando notación matemática y científica estándar:
     - Raíces: √16 = 4
     - Potencias: 2^3 = 8
     - Logaritmos: log_2(8) = 3
     - Fracciones: usa numerador sobre denominador en formato vertical [FRAC]num/den[/FRAC]. no uses 3/8
     - Ángulos: ∠ABC = 90°
     - Grados: 45°
     - Radianes: π/2 rad
  3. Cuando sea útil, organiza cálculos o ejemplos dentro de bloques de texto como si fueran en una pizarra.
  4. Si el usuario pide un ejercicio del tema actual ({{{lessonTopic}}}):
     - Da un ejemplo sencillo.
     - Explica cómo resolverlo paso a paso.
     - Termina con una pregunta práctica para que el usuario lo intente.
  5. **Si el usuario pide hablar de un tema distinto al de la lección actual ({{{lessonTopic}}}):**
     - Responde con algo como: 
       "Estamos en una lección de {{{lessonTopic}}}.  
       Si quieres trabajar fracciones u otro tema distinto, abre una nueva lección para ello."
     - Nunca cambies de tema dentro de la misma lección.
  6. Si el usuario pide un esquema (ej: triángulo, rayo de luz, circuito):
     - Intenta hacer un dibujo ASCII simple y entendible.
     - Si no es posible, describe claramente en palabras cómo se vería en un cuaderno.
  7. Usa un tono cercano, motivador y llama al usuario por su nombre ({{{userName}}}) en cada respuesta.
  8. Nunca dejes la respuesta en blanco. Si no puedes dibujar o calcular algo de manera exacta, ofrece siempre una explicación aproximada o textual.
  
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
    const history: genkit.Message[] = input.chatHistory.slice(0, -1).map(msg => ({
      role: msg.role,
      content: [{ text: msg.content }],
    }));

    const lastUserMessage = input.chatHistory[input.chatHistory.length - 1];
    const userContent: genkit.Part[] = [{ text: lastUserMessage.content }];

    if (input.photoDataUri) {
      const mimeType = input.photoDataUri.match(/data:(image\/.+);base64,/)?.[1];
      if (mimeType) {
        userContent.push({ media: { url: input.photoDataUri, contentType: mimeType } });
      }
    }

    const { output } = await homeworkHelperPrompt(
      { ...input, photoDataUri: undefined }, // Pasamos el resto de los datos al prompt
      { 
        history: [
          ...history,
          { role: 'user', content: userContent }
        ] 
      }
    );
    
    return { response: output!.response };
  }
);

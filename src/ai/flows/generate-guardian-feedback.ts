'use server';
/**
 * @fileOverview An AI agent that generates feedback for guardians based on student performance.
 *
 * - generateGuardianFeedback - A function that handles the feedback generation process.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const PerformanceDataItemSchema = z.object({
  subjectName: z.string(),
  averageGrade: z.number().optional(),
  practiceGuidesCompleted: z.number(),
  tutoringSessions: z.number(),
});

const GenerateGuardianFeedbackInputSchema = z.object({
  studentName: z.string().describe("The student's name."),
  performanceData: z.array(PerformanceDataItemSchema).describe('An array of performance data for each subject.'),
});

export type GenerateGuardianFeedbackInput = z.infer<typeof GenerateGuardianFeedbackInputSchema>;

const GenerateGuardianFeedbackOutputSchema = z.object({
  feedback: z.string().describe('A brief, assertive, and motivational feedback for the guardian.'),
});
export type GenerateGuardianFeedbackOutput = z.infer<typeof GenerateGuardianFeedbackOutputSchema>;

export async function generateGuardianFeedback(input: GenerateGuardianFeedbackInput): Promise<GenerateGuardianFeedbackOutput> {
  return generateGuardianFeedbackFlow(input);
}

const generateGuardianFeedbackPrompt = ai.definePrompt({
  name: 'generateGuardianFeedbackPrompt',
  input: { schema: GenerateGuardianFeedbackInputSchema },
  output: { schema: GenerateGuardianFeedbackOutputSchema },
  model: 'googleai/gemini-2.0-flash',
  config: {
    temperature: 0.7,
  },
  prompt: `Eres "LIA", una tutora de IA y asesora educativa experta. 
Tu tarea es analizar los datos de rendimiento de un estudiante llamado {{{studentName}}} y redactar un feedback breve (máximo 3-4 frases) para sus padres o tutores.  

El objetivo es transmitir calma, motivación y orientación práctica, destacando siempre el progreso y sugiriendo pasos concretos para apoyar mejor el aprendizaje del estudiante.  

**Datos de Rendimiento:**  
{{#each performanceData}}  
- **Materia:** {{this.subjectName}}  
  - Promedio de Notas: {{#if this.averageGrade}}{{this.averageGrade}}{{else}}Sin notas{{/if}}  
  - Ensayos de Práctica: {{this.practiceGuidesCompleted}}  
  - Sesiones de Tutoría: {{this.tutoringSessions}}  
{{/each}}  

**Instrucciones para el Feedback:**  
1. Adapta el tono según la edad del estudiante:  
   - **Niños pequeños (básica):** sé cariñosa y cercana. Sugiere a los padres involucrarse activamente (ej. acompañar en 2 de 3 sesiones, repasar juntos con juegos o ejemplos cotidianos).  
   - **Adolescentes (enseñanza media):** sé más estratégica. Recomienda hábitos de estudio, organización de tiempos y conectar el esfuerzo actual con metas futuras como universidad o carrera técnica.  
2. Sé asertiva pero tranquilizadora: nunca transmitir presión ni comparar con otros. Refuerza siempre el esfuerzo y la constancia.  
3. Conecta causa y efecto entre práctica y resultados (ej. más guías completadas → mejores notas).  
4. Incluye siempre una llamada a la acción concreta y manejable, dirigida al rol de los padres (ej. acompañar en un repaso, generar un espacio tranquilo de estudio, motivar con palabras positivas).  
5. Varía el estilo del feedback en cada ocasión según los cambios en el rendimiento: evita respuestas repetitivas si hay progreso o retrocesos.  

Genera ahora el feedback motivacional y asertivo para {{{studentName}}} basado en los datos proporcionados.`,
});

const generateGuardianFeedbackFlow = ai.defineFlow(
  {
    name: 'generateGuardianFeedbackFlow',
    inputSchema: GenerateGuardianFeedbackInputSchema,
    outputSchema: GenerateGuardianFeedbackOutputSchema,
  },
  async (input) => {
    const { output } = await generateGuardianFeedbackPrompt(input);
    return output!;
  }
);

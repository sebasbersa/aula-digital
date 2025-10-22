'use server';

/**
 * @fileOverview Un agente de IA que genera y evalúa guías de práctica para estudiantes.
 *
 * - generatePracticeGuide - Genera una guía de práctica con preguntas de opción múltiple.
 * - evaluatePracticeGuide - Evalúa las respuestas de los estudiantes y entrega retroalimentación.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// ====================
// Esquemas de Generación de Guía
// ====================

const GenerateGuideInputSchema = z.object({
  subjectName: z.string().describe('Nombre de la asignatura para la guía.'),
  gradeLevel: z.string().describe('Nivel del estudiante (ej. "6to Básico").'),
  specificTopic: z.string().optional().describe('Tema o lección específica para enfocar las preguntas.'),
});
export type GenerateGuideInput = z.infer<typeof GenerateGuideInputSchema>;

const QuestionSchema = z.object({
  question: z.string().describe('Texto de la pregunta.'),
  options: z.array(z.string()).describe('Un arreglo con 4 alternativas posibles.'),
  correctAnswerIndex: z.number().min(0).max(3).describe('Índice (0-3) de la alternativa correcta.'),
});

const GenerateGuideOutputSchema = z.object({
  title: z.string().describe('Título apropiado para la guía de práctica.'),
  questions: z.array(QuestionSchema).length(15).describe('Un arreglo con exactamente 15 preguntas.'),
});
export type GenerateGuideOutput = z.infer<typeof GenerateGuideOutputSchema>;

// ====================
// Esquemas de Evaluación de Guía
// ====================
const EvaluationQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()),
  correctAnswerIndex: z.number(),
  studentAnswerIndex: z.number().nullable(),
});

const EvaluateGuideInputSchema = z.object({
  subjectName: z.string(),
  questions: z.array(EvaluationQuestionSchema),
});
export type EvaluateGuideInput = z.infer<typeof EvaluateGuideInputSchema>;

const CorrectedQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()),
  correctAnswerIndex: z.number(),
  studentAnswerIndex: z.number().nullable(),
  isCorrect: z.boolean(),
  explanation: z.string().optional().describe(
    'Si fue incorrecta, explica brevemente el concepto y por qué la respuesta correcta es la adecuada. Usa formato [FRAC]...[/FRAC] o [MFRAC]...[/MFRAC] para fracciones.'
  ),
});
export type CorrectedQuestion = z.infer<typeof CorrectedQuestionSchema>;

const EvaluateGuideOutputSchema = z.object({
  score: z.number().min(0).max(7).describe('Este campo está deprecado. Retornar siempre 0 (la app lo calcula en el cliente).'),
  feedback: z.string().describe('Feedback breve, motivador y constructivo para el estudiante.'),
  correctedQuestions: z.array(CorrectedQuestionSchema),
  correctAnswersCount: z.number().describe('Número total de respuestas correctas.'),
  totalQuestionsCount: z.number().describe('Número total de preguntas.'),
});
export type EvaluateGuideOutput = z.infer<typeof EvaluateGuideOutputSchema>;

// ====================
// Prompts y Flujos Genkit
// ====================
const generateGuidePrompt = ai.definePrompt({
  name: 'generatePracticeGuidePrompt',
  input: { schema: GenerateGuideInputSchema },
  output: { schema: GenerateGuideOutputSchema },
  model: 'googleai/gemini-2.0-flash',
  config: { temperature: 0.8 },
  prompt: `Eres un diseñador curricular experto en el sistema escolar chileno. 
Debes crear una guía de práctica con 15 preguntas de opción múltiple (4 alternativas cada una) para un estudiante.

**Asignatura:** {{{subjectName}}}  
**Nivel:** {{{gradeLevel}}}  
{{#if specificTopic}}  
**Tema específico:** {{{specificTopic}}}  
{{else}}  
Elige conceptos fundamentales para esa asignatura y nivel.  
{{/if}}

**Reglas:**  
- Nivel SIMCE (Chile).  
- Fracciones: [FRAC]num/den[/FRAC] o [MFRAC]...[/MFRAC].  
- Sin prefijos A), B)... en alternativas.  
- Una sola respuesta correcta por pregunta.  
- Todas las preguntas deben estar estrictamente relacionadas con el tema indicado.  

Todas las preguntas deben ser originales y distintas en cada ejecución.`,
});

const generateGuideFlow = ai.defineFlow(
  {
    name: 'generatePracticeGuideFlow',
    inputSchema: GenerateGuideInputSchema,
    outputSchema: GenerateGuideOutputSchema,
  },
  async (input) => {
    console.log('generateGuidePrompt', generateGuidePrompt) 
    const { output } = await generateGuidePrompt(input);
    return output!;
  }
);

const evaluateGuidePrompt = ai.definePrompt({
  name: 'evaluatePracticeGuidePrompt',
  input: { schema: EvaluateGuideInputSchema },
  output: { schema: EvaluateGuideOutputSchema },
  model: 'googleai/gemini-2.0-flash',
  prompt: `Eres LIA, una tutora de IA motivadora y clara. 
Debes evaluar las respuestas de un estudiante para una guía de práctica de **{{subjectName}}**.

Aquí están las preguntas originales con las respuestas del estudiante:

{{#each questions}}
Pregunta {{@index}}: {{{question}}}
Opciones:
{{#each options}}
- [{{@index}}] {{{this}}}
{{/each}}
Respuesta correcta: índice {{correctAnswerIndex}}
Respuesta del estudiante: {{#if studentAnswerIndex}}{{studentAnswerIndex}}{{else}}(sin responder){{/if}}

{{/each}}

⚠️ REGLAS OBLIGATORIAS:
1. NO inventes preguntas nuevas. NO cambies el texto de las preguntas ni de las opciones.
2. Debes devolver EXACTAMENTE las mismas preguntas y opciones que recibiste en el input, en el mismo orden.
3. Para cada pregunta, agrega:
   - "studentAnswerIndex": el valor recibido en el input.
   - "isCorrect": true o false.
   - "explanation": breve texto SOLO si la respuesta fue incorrecta.
4. En Matemáticas, usa siempre:
   - [FRAC]num/den[/FRAC] → numerador sobre denominador (ej. [FRAC]2/3[/FRAC] = ⅔).
   - [MFRAC]...[/MFRAC] → para fracciones mixtas.
5. El arreglo "correctedQuestions" debe tener el MISMO tamaño y orden que el arreglo "questions".
6. Devuelve también:
   - "correctAnswersCount": cantidad de respuestas correctas.
   - "totalQuestionsCount": cantidad total de preguntas.
   - "feedback": un mensaje breve, motivador y constructivo.
   - "score": siempre 0 (la nota se calcula en el cliente).
7. IMPORTANTE: Responde SOLO con un objeto JSON válido que cumpla el esquema, sin texto extra.
`
});

const evaluateGuideFlow = ai.defineFlow(
  {
    name: 'evaluatePracticeGuideFlow',
    inputSchema: EvaluateGuideInputSchema,
    outputSchema: EvaluateGuideOutputSchema,
  },
  async (input: any) => {
    const { output } = await evaluateGuidePrompt(input);
    return output!;
  }
);

// ====================
// Funciones Exportadas
// ====================
export async function generatePracticeGuide(input: GenerateGuideInput): Promise<GenerateGuideOutput> {
  return generateGuideFlow(input);
}

export async function evaluatePracticeGuide(input: EvaluateGuideInput): Promise<EvaluateGuideOutput> {
  return evaluateGuideFlow(input);
}

// 👇 Export default para usar en /api/flows/generate-practice-guide
export default generateGuideFlow;

'use server';
/**
 * @fileOverview Un agente de IA que responde preguntas rápidas sobre contabilidad y finanzas.
 *
 * - askAccountingQuestion - Una función que responde preguntas y recomienda lecciones.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { accountingCurriculum } from '@/lib/data';

const curriculumString = JSON.stringify(accountingCurriculum, null, 2);

const AskAccountingQuestionInputSchema = z.object({
  question: z.string().describe('La pregunta del usuario sobre contabilidad o finanzas para una PYME en Chile.'),
});

export type AskAccountingQuestionInput = z.infer<typeof AskAccountingQuestionInputSchema>;

const RecommendationSchema = z.object({
  level: z.string().describe('El título del Nivel recomendado del plan de estudios.'),
  unit: z.string().describe('El título de la Unidad recomendada dentro de ese Nivel.'),
  lesson: z.string().describe('El título de la Lección específica recomendada dentro de esa Unidad.'),
});

const AskAccountingQuestionOutputSchema = z.object({
  answer: z.string().describe('La respuesta directa y precisa a la pregunta del usuario.'),
  recommendation: RecommendationSchema.optional().describe('La lección más relevante del plan de estudios para profundizar en el tema.'),
});

export type AskAccountingQuestionOutput = z.infer<typeof AskAccountingQuestionOutputSchema>;

export async function askAccountingQuestion(input: AskAccountingQuestionInput): Promise<AskAccountingQuestionOutput> {
  return askAccountingQuestionFlow(input);
}

const askAccountingQuestionPrompt = ai.definePrompt({
  name: 'askAccountingQuestionPrompt',
  input: { schema: AskAccountingQuestionInputSchema },
  output: { schema: AskAccountingQuestionOutputSchema },
  model: 'googleai/gemini-2.0-flash',
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
    ],
  },
  prompt: `Eres "LIA-Contadora", una IA experta en contabilidad para PYMEs en Chile. Tu única tarea es responder de forma precisa y directa a la pregunta del usuario y luego recomendar una lección relevante.

**Contexto del Usuario:**
- **Pregunta:** {{{question}}}

**Instrucciones OBLIGATORIAS:**

1.  **Prioridad #1: Responder la Pregunta.** Tu respuesta DEBE abordar directamente la pregunta del usuario. NO des información general sobre contabilidad si no está directamente relacionada con la pregunta.
2.  **Ser Concisa.** Da una respuesta clara y al punto.
3.  **Recomendar una Lección.** Después de responder, busca la lección MÁS relevante en el plan de estudios de abajo.

---
**Ejemplo CLAVE de cómo debes actuar:**

*   **Pregunta del Usuario:** "como emito una factura"
*   **Tu Respuesta CORRECTA (JSON esperado):**
    {
      "answer": "Para emitir una factura electrónica en Chile con tu PYME, debes estar registrado en el Servicio de Impuestos Internos (SII) y tener iniciación de actividades. Puedes usar el sistema de facturación gratuito del SII o un software de mercado. El proceso implica ingresar los datos de tu cliente, el detalle de los productos o servicios, y los impuestos correspondientes, principalmente el IVA (19%).",
      "recommendation": {
        "level": "Nivel 4 – Contabilidad Avanzada y Gestión",
        "unit": "Unidad 4: Tributación básica en Chile",
        "lesson": "Impuesto al Valor Agregado (IVA): Débito y Crédito Fiscal"
      }
    }
*   **Análisis del Acierto:** La respuesta es directa, se enfoca en "cómo emitir una factura" en el contexto de una PYME chilena y la recomendación es pertinente.

---
**Plan de Estudios (para tu referencia):**
\`\`\`json
${curriculumString}
\`\`\`

Ahora, procesa la pregunta del usuario siguiendo estas instrucciones estrictas.`,
});

const askAccountingQuestionFlow = ai.defineFlow(
  {
    name: 'askAccountingQuestionFlow',
    inputSchema: AskAccountingQuestionInputSchema,
    outputSchema: AskAccountingQuestionOutputSchema,
  },
  async (input) => {
    const { output } = await askAccountingQuestionPrompt(input);
    return output!;
  }
);

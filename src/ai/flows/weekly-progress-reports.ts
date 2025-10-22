'use server';
/**
 * @fileOverview Este archivo define el flujo de generación de informes de progreso semanales.
 *
 * - generateWeeklyReport - Genera un informe de progreso semanal para un usuario.
 * - GenerateWeeklyReportInput - El tipo de entrada para la función generateWeeklyReport.
 * - GenerateWeeklyReportOutput - El tipo de retorno para la función generateWeeklyReport.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateWeeklyReportInputSchema = z.object({
  userId: z.string().describe('El ID del usuario para quien se genera el informe.'),
  startDate: z.string().describe('La fecha de inicio de la semana para el informe (YYYY-MM-DD).'),
  endDate: z.string().describe('La fecha de fin de la semana para el informe (YYYY-MM-DD).'),
});
export type GenerateWeeklyReportInput = z.infer<typeof GenerateWeeklyReportInputSchema>;

const GenerateWeeklyReportOutputSchema = z.object({
  summary: z.string().describe('Un resumen de los hábitos de estudio del usuario para la semana.'),
  recommendations: z.array(z.string()).describe('Consejos generados por IA sobre cómo entender mejor los conceptos.'),
});
export type GenerateWeeklyReportOutput = z.infer<typeof GenerateWeeklyReportOutputSchema>;

export async function generateWeeklyReport(input: GenerateWeeklyReportInput): Promise<GenerateWeeklyReportOutput> {
  return generateWeeklyReportFlow(input);
}

const generateWeeklyReportPrompt = ai.definePrompt({
  name: 'generateWeeklyReportPrompt',
  input: { schema: GenerateWeeklyReportInputSchema },
  output: { schema: GenerateWeeklyReportOutputSchema },
  model: 'googleai/gemini-2.0-flash',
  prompt: `Eres un tutor de IA responsable de generar informes de progreso semanales para los estudiantes.

  Recibirás el ID del usuario, la fecha de inicio y la fecha de fin de la semana para el informe.
  Usando esta información, generarás un resumen de los hábitos de estudio del usuario para la semana y proporcionarás consejos generados por IA sobre cómo entender mejor los conceptos.

  ID de Usuario: {{{userId}}}
  Fecha de Inicio: {{{startDate}}}
  Fecha de Fin: {{{endDate}}}

  Por favor, proporciona un resumen conciso y recomendaciones prácticas.
  `,
});

const generateWeeklyReportFlow = ai.defineFlow(
  {
    name: 'generateWeeklyReportFlow',
    inputSchema: GenerateWeeklyReportInputSchema,
    outputSchema: GenerateWeeklyReportOutputSchema,
  },
  async (input) => {
    const { output } = await generateWeeklyReportPrompt(input);
    return output!;
  }
);

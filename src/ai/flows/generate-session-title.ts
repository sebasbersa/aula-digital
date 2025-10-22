'use server';
/**
 * @fileOverview An AI agent that generates a concise title for a tutoring session.
 *
 * - generateSessionTitle - A function that generates a title from chat history.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const GenerateSessionTitleInputSchema = z.object({
  chatHistory: z.array(ChatMessageSchema).describe('The history of the conversation to be titled.'),
});
export type GenerateSessionTitleInput = z.infer<typeof GenerateSessionTitleInputSchema>;

const GenerateSessionTitleOutputSchema = z.object({
  title: z.string().describe('A short, descriptive title for the tutoring session (max 5 words).'),
});
export type GenerateSessionTitleOutput = z.infer<typeof GenerateSessionTitleOutputSchema>;

export async function generateSessionTitle(input: GenerateSessionTitleInput): Promise<GenerateSessionTitleOutput> {
  return generateSessionTitleFlow(input);
}

const generateSessionTitlePrompt = ai.definePrompt({
  name: 'generateSessionTitlePrompt',
  input: { schema: GenerateSessionTitleInputSchema },
  output: { schema: GenerateSessionTitleOutputSchema },
  model: 'googleai/gemini-2.0-flash',
  prompt: `You are an expert in summarizing educational content. Your task is to analyze a conversation between an AI tutor (LIA) and a student and create a concise, descriptive title for the tutoring session.

The title should be very short (no more than 5 words) and accurately reflect the main topic or concept discussed. The title MUST be in Spanish.

**Conversation History:**
{{#each chatHistory}}
- **{{role}}:** {{{content}}}
{{/each}}

**Instructions:**
1. Read the entire conversation to understand the core subject matter.
2. Identify the key educational concept (e.g., "Suma de fracciones", "Uso de la 'b' y 'v'", "Fotosíntesis").
3. Generate a title that is clear and easy for a student to understand when looking back at their saved lessons.

**Example 1:**
- Conversation discusses adding 1/2 + 3/4.
- **Good Title:** "Suma de Fracciones"

**Example 2:**
- Conversation discusses the differences between plant and animal cells.
- **Good Title:** "Célula Animal y Vegetal"

Now, generate the title for the provided conversation history.`,
});

const generateSessionTitleFlow = ai.defineFlow(
  {
    name: 'generateSessionTitleFlow',
    inputSchema: GenerateSessionTitleInputSchema,
    outputSchema: GenerateSessionTitleOutputSchema,
  },
  async (input) => {
    const { output } = await generateSessionTitlePrompt(input);
    return output!;
  }
);

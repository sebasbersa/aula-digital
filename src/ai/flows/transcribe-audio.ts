'use server';
/**
 * @fileOverview Un agente de IA que transcribe audio a texto.
 *
 * - transcribeAudio - Una función que maneja el proceso de transcripción de audio.
 * - TranscribeAudioInput - El tipo de entrada para la función transcribeAudio.
 * - TranscribeAudioOutput - El tipo de retorno para la función transcribeAudio.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const TranscribeAudioInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "La grabación de voz del usuario como un URI de datos que debe incluir un tipo MIME y usar codificación Base64. Formato esperado: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type TranscribeAudioInput = z.infer<typeof TranscribeAudioInputSchema>;

const TranscribeAudioOutputSchema = z.object({
  text: z.string().describe('El texto transcrito del audio.'),
});
export type TranscribeAudioOutput = z.infer<typeof TranscribeAudioOutputSchema>;

export async function transcribeAudio(
  input: TranscribeAudioInput
): Promise<TranscribeAudioOutput> {
  return transcribeAudioFlow(input);
}

const transcribeAudioFlow = ai.defineFlow(
  {
    name: 'transcribeAudioFlow',
    inputSchema: TranscribeAudioInputSchema,
    outputSchema: TranscribeAudioOutputSchema,
  },
  async (input) => {
    // Validación de la URI de audio
    if (!input.audioDataUri || !input.audioDataUri.includes(',')) {
      console.warn("transcribeAudioFlow recibió un audioDataUri vacío o inválido.");
      return { text: '' };
    }

    const { text } = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      prompt: [
        { text: 'Transcribe el siguiente audio a texto. Si el audio está en silencio o no se puede transcribir, responde con una cadena de texto vacía.' },
        { media: { url: input.audioDataUri } },
      ],
    });

    // Asegurar que siempre retornamos una propiedad "text"
    return { text: text ?? '' };
  }
);

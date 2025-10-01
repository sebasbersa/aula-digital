import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { config } from 'dotenv';

// Carga las variables de entorno desde el archivo .env
config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn(
    '⚠️ La API Key de Gemini no ha sido configurada. Las funciones de IA estarán deshabilitadas.'
  );
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey,
    }),
  ],
  defaultModel: 'googleai/gemini-2.0-flash',
});

// 🔑 Reexportamos helpers para usarlos en los flows
export const { defineFlow, definePrompt } = ai;

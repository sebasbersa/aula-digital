import { config } from 'dotenv';
config();

// Se importan los flujos para que Genkit los reconozca en desarrollo
import '@/ai/flows/generate-practice-guide.ts';
import '@/ai/flows/weekly-progress-reports.ts';
import '@/ai/flows/homework-helper.ts';
import '@/ai/flows/transcribe-audio.ts';
import '@/ai/flows/generate-guardian-feedback.ts';
import '@/ai/flows/generate-session-title.ts';
import '@/ai/flows/generate-recipe.ts';
import '@/ai/flows/ask-recipe-question.ts';
import '@/ai/flows/ask-accounting-question.ts';
import '@/ai/flows/generate-cocktail-ideas.ts';

// Nota: ya no usamos defineDevEndpoint aquí.
// Con solo importar los flows, Genkit los registra para desarrollo.

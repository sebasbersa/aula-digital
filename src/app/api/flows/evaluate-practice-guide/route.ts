import { NextRequest, NextResponse } from 'next/server';
// Importamos la función específica de evaluación y su tipo de entrada
import { evaluatePracticeGuide, EvaluateGuideInput } from '@/ai/flows/generate-practice-guide';

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // Usamos el tipo para asegurar que el cuerpo de la petición es correcto
    const body: EvaluateGuideInput = await req.json();

    // Llamamos a la función de EVALUACIÓN, no a la de generación
    const output = await evaluatePracticeGuide(body);

    return NextResponse.json(output);
  } catch (err: any) {
    // Un log de error específico para este endpoint
    console.error("❌ Error en evaluatePracticeGuide API:", err);
    return NextResponse.json(
      { error: err.message ?? "Error interno del servidor" },
      { status: 500 }
    );
  }
}
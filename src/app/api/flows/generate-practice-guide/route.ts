import { NextRequest, NextResponse } from 'next/server';
import generatePracticeGuideFlow from '@/ai/flows/generate-practice-guide';

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const output = await generatePracticeGuideFlow(body);
    return NextResponse.json(output);
  } catch (err: any) {
    console.error("❌ Error en generatePracticeGuide API:", err);
    return NextResponse.json(
      { error: err.message ?? "Error interno del servidor" },
      { status: 500 }
    );
  }
}

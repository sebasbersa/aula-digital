// app/api/email/route.ts
import { sendEmail } from '@/services/mailServices';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { to, subject, message } = await req.json();

  try {
    sendEmail(to, subject, message);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
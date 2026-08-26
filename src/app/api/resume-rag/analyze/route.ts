import { NextResponse } from "next/server";
import { analyzeResumeWithRag } from "@/lib/resume-rag";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "کاربر VibeLab";
    const resumeText = typeof body.resumeText === "string" ? body.resumeText.trim() : "";
    const goal = typeof body.goal === "string" ? body.goal.trim() : "یادگیری و ساخت نمونه‌کار";
    const cityPreference = typeof body.cityPreference === "string" ? body.cityPreference.trim() : "تهران";
    if (resumeText.length < 60) return NextResponse.json({ error: "برای تحلیل RAG، رزومه یا معرفی کوتاه را کامل‌تر وارد کنید." }, { status: 400 });
    const analysis = await analyzeResumeWithRag({ fullName, resumeText, goal, cityPreference });
    return NextResponse.json({ ok: true, analysis });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "تحلیل RAG انجام نشد." }, { status: 500 });
  }
}

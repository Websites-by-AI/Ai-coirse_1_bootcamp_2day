import { NextResponse } from "next/server";
import { createLearningPlan } from "@/lib/learning-planner";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const plan = await createLearningPlan({
      fullName: typeof body.fullName === "string" ? body.fullName : "",
      email: typeof body.email === "string" ? body.email : "",
      phone: typeof body.phone === "string" ? body.phone : "",
      resumeText: typeof body.resumeText === "string" ? body.resumeText : "",
      goal: typeof body.goal === "string" ? body.goal : "ساخت سایت و تولید محتوا با AI",
      cityPreference: typeof body.cityPreference === "string" ? body.cityPreference : "تهران",
    });
    return NextResponse.json({ ok: true, plan });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "برنامه آموزشی ساخته نشد." }, { status: 400 });
  }
}

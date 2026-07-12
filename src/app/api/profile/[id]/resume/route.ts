import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { studentProfiles, studentResumes } from "@/db/schema";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  const { id } = await context.params;
  const userId = Number(id);
  if (!Number.isInteger(userId)) return new NextResponse("Not found", { status: 404 });
  const [profile] = await db.select().from(studentProfiles).where(and(eq(studentProfiles.userId, userId), eq(studentProfiles.isPublic, true))).limit(1);
  const [resume] = await db.select().from(studentResumes).where(eq(studentResumes.userId, userId)).limit(1);
  if (!profile || !resume) return new NextResponse("Resume not available", { status: 404 });
  const fileName = resume.fileName?.replace(/[^\w.()-]/g, "_") || "vibelab-resume.txt";
  const content = resume.fileData ? Buffer.from(resume.fileData, "base64") : Buffer.from(resume.contentText, "utf8");
  return new NextResponse(content, { headers: { "Content-Type": resume.mimeType || "text/plain; charset=utf-8", "Content-Disposition": `attachment; filename="${fileName}"`, "Cache-Control": "private, no-store" } });
}

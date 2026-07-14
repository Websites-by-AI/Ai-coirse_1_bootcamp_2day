import { NextResponse } from "next/server";
import { db } from "@/db";
import { educationCourses } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get("provider");
  const category = searchParams.get("category");
  const isFree = searchParams.get("isFree");

  try {
    let query = db.select().from(educationCourses).orderBy(desc(educationCourses.createdAt));

    // Drizzle ORM does not support dynamic where chaining easily in all versions,
    // so we fetch and filter in memory for simplicity in this example.
    const rows = await query;

    const filtered = rows.filter((row) => {
      if (provider && row.provider !== provider) return false;
      if (category && row.category !== category) return false;
      if (isFree !== null && row.isFree !== Number(isFree)) return false;
      return true;
    });

    return NextResponse.json({ courses: filtered, total: filtered.length });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "خطای دیتابیس" },
      { status: 500 }
    );
  }
}

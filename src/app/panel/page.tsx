import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ensureDemoStudent, getStudentFromSession, STUDENT_COOKIE_NAME } from "@/lib/student";
import { listStudentProjects } from "@/lib/projects";
import { getStudentProfileData } from "@/lib/profile";
import { isDatabaseConfigured } from "@/db";
import ProjectPanel from "./project-panel";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function UserPanelPage() {
  if (!isDatabaseConfigured) {
    return (
      <main dir="rtl" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#0b1020", color: "#eef2ff" }}>
        <section style={{ maxWidth: 560, width: "100%", borderRadius: 24, padding: 28, background: "#141b33", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p style={{ margin: 0, color: "#93c5fd", letterSpacing: "0.08em", fontSize: 12 }}>DEMO MODE</p>
          <h1 style={{ margin: "8px 0 12px", fontSize: 28 }}>پنل کاربر بدون دیتابیس در دسترس نیست</h1>
          <p style={{ lineHeight: 1.8, color: "#c7d2fe" }}>
            سایت باز است، ولی برای پنل پروژه‌ها و رزومه باید <b>DATABASE_URL</b> (مثلاً Supabase) روی Vercel ست شود.
            روی Cloudflare Pages نیازی به Secret دیتابیس نیست اگر فقط لندینگ می‌خواهید.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
            <Link href="/" style={{ color: "#fff", background: "#6366f1", padding: "10px 14px", borderRadius: 12, textDecoration: "none" }}>بازگشت به خانه</Link>
            <Link href="/register" style={{ color: "#e0e7ff", padding: "10px 14px", borderRadius: 12, textDecoration: "none", border: "1px solid rgba(255,255,255,0.12)" }}>صفحه ثبت‌نام</Link>
          </div>
        </section>
      </main>
    );
  }

  try {
    await ensureDemoStudent();
    const cookieStore = await cookies();
    const student = await getStudentFromSession(cookieStore.get(STUDENT_COOKIE_NAME)?.value);
    if (!student) redirect("/register");
    const [projects, profileData] = await Promise.all([
      listStudentProjects(student.id),
      getStudentProfileData(student.id, student.fullName),
    ]);
    return <ProjectPanel student={student} initialProjects={projects} initialProfileData={profileData} />;
  } catch {
    redirect("/register?authError=database_unavailable");
  }
}

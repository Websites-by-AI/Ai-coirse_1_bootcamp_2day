import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ensureDemoStudent, getStudentFromSession, STUDENT_COOKIE_NAME } from "@/lib/student";
import { listStudentProjects } from "@/lib/projects";
import { getStudentProfileData } from "@/lib/profile";
import ProjectPanel from "./project-panel";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "پنل کاربر VibeLab | پروژه‌ها، رزومه و تحلیل AI",
  description:
    "پنل شخصی VibeLab برای مدیریت پروژه‌ها، آپلود و تحلیل رزومه با AI، ویرایش پروفایل و دریافت بازخورد تخصصی.",
  keywords: ["پنل VibeLab", "تحلیل رزومه AI", "پروفایل حرفه‌ای", "پروژه‌های AI"],
  alternates: {
    canonical: "/panel",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function UserPanelPage() {
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

import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isGoogleOAuthConfigured } from "@/lib/admin";
import {
  ensureDemoStudent,
  getLatestStudentAssessment,
  getStudentFromSession,
  STUDENT_COOKIE_NAME,
} from "@/lib/student";
import { isDatabaseConfigured } from "@/db";
import RegistrationExperience from "../register/registration-experience";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ورود به VibeLab | پنل کاربر",
  description:
    "وارد پنل کاربری VibeLab شوید. مدیریت پروژه‌ها، رزومه، تحلیل AI و پروفایل حرفه‌ای.",
  keywords: ["ورود VibeLab", "پنل کاربر", "لاگین", "VibeLab Login"],
  alternates: {
    canonical: "/login",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LoginPage() {
  let student = null;
  let assessment = null;

  if (isDatabaseConfigured) {
    try {
      await ensureDemoStudent();
      const cookieStore = await cookies();
      student = await getStudentFromSession(cookieStore.get(STUDENT_COOKIE_NAME)?.value);
      if (student) {
        assessment = await getLatestStudentAssessment(student.id);
        if (assessment) redirect("/panel");
      }
    } catch {
      student = null;
      assessment = null;
    }
  }

  return (
    <RegistrationExperience
      initialStudent={student}
      initialAssessment={assessment}
      turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
      googleEnabled={isGoogleOAuthConfigured()}
      initialMode="login"
    />
  );
}

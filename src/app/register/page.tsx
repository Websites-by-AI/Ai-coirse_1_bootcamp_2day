import type { Metadata } from "next";
import { cookies } from "next/headers";
import { isGoogleOAuthConfigured } from "@/lib/admin";
import {
  ensureDemoStudent,
  getLatestStudentAssessment,
  getStudentFromSession,
  STUDENT_COOKIE_NAME,
} from "@/lib/student";
import { isDatabaseConfigured } from "@/db";
import RegistrationExperience from "./registration-experience";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ثبت‌نام VibeLab | سنجش مسیر و رزرو جایگاه",
  description:
    "در ماراتن دو روزه VibeLab ثبت‌نام کنید. سنجش مسیر سفارشی با AI، ارزیابی ایده و رزرو جایگاه برای ساخت محتوا و وب‌اپ با هوش مصنوعی.",
  keywords: ["ثبت‌نام VibeLab", "ماراتن AI", "سنجش مسیر", "رزرو دوره AI", "Noora Academy"],
  alternates: {
    canonical: "/register",
  },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: "https://vibelab.ir/register",
    title: "ثبت‌نام VibeLab | سنجش مسیر و رزرو جایگاه",
    description:
      "در ماراتن دو روزه VibeLab ثبت‌نام کنید. سنجش مسیر سفارشی با AI و رزرو جایگاه.",
    images: [
      {
        url: "/og-register.jpg",
        width: 1200,
        height: 630,
        alt: "ثبت‌نام در VibeLab",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RegisterPage() {
  let student = null;
  let assessment = null;

  if (isDatabaseConfigured) {
    try {
      await ensureDemoStudent();
      const cookieStore = await cookies();
      student = await getStudentFromSession(cookieStore.get(STUDENT_COOKIE_NAME)?.value);
      assessment = student ? await getLatestStudentAssessment(student.id) : null;
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
    />
  );
}

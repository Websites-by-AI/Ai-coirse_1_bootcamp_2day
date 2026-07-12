import { cookies } from "next/headers";
import { isGoogleOAuthConfigured } from "@/lib/admin";
import { ensureDemoStudent, getLatestStudentAssessment, getStudentFromSession, STUDENT_COOKIE_NAME } from "@/lib/student";
import RegistrationExperience from "./registration-experience";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  await ensureDemoStudent();
  const cookieStore = await cookies();
  const student = await getStudentFromSession(cookieStore.get(STUDENT_COOKIE_NAME)?.value);
  const assessment = student ? await getLatestStudentAssessment(student.id) : null;
  return <RegistrationExperience initialStudent={student} initialAssessment={assessment} turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} googleEnabled={isGoogleOAuthConfigured()} />;
}

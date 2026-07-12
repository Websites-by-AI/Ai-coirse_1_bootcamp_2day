import { cookies } from "next/headers";
import { getAiDashboardData } from "@/lib/ai";
import { getSecurityReport } from "@/lib/security";
import { APP_RELEASES, githubRepositoryUrl } from "@/lib/releases";
import { ADMIN_COOKIE_NAME, getAdminFromSession, getDashboardData, isGoogleAuthConfigured } from "@/lib/admin";
import AdminDashboard from "./admin-dashboard";
import AdminLogin from "./admin-login";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const admin = await getAdminFromSession(cookieStore.get(ADMIN_COOKIE_NAME)?.value);

  if (!admin) return <AdminLogin googleEnabled={isGoogleAuthConfigured()} />;

  const [dashboard, aiDashboard, securityReport] = await Promise.all([getDashboardData(), getAiDashboardData(), getSecurityReport()]);
  return <AdminDashboard admin={admin} initialData={dashboard} initialAiData={aiDashboard} initialSecurityReport={securityReport} releases={APP_RELEASES} githubUrl={githubRepositoryUrl()} />;
}

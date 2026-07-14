import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "./admin/admin.css";
import "./register/register.css";
import "./panel/project-panel.css";
import "./profile/profile.css";
import ConfigWarningModal from "@/components/config-warning-modal";

export const metadata: Metadata = {
  title: "VibeLab | ماراتن ساخت با هوش مصنوعی",
  description:
    "ماراتن دو روزه‌ی ساخت محتوا، ویدیو و وب‌اپ با Google AI Studio، Claude، Emergent، Higgsfield و Kling؛ بدون نیاز به کدنویسی.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body>
        {children}
        <ConfigWarningModal />
      </body>
    </html>
  );
}

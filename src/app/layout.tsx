import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "./admin/admin.css";
import "./register/register.css";
import "./panel/project-panel.css";
import "./profile/profile.css";
import ConfigWarningModal from "@/components/config-warning-modal";
import StructuredData from "@/components/structured-data";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f8fc" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1022" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://vibelab.ir"),
  title: {
    default: "VibeLab | ماراتن ساخت با هوش مصنوعی",
    template: "%s | VibeLab",
  },
  description:
    "ماراتن دو روزه‌ی ساخت محتوا، ویدیو و وب‌اپ با Google AI Studio، Claude، Emergent، Higgsfield و Kling؛ بدون نیاز به کدنویسی.",
  applicationName: "VibeLab",
  authors: [{ name: "Noora Academy", url: "https://noora.academy" }],
  generator: "Next.js",
  keywords: [
    "VibeLab",
    "Noora Academy",
    "هوش مصنوعی",
    "AI",
    "Vibe Coding",
    "بدون کد",
    "ساخت محتوا",
    "وب‌اپ",
    "Claude",
    "Gemini",
  ],
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: "VibeLab by Noora Academy",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@vibelab_ir",
  },
  category: "education",
  classification: "Business/Education",
  other: {
    "google-site-verification": "your-google-verification-code",
    "msvalidate.01": "your-bing-verification-code",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body>
        {children}
        <ConfigWarningModal />
        <StructuredData />
      </body>
    </html>
  );
}

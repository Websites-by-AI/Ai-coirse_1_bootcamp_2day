import type { Metadata } from "next";
import HomeClient from "./home-client";

export const metadata: Metadata = {
  title: "VibeLab | ماراتن ۲ روزه ساخت محتوا و وب‌اپ با AI",
  description:
    "ماراتن عملی دو روزه برای ساخت محتوا، ویدیو و وب‌اپ با Google AI Studio، Claude، Emergent، Higgsfield و Kling؛ بدون نیاز به کدنویسی. ثبت‌نام کن و اولین محصولت را بساز.",
  keywords: [
    "VibeLab",
    "هوش مصنوعی",
    "AI",
    "Vibe Coding",
    "ساخت محتوا با AI",
    "وب‌اپ بدون کد",
    "ماراتن AI",
    "آموزش هوش مصنوعی",
    "Claude",
    "Gemini",
    "Midjourney",
    "برنامه‌نویسی بدون کد",
    "Noora Academy",
  ],
  authors: [{ name: "Noora Academy" }],
  creator: "Noora Academy",
  publisher: "Noora Academy",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: "https://vibelab.ir",
    siteName: "VibeLab by Noora Academy",
    title: "VibeLab | ماراتن ۲ روزه ساخت محتوا و وب‌اپ با AI",
    description:
      "ماراتن عملی دو روزه برای ساخت محتوا، ویدیو و وب‌اپ با ابزارهای هوش مصنوعی؛ بدون نیاز به کدنویسی.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "VibeLab - ماراتن ساخت با هوش مصنوعی",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VibeLab | ماراتن ۲ روزه ساخت محتوا و وب‌اپ با AI",
    description:
      "ماراتن عملی دو روزه برای ساخت محتوا، ویدیو و وب‌اپ با ابزارهای هوش مصنوعی؛ بدون نیاز به کدنویسی.",
    images: ["/og-image.jpg"],
    creator: "@vibelab_ir",
  },
  verification: {
    google: "google-site-verification-code",
  },
  category: "education",
};

export default function HomePage() {
  return <HomeClient />;
}

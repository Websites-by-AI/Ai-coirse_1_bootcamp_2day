import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicProfile } from "@/lib/profile";
import { isDatabaseConfigured } from "@/db";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const profile = isDatabaseConfigured ? await getPublicProfile(Number(id)) : null;
  if (!profile) {
    return {
      title: "پروفایل کاربر | VibeLab",
      description: "پروفایل عمومی سازنده در VibeLab.",
    };
  }
  return {
    title: `${profile.fullName} | ${profile.headline} — VibeLab`,
    description: profile.bio.slice(0, 160),
    keywords: [profile.headline, profile.skills, "VibeLab", "پروفایل سازنده"],
    alternates: {
      canonical: `/profile/${id}`,
    },
    openGraph: {
      type: "profile",
      locale: "fa_IR",
      url: `https://vibelab.ir/profile/${id}`,
      title: `${profile.fullName} | ${profile.headline}`,
      description: profile.bio.slice(0, 160),
      images: [
        {
          url: "/og-profile.jpg",
          width: 1200,
          height: 630,
          alt: `پروفایل ${profile.fullName} در VibeLab`,
        },
      ],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function PublicProfilePage({ params }: Props) {
  if (!isDatabaseConfigured) {
    return (
      <main dir="rtl" className="public-profile" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
        <section style={{ maxWidth: 520 }}>
          <h1>پروفایل عمومی در حالت نمایشی</h1>
          <p>برای نمایش پروفایل واقعی، DATABASE_URL باید روی هاست Node (Vercel) تنظیم شود.</p>
          <a href="/">بازگشت</a>
        </section>
      </main>
    );
  }

  try {
    const { id } = await params;
    const profile = await getPublicProfile(Number(id));
    if (!profile) notFound();
    return (
      <main dir="rtl" className="public-profile">
        <header>
          <a href="/" className="public-brand">
            <span>V</span>
            <b>VibeLab</b>
          </a>
          <a href="/register">ساخت پروفایل من</a>
        </header>
        <section className="public-profile-hero">
          <span className="public-avatar">{profile.fullName.slice(0, 1)}</span>
          <p>VIBELAB CREATOR PROFILE</p>
          <h1>{profile.fullName}</h1>
          <h2>{profile.headline}</h2>
          <p className="public-bio">{profile.bio}</p>
          <div className="public-actions">
            <a href={`/api/profile/${profile.id}/resume`}>دریافت رزومه</a>
            {profile.portfolioUrl && (
              <a href={profile.portfolioUrl} target="_blank" rel="noreferrer">
                نمونه‌کار آنلاین
              </a>
            )}
          </div>
        </section>
        <section className="public-projects">
          <div>
            <p>SKILLS</p>
            <h2>مهارت‌ها و پروژه‌ها</h2>
            <span>{profile.skills}</span>
          </div>
          <div className="public-project-grid">
            {profile.projects.map((project) => (
              <article key={project.name}>
                {project.screenshotUrl && <img src={project.screenshotUrl} alt={`نمای پروژه ${project.name}`} />}
                <div>
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                  {project.estimatedMin && (
                    <b>
                      {project.estimatedMin.toLocaleString("fa-IR")} تا {project.estimatedMax?.toLocaleString("fa-IR")} تومان
                    </b>
                  )}
                  <a href={project.deploymentUrl} target="_blank" rel="noreferrer">
                    مشاهده پروژه ↗
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    );
  } catch {
    notFound();
  }
}

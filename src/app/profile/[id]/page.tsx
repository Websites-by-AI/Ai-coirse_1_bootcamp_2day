import { notFound } from "next/navigation";
import { getPublicProfile } from "@/lib/profile";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function PublicProfilePage({ params }: Props) {
  const { id } = await params;
  const profile = await getPublicProfile(Number(id));
  if (!profile) notFound();
  return <main dir="rtl" className="public-profile"><header><a href="/" className="public-brand"><span>V</span><b>VibeLab</b></a><a href="/register">ساخت پروفایل من</a></header><section className="public-profile-hero"><span className="public-avatar">{profile.fullName.slice(0, 1)}</span><p>VIBELAB CREATOR PROFILE</p><h1>{profile.fullName}</h1><h2>{profile.headline}</h2><p className="public-bio">{profile.bio}</p><div className="public-actions"><a href={`/api/profile/${profile.id}/resume`}>دریافت رزومه</a>{profile.portfolioUrl && <a href={profile.portfolioUrl} target="_blank" rel="noreferrer">نمونه‌کار آنلاین</a>}</div></section><section className="public-projects"><div><p>SKILLS</p><h2>مهارت‌ها و پروژه‌ها</h2><span>{profile.skills}</span></div><div className="public-project-grid">{profile.projects.map((project) => <article key={project.name}>{project.screenshotUrl && <img src={project.screenshotUrl} alt={`نمای پروژه ${project.name}`} />}<div><h3>{project.name}</h3><p>{project.description}</p>{project.estimatedMin && <b>{project.estimatedMin.toLocaleString("fa-IR")} تا {project.estimatedMax?.toLocaleString("fa-IR")} تومان</b>}<a href={project.deploymentUrl} target="_blank" rel="noreferrer">مشاهده پروژه ↗</a></div></article>)}</div></section></main>;
}

import { getVibelabD1 } from "@/lib/cloudflare-d1";

export const internshipLocations = [
  {
    id: "narmak-haft-hoz",
    city: "تهران",
    title: "نارمک، میدان هفت حوض",
    area: "شرق تهران",
    access: "مترو سرسبز / تاکسی‌های هفت حوض",
    price: "۳۰ دقیقه اول رایگان؛ سپس هزینه فضای کار اشتراکی حدود ۲۵۰ تا ۴۵۰ هزار تومان برای هر حضور نیم‌روزه",
    bestFor: "طراحی سایت محلی، تولید محتوا برای کسب‌وکارهای شرق تهران",
  },
  {
    id: "vanak-mirdamad",
    city: "تهران",
    title: "ونک / میرداماد",
    area: "مرکز کسب‌وکار تهران",
    access: "BRT و مترو حقانی/میرداماد",
    price: "۳۰ دقیقه اول رایگان؛ سپس هزینه فضای کار اشتراکی حدود ۳۵۰ تا ۶۵۰ هزار تومان برای هر حضور نیم‌روزه",
    bestFor: "جلسات B2B، رزومه، فروش خدمات AI به شرکت‌ها",
  },
  {
    id: "enghelab-university",
    city: "تهران",
    title: "انقلاب / دانشگاه تهران",
    area: "مرکز آموزشی و دانشجویی",
    access: "مترو انقلاب و BRT",
    price: "۳۰ دقیقه اول رایگان؛ سپس هزینه فضای کار اشتراکی/کافه کاری حدود ۲۰۰ تا ۴۰۰ هزار تومان برای هر حضور نیم‌روزه",
    bestFor: "کارآموز دانشجویی، رزومه، نمونه‌کار و مسیر فریلنسری",
  },
  {
    id: "saadatabad-punak",
    city: "تهران",
    title: "سعادت‌آباد / پونک",
    area: "غرب تهران",
    access: "تاکسی و مترو نزدیک صادقیه/میدان صنعت",
    price: "۳۰ دقیقه اول رایگان؛ سپس هزینه فضای کار اشتراکی حدود ۳۰۰ تا ۶۰۰ هزار تومان برای هر حضور نیم‌روزه",
    bestFor: "تولید محتوا، سایت خدماتی و شبکه‌سازی غرب تهران",
  },
  {
    id: "karaj-azimieh-gohardasht",
    city: "کرج",
    title: "کرج، عظیمیه / گوهردشت",
    area: "کرج",
    access: "مترو کرج + تاکسی شهری",
    price: "۳۰ دقیقه اول رایگان؛ سپس هزینه فضای کار اشتراکی/کافه کاری حدود ۱۵۰ تا ۳۵۰ هزار تومان برای هر حضور نیم‌روزه",
    bestFor: "کارآموزی کم‌هزینه‌تر، پروژه‌های محلی و نمونه‌کار سریع",
  },
];

export type InternshipApplicationInput = {
  fullName: string;
  email: string;
  phone: string;
  track: string;
  locationId: string;
  resumeText: string;
  portfolioUrl?: string;
  availability?: string;
};

async function ensureInternshipTable() {
  const db = await getVibelabD1();
  if (!db) return null;
  await db.prepare(`CREATE TABLE IF NOT EXISTS vibelab_internship_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    track TEXT NOT NULL,
    location_id TEXT NOT NULL,
    resume_text TEXT NOT NULL,
    portfolio_url TEXT,
    availability TEXT,
    status TEXT NOT NULL DEFAULT 'جدید',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  return db;
}

export async function createInternshipApplication(input: InternshipApplicationInput) {
  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();
  const phone = input.phone.trim();
  const resumeText = input.resumeText.trim();
  const location = internshipLocations.find((item) => item.id === input.locationId);
  const allowedTracks = ["طراحی سایت با AI", "تولید محتوا با AI", "هر دو مسیر"];

  if (fullName.length < 2) throw new Error("نام و نام خانوادگی را کامل وارد کنید.");
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("ایمیل معتبر نیست.");
  if (phone.replace(/\D/g, "").length < 10) throw new Error("شماره تماس معتبر نیست.");
  if (!allowedTracks.includes(input.track)) throw new Error("مسیر کارآموزی معتبر نیست.");
  if (!location) throw new Error("نقطه آموزشی معتبر نیست.");
  if (resumeText.length < 40) throw new Error("رزومه یا معرفی کوتاه را کمی کامل‌تر بنویسید.");

  const db = await ensureInternshipTable();
  if (!db) throw new Error("دیتابیس Cloudflare D1 در دسترس نیست.");

  await db
    .prepare(`INSERT INTO vibelab_internship_applications
      (full_name, email, phone, track, location_id, resume_text, portfolio_url, availability)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(fullName, email, phone, input.track, input.locationId, resumeText.slice(0, 5000), input.portfolioUrl?.trim() || null, input.availability?.trim() || null)
    .run();

  return { ok: true, location };
}

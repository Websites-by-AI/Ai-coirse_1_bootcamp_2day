export type LearningResource = {
  source: "YouTube" | "Aparat" | "Faradars" | "Free Course";
  title: string;
  url: string;
  reason: string;
  level: "شروع" | "میانی" | "پیشرفته";
};

export type LearningHub = {
  id: string;
  city: string;
  title: string;
  area: string;
  addressHint: string;
  coworkingCost: string;
  mentorSessionCost: string;
  bestFor: string;
};

export type MentorProfile = {
  id: string;
  name: string;
  specialty: string;
  city: string;
  dayRate: string;
  bestFor: string;
};

export const learningHubs: LearningHub[] = [
  { id: "narmak-haft-hoz", city: "تهران", title: "نارمک، میدان هفت حوض", area: "شرق تهران", addressHint: "نزدیک میدان هفت حوض / دسترسی سرسبز", coworkingCost: "۳۰ دقیقه اول رایگان؛ سپس حدود ۲۵۰ تا ۴۵۰ هزار تومان نیم‌روزه", mentorSessionCost: "مربی نیم‌روز: حدود ۱.۲ تا ۲.۵ میلیون تومان", bestFor: "سایت کسب‌وکار محلی و تولید محتوا برای شرق تهران" },
  { id: "vanak-mirdamad", city: "تهران", title: "ونک / میرداماد", area: "مرکز کسب‌وکار", addressHint: "دسترسی BRT، حقانی و میرداماد", coworkingCost: "۳۰ دقیقه اول رایگان؛ سپس حدود ۳۵۰ تا ۶۵۰ هزار تومان نیم‌روزه", mentorSessionCost: "مربی نیم‌روز: حدود ۲ تا ۴ میلیون تومان", bestFor: "B2B، فروش خدمات AI، جلسه با شرکت‌ها" },
  { id: "enghelab-university", city: "تهران", title: "انقلاب / دانشگاه تهران", area: "دانشجویی", addressHint: "مترو انقلاب و BRT", coworkingCost: "۳۰ دقیقه اول رایگان؛ سپس حدود ۲۰۰ تا ۴۰۰ هزار تومان نیم‌روزه", mentorSessionCost: "مربی نیم‌روز: حدود ۱ تا ۲ میلیون تومان", bestFor: "رزومه، نمونه‌کار دانشجویی و فریلنسری" },
  { id: "saadatabad-punak", city: "تهران", title: "سعادت‌آباد / پونک", area: "غرب تهران", addressHint: "میدان صنعت، صادقیه، تاکسی محلی", coworkingCost: "۳۰ دقیقه اول رایگان؛ سپس حدود ۳۰۰ تا ۶۰۰ هزار تومان نیم‌روزه", mentorSessionCost: "مربی نیم‌روز: حدود ۱.۵ تا ۳.۵ میلیون تومان", bestFor: "شبکه‌سازی، سایت خدماتی و تولید محتوا" },
  { id: "karaj-azimieh", city: "کرج", title: "کرج، عظیمیه / گوهردشت", area: "کرج", addressHint: "مترو کرج + تاکسی شهری", coworkingCost: "۳۰ دقیقه اول رایگان؛ سپس حدود ۱۵۰ تا ۳۵۰ هزار تومان نیم‌روزه", mentorSessionCost: "مربی نیم‌روز: حدود ۸۰۰ هزار تا ۱.۸ میلیون تومان", bestFor: "هزینه کمتر، پروژه محلی، نمونه‌کار سریع" },
  { id: "tehranpars", city: "تهران", title: "تهرانپارس / فلکه اول", area: "شرق تهران", addressHint: "مترو تهرانپارس و دسترسی اتوبوس", coworkingCost: "۳۰ دقیقه اول رایگان؛ سپس حدود ۲۰۰ تا ۴۲۰ هزار تومان نیم‌روزه", mentorSessionCost: "مربی نیم‌روز: حدود ۱ تا ۲.۲ میلیون تومان", bestFor: "کارآموزی تولید محتوا و سایت فروشگاهی کوچک" },
];

export const mentors: MentorProfile[] = [
  { id: "m1", name: "مربی سایت محلی", specialty: "طراحی سایت با AI و Cloudflare", city: "تهران", dayRate: "۲ تا ۴ میلیون تومان برای دو روز", bestFor: "لندینگ و سایت معرفی" },
  { id: "m2", name: "مربی تولید محتوا", specialty: "سناریو، کپشن، ویدیو AI", city: "تهران", dayRate: "۱.۸ تا ۳.۵ میلیون تومان برای دو روز", bestFor: "Content Kit و تقویم محتوا" },
  { id: "m3", name: "مربی رزومه و کاریابی", specialty: "رزومه، پروفایل عمومی، پیام معرفی", city: "تهران", dayRate: "۱.۵ تا ۳ میلیون تومان برای دو روز", bestFor: "ورود به کار و فریلنسری" },
  { id: "m4", name: "مربی Vibe Coding", specialty: "ساخت MVP با ابزارهای AI", city: "تهران", dayRate: "۳ تا ۵ میلیون تومان برای دو روز", bestFor: "مینی‌اپ و داشبورد" },
  { id: "m5", name: "مربی ویدیو AI", specialty: "Kling، Higgsfield، Storyboard", city: "تهران", dayRate: "۲ تا ۴ میلیون تومان برای دو روز", bestFor: "ویدیوی تبلیغاتی کوتاه" },
  { id: "m6", name: "مربی سئو و محتوا", specialty: "SEO، بلاگ، ساختار صفحه فروش", city: "تهران", dayRate: "۱.۸ تا ۳.۲ میلیون تومان برای دو روز", bestFor: "سایت‌های خدماتی" },
  { id: "m7", name: "مربی کسب‌وکار محلی", specialty: "فروش خدمات به SMEها", city: "تهران", dayRate: "۲ تا ۴ میلیون تومان برای دو روز", bestFor: "پیدا کردن مشتری" },
  { id: "m8", name: "مربی کرج", specialty: "نمونه‌کار سریع و سایت محلی", city: "کرج", dayRate: "۱ تا ۲.۵ میلیون تومان برای دو روز", bestFor: "کارآموزان کرج" },
  { id: "m9", name: "مربی UI/UX", specialty: "طراحی تجربه و دیزاین سیستم", city: "تهران", dayRate: "۲ تا ۴ میلیون تومان برای دو روز", bestFor: "ظاهر حرفه‌ای سایت" },
  { id: "m10", name: "مربی استارتاپ و Pitch", specialty: "Pitch deck، فراخوان‌ها، CRM", city: "آنلاین", dayRate: "۲ تا ۴.۵ میلیون تومان برای دو روز", bestFor: "اپلای و همکاری بین‌المللی" },
];

export const baseResources: LearningResource[] = [
  { source: "YouTube", title: "آموزش Prompt Engineering فارسی", url: "https://www.youtube.com/results?search_query=%D8%A2%D9%85%D9%88%D8%B2%D8%B4+prompt+engineering+%D9%81%D8%A7%D8%B1%D8%B3%DB%8C", reason: "برای شروع کار با Claude و Gemini", level: "شروع" },
  { source: "YouTube", title: "Vibe Coding با AI", url: "https://www.youtube.com/results?search_query=vibe+coding+AI+website+builder", reason: "برای ساخت سایت و مینی‌اپ با توضیح متنی", level: "میانی" },
  { source: "Aparat", title: "آموزش تولید محتوا با هوش مصنوعی", url: "https://www.aparat.com/result/%D8%AA%D9%88%D9%84%DB%8C%D8%AF_%D9%85%D8%AD%D8%AA%D9%88%D8%A7_%D8%A8%D8%A7_%D9%87%D9%88%D8%B4_%D9%85%D8%B5%D9%86%D9%88%D8%B9%DB%8C", reason: "منابع فارسی رایگان برای محتوای شبکه‌های اجتماعی", level: "شروع" },
  { source: "Faradars", title: "دوره‌های هوش مصنوعی و پایتون فرادرس", url: "https://faradars.org/how-to-learn/artificial-intelligence", reason: "مسیر فارسی ساختاریافته برای یادگیری AI", level: "میانی" },
  { source: "Free Course", title: "Google AI Essentials", url: "https://www.coursera.org/google-ai", reason: "مبانی AI برای افراد غیرفنی", level: "شروع" },
  { source: "Free Course", title: "CS50 AI with Python", url: "https://cs50.harvard.edu/ai/", reason: "برای مسیر فنی و پایتون", level: "پیشرفته" },
];

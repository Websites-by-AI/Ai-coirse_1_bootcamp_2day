export const channelTypes = [
  { id: "learning", title: "آموزش روزانه", emoji: "📚", description: "یک منبع کوتاه، ویدیو یا تمرین برای طراحی سایت، محتوا یا AI." },
  { id: "internship", title: "کارآموزی و گروه محلی", emoji: "🎓", description: "تسک‌های کارآموز، وضعیت گروه ۴ نفره و زمان جلسه حضوری/آنلاین." },
  { id: "project", title: "پروژه مشتری", emoji: "💼", description: "ایده‌های پروژه قابل فروش، نمونه قیمت و مشتری هدف." },
  { id: "mentor", title: "مربی و مدرسه اسنپی", emoji: "🏫", description: "نقطه آموزشی، مربی، هزینه فضا و مدل تشکیل گروه محلی." },
  { id: "career", title: "مسیر شغلی و رزومه", emoji: "🧭", description: "رزومه، نمونه‌کار، پیام معرفی و بازار کار ایران/جهان." },
  { id: "startup", title: "فراخوان و استارتاپ", emoji: "🚀", description: "فراخوان‌ها، برنامه‌های شتاب‌دهی و مسیر ثبت شرکت." },
  { id: "announcement", title: "اطلاعیه و جلسه", emoji: "📣", description: "جلسه آنلاین، اعلام زمان، خبر کانال و تغییرات برنامه." },
] as const;

export type ChannelTypeId = (typeof channelTypes)[number]["id"];

export function channelType(id?: string) {
  return channelTypes.find((item) => item.id === id) ?? channelTypes[0];
}

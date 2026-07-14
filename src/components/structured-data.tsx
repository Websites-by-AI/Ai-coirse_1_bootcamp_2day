export default function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "VibeLab by Noora Academy",
    alternateName: "VibeLab",
    url: "https://vibelab.ir",
    logo: "https://vibelab.ir/logo.png",
    sameAs: [
      "https://t.me/+TrS3ViVv_zn3c8ls",
      "https://t.me/+pzdlrF_TRDRjMmU0",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+98-21-88885255",
      contactType: "customer service",
      availableLanguage: ["Persian", "English"],
    },
  };

  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "VibeLab AI Bootcamp",
    description:
      "ماراتن دو روزه ساخت محتوا، ویدیو و وب‌اپ با هوش مصنوعی؛ بدون نیاز به کدنویسی.",
    provider: {
      "@type": "Organization",
      name: "Noora Academy",
      sameAs: "https://noora.academy",
    },
    courseMode: ["onsite", "online"],
    inLanguage: "fa",
    duration: "P2D",
    educationalLevel: "Beginner to Intermediate",
    teaches: [
      "Vibe Coding",
      "Prompt Engineering",
      "AI Content Creation",
      "No-Code Development",
      "AI Video Generation",
    ],
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      inLanguage: "fa",
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "VibeLab",
    url: "https://vibelab.ir",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://vibelab.ir/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "VibeLab چیست؟",
        acceptedAnswer: {
          "@type": "Answer",
          text: "VibeLab یک ماراتن دو روزه عملی است که در آن با ابزارهای هوش مصنوعی مانند Claude، Gemini، Higgsfield و Kling، محتوا و وب‌اپ می‌سازید؛ بدون نیاز به کدنویسی.",
        },
      },
      {
        "@type": "Question",
        name: "آیا برای شرکت در VibeLab نیاز به دانش برنامه‌نویسی دارم؟",
        acceptedAnswer: {
          "@type": "Answer",
          text: "خیر. VibeLab برای افرادی طراحی شده که هیچ تجربه برنامه‌نویسی ندارند. با Vibe Coding، فقط با توضیح زبان طبیعی خود، محصول می‌سازید.",
        },
      },
      {
        "@type": "Question",
        name: "خروجی‌های دوره VibeLab چیست؟",
        acceptedAnswer: {
          "@type": "Answer",
          text: "در پایان دوره، یک Content Kit کامل (سناریو، استوری‌بورد، ویدیو) و یک وب‌سایت یا مینی‌اپ واقعی خواهید داشت که می‌توانید منتشر کنید.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}

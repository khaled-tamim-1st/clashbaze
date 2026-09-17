import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { Link } from "wouter";
import { Shield, Users, CheckCircle2, MessageCircle } from "lucide-react";
import { TrackedWhatsAppLink } from "@/components/TrackedWhatsAppLink";

const aboutFaqItems = [
  {
    question: "هل كلاش ماركت متجر رسمي معتمد من Supercell؟",
    answer: "لا. كلاش ماركت متجر مستقل يعمل في سوق تداول حسابات الألعاب. ليس له أي ارتباط أو اعتماد رسمي من شركة Supercell.",
  },
  {
    question: "كيف أتواصل مع المتجر؟",
    answer: "التواصل يتم عبر الواتساب مباشرة. يمكنك الضغط على زر الواتساب في أي صفحة حساب أو في أسفل الموقع للتحدث مع إدارة المتجر.",
  },
  {
    question: "هل يمكنني بيع حسابي لكلاش ماركت؟",
    answer: "نعم، يمكنك التواصل مع إدارة المتجر عبر الواتساب وعرض تفاصيل حسابك. إذا كان الحساب يستوفي معايير المتجر، يتم الاتفاق على السعر وشرائه مباشرة.",
  },
  {
    question: "ما طرق الدفع المتاحة؟",
    answer: "تحويل بنكي مباشر على حسابات سعودية وخليجية، أو ترتيب الدفع عبر تابي أو تمارا بالتنسيق المباشر مع إدارة المتجر.",
  },
];

const aboutFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: aboutFaqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "كلاش ماركت",
  alternateName: ["Clash Market", "متجر كلاش", "كلاش ماركت حسابات"],
  url: "https://www.clashmarket.online",
  description: "متجر متخصص في بيع وشراء حسابات كلاش أوف كلانس وكلاش رويال في السعودية والخليج العربي.",
  areaServed: [
    { "@type": "Country", name: "المملكة العربية السعودية" },
    { "@type": "Country", name: "الإمارات العربية المتحدة" },
    { "@type": "Country", name: "الكويت" },
    { "@type": "Country", name: "قطر" },
    { "@type": "Country", name: "البحرين" },
    { "@type": "Country", name: "سلطنة عمان" },
  ],
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "كلاش ماركت", item: "https://www.clashmarket.online/" },
    { "@type": "ListItem", position: 2, name: "من نحن", item: "https://www.clashmarket.online/about" },
  ],
};

export default function About() {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "966576742294";

  return (
    <>
      <SEO
        title="كلاش ماركت – متجر حسابات كلاش أوف كلانس وكلاش رويال | من نحن"
        description="تعرف على كلاش ماركت، المتجر المتخصص في بيع وشراء حسابات كلاش أوف كلانس وكلاش رويال بتسليم يدوي مباشر وضمان وفق سياسة المتجر في السعودية والخليج."
        url="https://www.clashmarket.online/about"
        jsonLd={[breadcrumbJsonLd, orgJsonLd, aboutFaqJsonLd]}
      />

      <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
        <Navbar />

        <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold mb-3">
              متجر حسابات كلاش في الخليج
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
              كلاش ماركت – متجر وسوق حسابات كلاش أوف كلانس وكلاش رويال
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-sm md:text-base">
              متجر تجاري متخصص في شراء وبيع حسابات كلاش أوف كلانس وكلاش رويال، يخدم اللاعبين في المملكة العربية السعودية ودول الخليج العربي.
            </p>
          </div>

          <div className="space-y-8">
            {/* Who we are */}
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-4">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                من هو كلاش ماركت؟
              </h2>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                كلاش ماركت هو متجر مستقل بدأ بهدف توفير مكان واحد يمكن للاعبين من خلاله شراء حسابات كلاش أوف كلانس وكلاش رويال بشكل مباشر وواضح. نحن نعمل كتجار متخصصين — نشتري الحسابات المتميزة من أصحابها، نفحصها يدوياً، ثم نعرضها للبيع مع ضمان وفق سياسة المتجر.
              </p>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                الفكرة بسيطة: بدلاً من أن يبحث اللاعب عن بائع مجهول على منصات التواصل ويخاطر بأمواله، يتعامل مع متجر له سياسة واضحة وطريقة تسليم منظمة وقناة تواصل مباشرة عبر الواتساب.
              </p>
            </div>

            {/* What we offer */}
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-4">
              <h2 className="text-2xl font-bold text-foreground">ما الذي يقدمه المتجر؟</h2>
              <ul className="space-y-3 text-muted-foreground text-sm md:text-base">
                <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" /> <span><strong>حسابات كلاش أوف كلانس</strong> — قريات من تاون هول 14 وحتى 18، بمستويات تطوير مختلفة تناسب ميزانيات متعددة. <Link href="/clash-of-clans" className="text-primary hover:underline">تصفح القريات المتاحة</Link>.</span></li>
                <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" /> <span><strong>حسابات كلاش رويال</strong> — حسابات بكروت متقدمة وتطورات وأبطال. <Link href="/clash-royale" className="text-primary hover:underline">تصفح حسابات كلاش رويال</Link>.</span></li>
                <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" /> <span><strong>تسليم يدوي مباشر</strong> — كل عملية بيع تتم عبر محادثة واتساب حقيقية وليس عبر نظام آلي.</span></li>
                <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" /> <span><strong>خيارات الدفع</strong> — تحويل بنكي مباشر، أو ترتيب التقسيط عبر تابي أو تمارا بالتنسيق المباشر.</span></li>
              </ul>
            </div>

            {/* How we inspect */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
                <Users className="w-8 h-8 text-primary mb-2" />
                <h3 className="text-lg font-bold">كيف نفحص الحسابات؟</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  قبل عرض أي حساب للبيع، نتأكد من عدة نقاط: استقلالية البريد الإلكتروني، عدم وجود نزاعات ملكية سابقة، سلامة سجل الشحنات (عدم وجود chargebacks)، وأن الحساب لم يتعرض لأي إجراء عقابي سابق من Supercell.
                </p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
                <h3 className="text-lg font-bold">كيف يتم التسليم؟</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  بعد إتمام الدفع، يتم نقل بريد Supercell ID إلى بريدك الشخصي، وتغيير كلمة السر، وتفعيل حماية الحساب (Account Protection) على رقم هاتفك، وتسليمك رموز الاسترداد. التفاصيل الكاملة في <Link href="/how-it-works" className="text-primary hover:underline">صفحة طريقة الشراء والتسليم</Link>.
                </p>
              </div>
            </div>

            {/* Guarantee & difference */}
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-4">
              <h2 className="text-2xl font-bold text-foreground">الضمان والفرق بين المتجر والبائع المجهول</h2>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                عند الشراء من بائع مجهول على تويتر أو ديسكورد، لا توجد سياسة واضحة ولا مرجعية في حال حدوث مشكلة. في كلاش ماركت:
              </p>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li className="flex gap-2"><span className="text-primary">•</span> يتم تسليم الإيميل الأساسي — وليس إيميل فرعي أو مؤقت.</li>
                <li className="flex gap-2"><span className="text-primary">•</span> يتم تأمين الحساب على جهازك ورقمك قبل انتهاء الجلسة.</li>
                <li className="flex gap-2"><span className="text-primary">•</span> متابعة ما بعد البيع وفق سياسة المتجر المعلنة.</li>
                <li className="flex gap-2"><span className="text-primary">•</span> قناة تواصل مفتوحة ودائمة عبر الواتساب.</li>
              </ul>
              <p className="text-muted-foreground text-sm">
                اطلع على <Link href="/guarantee" className="text-primary hover:underline">سياسة الضمان وحماية المشتري</Link> للتفاصيل الكاملة.
              </p>
            </div>

            {/* Who we serve */}
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-4">
              <h2 className="text-2xl font-bold text-foreground">من نخدم؟</h2>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                نركز بالدرجة الأولى على اللاعبين في السعودية ودول الخليج العربي (الإمارات، الكويت، قطر، البحرين، عمان). التسعير بالريال السعودي، والدفع عبر حسابات بنكية سعودية وخليجية، وخدمة التقسيط عبر تابي وتمارا متاحة للمقيمين في المملكة.
              </p>
            </div>

            {/* FAQ */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">أسئلة شائعة عن كلاش ماركت</h2>
              {aboutFaqItems.map((item, i) => (
                <details key={i} className="group border border-border rounded-lg bg-card/50 backdrop-blur-sm">
                  <summary className="flex items-center justify-between cursor-pointer p-4 font-semibold text-foreground hover:text-primary transition-colors">
                    <span>{item.question}</span>
                    <span className="text-primary text-xl group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="px-4 pb-4 text-muted-foreground leading-relaxed">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>

            {/* CTA */}
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 text-center space-y-4 shadow-sm">
              <h2 className="text-xl font-bold">جاهز لاختيار حسابك أو لديك استفسار؟</h2>
              <p className="text-muted-foreground text-sm max-w-lg mx-auto">
                تصفح الحسابات المتاحة أو تواصل مع إدارة المتجر للإجابة عن أي سؤال.
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-2">
                <Link href="/clash-of-clans" className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-sm transition-colors">
                  تصفح قريات كلاش أوف كلانس
                </Link>
                <Link href="/clash-royale" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-colors">
                  تصفح حسابات كلاش رويال
                </Link>
                <TrackedWhatsAppLink
                  cta="about_contact"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-colors shadow"
                >
                  <MessageCircle className="w-4 h-4" />
                  تواصل عبر الواتساب
                </TrackedWhatsAppLink>
              </div>
              <p className="text-muted-foreground text-xs mt-2">
                يمكنك أيضاً زيارة <Link href="/blog" className="text-primary hover:underline">مدونة كلاش ماركت</Link> لقراءة أدلة الشراء والحماية.
              </p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}


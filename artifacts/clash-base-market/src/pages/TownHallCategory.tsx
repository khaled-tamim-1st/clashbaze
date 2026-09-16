import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useListAccounts } from "@workspace/api-client-react";
import { AccountCard } from "@/components/AccountCard";
import { SEO } from "@/components/SEO";
import { Link, useRoute } from "wouter";

export type TownHallLevel = 16 | 17 | 18;

interface TownHallConfig {
  level: TownHallLevel;
  title: string;
  heading: string;
  description: string;
  banner: string;
  bannerAlt: string;
  intro: string;
  benefitsTitle: string;
  benefits: Array<{ title: string; text: string }>;
  faqs: Array<{ question: string; answer: string }>;
}

const TH_CONFIGS: Record<TownHallLevel, TownHallConfig> = {
  18: {
    level: 18,
    title: "حسابات كلاش أوف كلانس تاون هول 18 للبيع | قريات ماكس — كلاش ماركت",
    heading: "حسابات كلاش أوف كلانس تاون هول 18 للبيع (TH18 Max)",
    description: "تصفح واشترِ حسابات وقريات كلاش أوف كلانس تاون هول 18 (TH18) ماكس بأحدث الدفاعات والأبطال الستة والمعدات المطورة بتسليم فوري وضمان كلاش ماركت.",
    banner: "/banners/th18-banner.png",
    bannerAlt: "حسابات كلاش أوف كلانس تاون هول 18 للبيع",
    intro: "مرحباً بك في القسم المخصص لقريات وحسابات كلاش أوف كلانس تاون هول 18 (Town Hall 18). يمثل TH18 أعلى مستوى تطوير حالياً في اللعبة، ويوفر للاعبين المحترفين أحدث الأسلحة الدفاعية، وأعلى مستويات الأبطال الستة، والعتاد الملحمي المطور بالكامل للمنافسة في قمة دوري الأساطير (Legend League) وبطولات Clan War Leagues التنافسية.",
    benefitsTitle: "لماذا تختار قرية كلاش أوف كلانس تاون 18 ماكس؟",
    benefits: [
      { title: "أعلى قوة هجومية ودفاعية:", text: "امتلاك TH18 يعفيك من سنوات من التطوير وجمع الموارد، لتلعب مباشرة في أعلى مستوى تنافسي في اللعبة." },
      { title: "الأبطال والمعدات الملحمية:", text: "تضمن وصول أبطالك لمستوياتهم القصوى مع المعدات الملحمية (Epic Equipment) مثل Gauntlet وFrozen Arrow بأعلى قدرات." },
      { title: "دفاعات الجيل الأحدث:", text: "تصاميم دفاعية مدمجة تقاوم استراتيجيات الهجوم الأكثر شراسة في الساحة الدولية." },
    ],
    faqs: [
      { question: "ما هي ميزات شراء حساب تاون هول 18 ماكس من كلاش ماركت؟", answer: "تاون هول 18 يمثل قمة التقدم في كلاش أوف كلانس، مع توفر المستويات القصوى للأبطال الستة وأحدث الدفاعات المدمجة والمعدات الملحمية، مما يمنحك أفضلية فورية في دوري الأساطير وحروب CWL." },
      { question: "هل يتم تسليم قرية تاون 18 مع الإيميل الأساسي وتأمين الحساب؟", answer: "نعم، يتم نقل بريد Supercell ID بالكامل وتغيير كلمة المرور وتفعيل الحماية بخطوتين وAccount Protection على رقمك الشخصي مع تسليم رموز الاسترداد." },
      { question: "هل تتوفر خيارات تقسيط لشراء قريات TH18؟", answer: "نعم، يمكنك التنسيق المباشر عبر الواتساب لتقسيط قيمة الحساب عبر تابي أو تمارا على 4 دفعات ميسرة." },
      { question: "كيف أضمن عدم استرجاع الحساب بعد الشراء؟", answer: "نوفر ضماناً كاملاً وفق سياسة المتجر، مع فحص يدوي دقيق لجميع القريات قبل عرضها والتأكد من نظافة سجل الملكية." },
    ],
  },
  17: {
    level: 17,
    title: "حسابات كلاش أوف كلانس تاون هول 17 للبيع | قريات ماكس وشبه ماكس — كلاش ماركت",
    heading: "حسابات كلاش أوف كلانس تاون هول 17 للبيع (TH17 Max)",
    description: "اشترِ حسابات وقريات كلاش أوف كلانس تاون هول 17 (TH17) ماكس وشبه ماكس بأسعار منافسة وتسليم فوري مع نقل ملكية Supercell ID وضمان متجر كلاش ماركت.",
    banner: "/banners/th17-banner.png",
    bannerAlt: "حسابات كلاش أوف كلانس تاون هول 17 للبيع",
    intro: "استكشف أقوى قريات كلاش أوف كلانس تاون هول 17 (Town Hall 17). يعتبر TH17 خياراً استراتيجياً ممتازاً للاعبين الباحثين عن قرية متقدمة للغاية قادرة على التنافس في حروب القبائل الكبرى (CWL) دون دفع التكلفة المرتفعة جداً لأحدث تاون هول، مع مستويات أبطال عالية ومعدات قتالية فعالة.",
    benefitsTitle: "مميزات اقتناء قرية تاون هول 17",
    benefits: [
      { title: "أداء ممتاز في حروب CWL:", text: "دفاعات متينة وجيوش مدربة لمسح الخصوم في درجات Champion وMaster." },
      { title: "أبطال بمستويات متقدمة:", text: "تطويرات قوية للملك والملكة والآمر الكبير والبطلة الملكية." },
      { title: "قيمة مالية ممتازة:", text: "أسعار مدروسة تمنحك أفضل قيمة مقابل التطويرات المنجزة في القرية." },
    ],
    faqs: [
      { question: "ما هي ميزات شراء حساب تاون هول 17؟", answer: "تاون هول 17 يقدم توازناً مثالياً بين القوة الهجومية المتطورة والتكلفة الممتازة مقارنة بأحدث تاون، مع ترقيات قوية للنسر المدافع وتشكيلات متقدمة للحروب." },
      { question: "هل القريات المعروضة ماكس أم شبه ماكس؟", answer: "نوفر قريات تاون هول 17 بمستويات متعددة تشمل قريات ماكس بالكامل وقريات شبه ماكس تناسب مختلف الميزانيات، وتفاصيل كل قرية مدونة بوضوح." },
      { question: "كيف يتم استلام قرية تاون 17 بعد الدفع؟", answer: "يتم التواصل فوراً عبر الواتساب لنقل البريد الإلكتروني الخاص بـ Supercell ID وتأكيد الحساب وتغيير كلمات المرور في جلسة مباشرة." },
      { question: "هل يشمل الحساب ضمان ضد السحب؟", answer: "نعم، جميع الحسابات مشمولة بضمان كلاش ماركت الذهبي ضد السحب والاسترجاع مع دعم فني مستمر." },
    ],
  },
  16: {
    level: 16,
    title: "حسابات كلاش أوف كلانس تاون هول 16 للبيع | قريات مميزة بأسعار منافسة — كلاش ماركت",
    heading: "حسابات كلاش أوف كلانس تاون هول 16 للبيع (TH16)",
    description: "تسوق حسابات كلاش أوف كلانس تاون هول 16 (TH16) بتصاميم دفاعية قوية وأبطال متقدمين ومعدات ملحمية بتسليم فوري وضمان كلاش ماركت المعتمد.",
    banner: "/banners/th16-banner.png",
    bannerAlt: "حسابات كلاش أوف كلانس تاون هول 16 للبيع",
    intro: "تصفح تشكيلة حسابات وقريات كلاش أوف كلانس تاون هول 16 (Town Hall 16). يقدم TH16 نقطة انطلاق مثالية ومتقدمة للاعبين الذين يبحثون عن قوة دفاعية قوية بالدفاعات المدمجة الجديدة ومعدات الأبطال الملحمية، مع الحفاظ على سعر اقتصادي ومناسب في متناول الجميع.",
    benefitsTitle: "لماذا يفضل الكثيرون شراء تاون هول 16؟",
    benefits: [
      { title: "أفضل توازن اقتصادي:", text: "الحصول على قرية تنافسية قوية جداً بتكلفة شراء ميسرة." },
      { title: "دفاعات مدمجة حديثة:", text: "المدافع المرتدة وأبراج السهام المتعددة التي تزيد من صعوبة مسح قريتك." },
      { title: "نظام المعدات (Hero Equipment):", text: "فتح معظم المعدات الملحمية والعادية وتطويرها." },
    ],
    faqs: [
      { question: "ما الذي يميز قريات تاون هول 16؟", answer: "تاون هول 16 يمثل مرحلة دفاعية ممتازة بفضل الدفاعات المدمجة مثل المدافع المرتدة (Ricochet Cannon) وأبراج رماة السهام المتعددة (Multi-Archer Tower) مع معدات أبطال متنوعة وتكلفة شراء اقتصادية." },
      { question: "هل تاون 16 مناسب للدخول في كلانات قوية؟", answer: "نعم بالتأكيد، قريات TH16 مطلوبة بكثرة في كلانات الحروب والـ CWL ولديها قدرة تنافسية عالية." },
      { question: "كيف يتم تأمين القرية بعد الشراء؟", answer: "يتم تسليم بريد Supercell ID الرسمي وتفعيله على هاتفك مباشرة مع تفعيل رموز الاسترداد لضمان حماية مطلقة." },
      { question: "هل يمكنني بيع أو استبدال قريتي مع تاون 16؟", answer: "يمكنك التواصل مع إدارة المتجر عبر الواتساب لبحث خيارات البيع المباشر أو الترقية وفق سياسة المتجر." },
    ],
  },
};

interface TownHallCategoryProps {
  level?: TownHallLevel;
}

export default function TownHallCategory({ level: propLevel }: TownHallCategoryProps) {
  const [, paramsCoc] = useRoute("/clash-of-clans/town-hall-:level");
  const [, paramsDirect] = useRoute("/town-hall-:level");

  const parsedParam = Number(paramsCoc?.level || paramsDirect?.level);
  const resolvedLevel: TownHallLevel = (propLevel || (parsedParam === 16 || parsedParam === 17 || parsedParam === 18 ? parsedParam : 18)) as TownHallLevel;

  const config = TH_CONFIGS[resolvedLevel] || TH_CONFIGS[18];

  const { data: accounts, isLoading } = useListAccounts({
    game: "clash-of-clans",
    townHall: config.level,
    status: "available",
  });

  const canonicalUrl = `https://www.clashmarket.online/clash-of-clans/town-hall-${config.level}`;

  const breadcrumbItems = [
    { name: "كلاش ماركت", path: "/" },
    { name: "حسابات كلاش أوف كلانس", path: "/clash-of-clans" },
    { name: `تاون هول ${config.level}`, path: `/clash-of-clans/town-hall-${config.level}` },
  ];

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `https://www.clashmarket.online${item.path}`,
    })),
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: config.faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };

  const itemListJsonLd = accounts && accounts.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: config.title,
    itemListElement: accounts.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://www.clashmarket.online/account/${a.slug}`,
      name: a.title,
    })),
  } : undefined;

  const jsonLdArray = [breadcrumbJsonLd, faqJsonLd, itemListJsonLd].filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <SEO
        title={config.title}
        description={config.description}
        url={canonicalUrl}
        image={`https://www.clashmarket.online${config.banner}`}
        jsonLd={jsonLdArray}
      />
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        {/* Breadcrumb Navigation */}
        <nav aria-label="breadcrumb" className="text-sm text-muted-foreground mb-6 flex flex-wrap items-center gap-2">
          {breadcrumbItems.map((item, index) => (
            <span key={item.path} className="flex items-center gap-2">
              {index > 0 && <span className="text-border">/</span>}
              {index === breadcrumbItems.length - 1 ? (
                <span className="text-foreground font-semibold">{item.name}</span>
              ) : (
                <Link href={item.path} className="hover:text-primary transition-colors">
                  {item.name}
                </Link>
              )}
            </span>
          ))}
        </nav>

        {/* Hero Visual Banner Card */}
        <div className="mb-8 rounded-2xl overflow-hidden border border-border/70 shadow-lg bg-card/50">
          <img
            src={config.banner}
            alt={config.bannerAlt}
            width={1024}
            height={393}
            loading="eager"
            className="w-full h-auto object-cover block aspect-[1024/393]"
          />
        </div>

        {/* H1 & Intro Description */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6 text-foreground tracking-tight break-words">
          {config.heading}
        </h1>
        <div className="max-w-4xl mb-12 space-y-4 text-base md:text-lg text-muted-foreground leading-relaxed md:leading-8">
          <p>{config.intro}</p>
        </div>

        {/* Accounts Grid */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-8 border-b border-border/60 pb-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">
            قريات تاون هول {config.level} المتاحة للشراء
          </h2>
          <span className="text-xs sm:text-sm md:text-base text-muted-foreground">تسليم يدوي فوري وضمان كلاش ماركت</span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : accounts && accounts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-6 bg-card/30 border border-border/60 rounded-2xl text-muted-foreground">
            <p className="text-lg font-medium mb-2">لا توجد حسابات تاون هول {config.level} معروضة حالياً.</p>
            <p className="text-sm">يمكنك التواصل معنا عبر الواتساب للاستفسار عن توفر قريات جديدة مطابقة لمواصفاتك.</p>
          </div>
        )}

        {/* Educational Content / Benefits */}
        <section className="mt-16 bg-card/40 border border-border/70 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">{config.benefitsTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {config.benefits.map((b, i) => (
              <div key={i} className="p-5 rounded-xl bg-background/60 border border-border/60">
                <h3 className="font-bold text-foreground mb-2 text-base md:text-lg">{b.title}</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{b.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Browse Other Town Halls */}
        <section className="mt-12">
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-foreground">تصفح مستويات تاون هول أخرى</h2>
          <div className="flex flex-wrap gap-3">
            {([18, 17, 16] as TownHallLevel[])
              .filter((lvl) => lvl !== config.level)
              .map((lvl) => (
                <Link
                  key={lvl}
                  href={`/clash-of-clans/town-hall-${lvl}`}
                  className="px-5 py-2.5 rounded-xl bg-card border border-border hover:border-primary/50 text-foreground text-sm font-semibold transition-colors"
                >
                  حسابات تاون هول {lvl}
                </Link>
              ))}
            <Link
              href="/clash-of-clans"
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              جميع قريات كلاش أوف كلانس
            </Link>
          </div>
        </section>

        {/* Category FAQ */}
        <section className="mt-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">
            أسئلة شائعة حول حسابات تاون هول {config.level}
          </h2>
          <div className="space-y-4 max-w-4xl">
            {config.faqs.map((item, i) => (
              <details
                key={i}
                className="group border border-border/80 rounded-xl bg-card/60 backdrop-blur-sm transition-all"
              >
                <summary className="flex items-center justify-between cursor-pointer p-5 font-semibold text-foreground hover:text-primary transition-colors text-base md:text-lg">
                  <span>{item.question}</span>
                  <span className="text-primary text-2xl group-open:rotate-45 transition-transform shrink-0 mr-4">+</span>
                </summary>
                <p className="px-5 pb-5 text-muted-foreground leading-relaxed md:leading-8 text-sm md:text-base border-t border-border/40 pt-3">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Navigation back */}
        <div className="mt-12 pt-6 border-t border-border/60">
          <Link href="/clash-of-clans" className="text-primary hover:underline text-sm md:text-base inline-flex items-center gap-2">
            <span>←</span>
            <span>العودة لقسم كلاش أوف كلانس الرئيسي</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

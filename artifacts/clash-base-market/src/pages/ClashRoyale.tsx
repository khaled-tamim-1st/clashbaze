import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useListAccounts } from "@workspace/api-client-react";
import { AccountCard } from "@/components/AccountCard";
import { SEO } from "@/components/SEO";
import { Link } from "wouter";

const crFaqItems = [
  {
    question: "كيف أشتري حساب كلاش رويال من كلاش ماركت؟",
    answer: "اختر الحساب المناسب من القائمة، تواصل عبر الواتساب مع إدارة المتجر، ويتم نقل ملكية Supercell ID وتغيير البريد الإلكتروني وتأمين الحساب برقمك خلال دقائق.",
  },
  {
    question: "ما مستوى البطاقات في حسابات كلاش رويال المعروضة؟",
    answer: "نوفر حسابات تتراوح بين Level 14 و Level 16 (أعلى مستوى حالياً). مستوى البطاقات يؤثر مباشرة على قوتك في السلم التنافسي وRanked Mode.",
  },
  {
    question: "هل حسابات كلاش رويال تحتوي على تطورات (Evolutions)؟",
    answer: "حسب الحساب — بعض الحسابات تحتوي على عدد كبير من التطورات المفعّلة. تفاصيل كل حساب مذكورة في صفحته بما فيها التطورات والأبطال المتاحة.",
  },
  {
    question: "ما الضمان المتاح عند شراء حساب كلاش رويال؟",
    answer: "وفق سياسة المتجر، يتم تسليم الإيميل الأساسي وتفعيل حماية الحساب (Account Protection) على رقمك، مع متابعة بعد البيع لضمان استقرار الحساب.",
  },
  {
    question: "هل يمكن ترتيب الدفع بالتقسيط؟",
    answer: "نعم، يمكن التنسيق مع إدارة المتجر عبر الواتساب لترتيب الدفع عبر تابي أو تمارا على 4 دفعات.",
  },
];

const crFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: crFaqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export default function ClashRoyale() {
  const { data: accounts, isLoading } = useListAccounts({ game: "clash-royale" });
  const { data: featuredAccounts, isLoading: loadingFeatured } = useListAccounts({ game: "clash-royale", featured: "true" });

  const itemListJsonLd = accounts && accounts.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "حسابات كلاش رويال للبيع",
    itemListElement: accounts.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://www.clashmarket.online/account/${a.slug}`,
      name: a.title,
    })),
  } : undefined;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "كلاش ماركت", item: "https://www.clashmarket.online/" },
      { "@type": "ListItem", position: 2, name: "حسابات كلاش رويال", item: "https://www.clashmarket.online/clash-royale" },
    ],
  };

  const jsonLdArray = [breadcrumbJsonLd, itemListJsonLd, crFaqJsonLd].filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <SEO
        title="حسابات كلاش رويال للبيع | كروت ماكس وإيفو — كلاش ماركت"
        description="اشترِ حسابات كلاش رويال بكروت Level 16 وتطورات Evolutions بتسليم يدوي فوري وضمان وفق سياسة المتجر. كلاش ماركت — متجر حسابات كلاش رويال في السعودية والخليج."
        url="https://www.clashmarket.online/clash-royale"
        jsonLd={jsonLdArray}
      />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 md:py-16 max-w-6xl">
        {/* Intro */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6 text-foreground tracking-tight break-words">حسابات كلاش رويال للبيع</h1>
        <div className="max-w-4xl mb-12 space-y-4 text-base md:text-lg text-muted-foreground leading-relaxed md:leading-8">
          <p>
            يوفر كلاش ماركت حسابات كلاش رويال جاهزة للمنافسة في السلم التنافسي وRanked Mode. سواء كنت تبحث عن حساب بكروت Level 16 وتطورات مكتملة، أو حساب متقدم بسعر مناسب — ستجد خيارات متنوعة تلبي أهدافك في اللعبة.
          </p>
          <p>
            كلاش رويال لعبة مختلفة تماماً عن كلاش أوف كلانس — التقدم فيها يعتمد على مستوى البطاقات والتطورات والأبطال وليس على مباني القرية. لذلك قيمة الحساب تُقاس بمعايير خاصة نوضحها أدناه.
          </p>
        </div>

        {/* Featured Section */}
        {featuredAccounts && featuredAccounts.length > 0 && (
          <section className="mb-12 p-6 rounded-2xl bg-card/50 border border-border/80">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-border/60">
              <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
                <span>⭐ حسابات كلاش رويال المميزة</span>
              </h2>
              <span className="text-xs md:text-sm text-red-500 font-semibold">كروت وإيفو ماكس</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredAccounts.map(account => (
                <AccountCard key={account.id} account={account} />
              ))}
            </div>
          </section>
        )}

        {/* Accounts Grid */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-8 border-b border-border/60 pb-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">حسابات كلاش رويال المتاحة الآن</h2>
          <span className="text-xs sm:text-sm md:text-base text-muted-foreground">تسليم يدوي فوري وضمان شامل</span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-96 bg-muted animate-pulse rounded-lg"></div>)}
          </div>
        ) : accounts && accounts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map(account => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground text-lg">
            لا توجد حسابات متاحة حالياً.
          </div>
        )}

        {/* What makes a CR account valuable */}
        <section className="mt-20 space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">ما الذي يميز حساب كلاش رويال المتقدم؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-muted-foreground">
            <div className="bg-card border border-border/80 hover:border-primary/50 transition-colors rounded-xl p-5 md:p-6 shadow-sm">
              <h3 className="font-bold text-lg md:text-xl text-foreground mb-2 flex items-center gap-2">
                <span className="text-primary text-xl">🃏</span> مستوى البطاقات
              </h3>
              <p className="text-sm md:text-base leading-relaxed">أقصى مستوى للبطاقات حالياً هو Level 16 (صدر في نوفمبر 2025). كلما ارتفع مستوى بطاقاتك، زادت قوتها في المعارك، والحساب المحتوي على كروت ماكس 16 يمنحك مرونة مطلقة لبناء التشكيلات الميتا.</p>
            </div>
            <div className="bg-card border border-border/80 hover:border-primary/50 transition-colors rounded-xl p-5 md:p-6 shadow-sm">
              <h3 className="font-bold text-lg md:text-xl text-foreground mb-2 flex items-center gap-2">
                <span className="text-primary text-xl">⚡</span> تطورات البطاقات (Evolutions)
              </h3>
              <p className="text-sm md:text-base leading-relaxed">التطورات هي نسخ محسّنة تمنح البطاقات قدرات استثنائية تقلب مجرى المعركة. يوجد أكثر من 40 تطور حالياً، والحساب المكتمل بإيفو يمنحك ميزة تنافسية حاسمة.</p>
            </div>
            <div className="bg-card border border-border/80 hover:border-primary/50 transition-colors rounded-xl p-5 md:p-6 shadow-sm">
              <h3 className="font-bold text-lg md:text-xl text-foreground mb-2 flex items-center gap-2">
                <span className="text-primary text-xl">👑</span> الأبطال والتشامبيونز
              </h3>
              <p className="text-sm md:text-base leading-relaxed">تضم اللعبة نظام Champions المتقدمين بالإضافة لنظام Heroes الجديد، مما يتيح مهارات خاصة إضافية داخل الساحة تصنع الفارق التكتيكي.</p>
            </div>
            <div className="bg-card border border-border/80 hover:border-primary/50 transition-colors rounded-xl p-5 md:p-6 shadow-sm">
              <h3 className="font-bold text-lg md:text-xl text-foreground mb-2 flex items-center gap-2">
                <span className="text-primary text-xl">🏆</span> التقدم التنافسي والساحات
              </h3>
              <p className="text-sm md:text-base leading-relaxed">مستوى الكؤوس، الترتيب في Ranked Mode (دوري الأساطير/Path of Legends)، والإيموتات النادرة تعكس خبرة الحساب وهيبته أمام الخصوم.</p>
            </div>
          </div>
        </section>

        {/* What to check before buying */}
        <section className="mt-16 bg-card/40 border border-border/70 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">ما الذي تفحصه قبل شراء حساب كلاش رويال؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground">
            <div className="p-4 rounded-xl bg-background/60 border border-border/60">
              <h3 className="font-bold text-foreground mb-1 text-base md:text-lg">عدد البطاقات في Level 16</h3>
              <p className="text-sm md:text-base leading-relaxed">كلما زاد عدد الكروت الماكس، زادت خياراتك لتجربة وتغيير التشكيلات حسب تحديثات التوازن.</p>
            </div>
            <div className="p-4 rounded-xl bg-background/60 border border-border/60">
              <h3 className="font-bold text-foreground mb-1 text-base md:text-lg">التطورات الأساسية المفعّلة</h3>
              <p className="text-sm md:text-base leading-relaxed">التطورات الرئيسية مثل Royal Giant و Hog Rider و Knight والساحر ضرورية جداً لأي تشكيلة منافسة.</p>
            </div>
            <div className="p-4 rounded-xl bg-background/60 border border-border/60">
              <h3 className="font-bold text-foreground mb-1 text-base md:text-lg">الكؤوس وأعلى موسم تم الوصول له</h3>
              <p className="text-sm md:text-base leading-relaxed">يعطيك انطباعاً دقيقاً عن قوة الحساب وأداء أصحابه السابقين في السلم التنافسي.</p>
            </div>
            <div className="p-4 rounded-xl bg-background/60 border border-border/60">
              <h3 className="font-bold text-foreground mb-1 text-base md:text-lg">حالة Supercell ID والبريد الأساسي</h3>
              <p className="text-sm md:text-base leading-relaxed">تأكد دائماً أن الحساب يأتي مع بريد رسمي نظيف مع تسليم فوري وتأمين كامل على جهازك الشخصي.</p>
            </div>
          </div>
        </section>

        {/* Buying & security */}
        <section className="mt-16 space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">الاستلام والأمان والضمان</h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed md:leading-8 max-w-4xl">
            عملية شراء حساب كلاش رويال تتم بنفس آلية التسليم اليدوي المباشر — تتواصل مع إدارة المتجر عبر الواتساب، ويتم نقل بريد Supercell ID وتأمين الحساب على جهازك. نظراً لأن Supercell ID مشترك بين ألعاب Supercell، فإن نقل البريد يضمن ملكيتك الكاملة والمستقرة.
          </p>
          <div className="pt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm md:text-base text-muted-foreground">
            <span>• راجع <Link href="/blog/how-to-change-supercell-id-email-guide" className="text-primary hover:underline">دليل تغيير إيميل Supercell ID</Link></span>
            <span>• اطلع على <Link href="/guarantee" className="text-primary hover:underline">سياسة الضمان وحماية المشتري</Link></span>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">أسئلة شائعة حول شراء حسابات كلاش رويال</h2>
          <div className="space-y-4 max-w-4xl">
            {crFaqItems.map((item, i) => (
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

        {/* CTA */}
        <section className="mt-16 text-center bg-gradient-to-b from-card to-card/60 border border-border/80 rounded-3xl p-8 md:p-12 shadow-lg">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3 text-foreground">جاهز لاختيار حسابك والانطلاق في الساحة؟</h2>
          <p className="text-muted-foreground text-base md:text-lg mb-6 max-w-2xl mx-auto leading-relaxed">
            تصفح الحسابات المعروضة أعلاه، أو تواصل معنا مباشرة عبر الواتساب للاستفسار عن أي حساب أو طلب مواصفات كروت محددة.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || ""}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-base transition-all shadow-md hover:shadow-emerald-600/20"
            >
              تواصل معنا عبر الواتساب
            </a>
            <Link href="/clash-of-clans" className="px-8 py-4 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-xl text-base transition-all border border-primary/30">
              تصفح قريات كلاش أوف كلانس
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
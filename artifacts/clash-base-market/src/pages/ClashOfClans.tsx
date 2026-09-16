import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useListAccounts } from "@workspace/api-client-react";
import { AccountCard } from "@/components/AccountCard";
import { SEO } from "@/components/SEO";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";

const cocFaqItems = [
  {
    question: "كيف أشتري حساب كلاش أوف كلانس من كلاش ماركت؟",
    answer: "اختر القرية المناسبة من القائمة، اضغط على زر الواتساب، ونتواصل معك مباشرة لإتمام نقل ملكية Supercell ID وتغيير البريد الإلكتروني وتأمين الحساب برقمك خلال دقائق.",
  },
  {
    question: "ما الذي يضمنه المتجر عند شراء حساب كلاش؟",
    answer: "وفق سياسة المتجر، جميع الحسابات تخضع لفحص يدوي قبل البيع، ويتم تسليم الإيميل الأساسي مع تغيير كلمة السر وتفعيل حماية الحساب (Account Protection) على رقم المشتري. يشمل الضمان متابعة ما بعد البيع حسب سياسة المتجر.",
  },
  {
    question: "هل تتوفر حسابات بأسعار مختلفة تناسب الميزانيات المتوسطة؟",
    answer: "نعم، تتراوح الحسابات بين تاون هول 14 وحتى تاون 18 بأسعار مختلفة. الحسابات ذات التاون الأدنى أو التطوير الجزئي تكون بأسعار أقل وتناسب من يريد حساباً تنافسياً بدون ميزانية كبيرة.",
  },
  {
    question: "كم يستغرق تسليم الحساب بعد الدفع؟",
    answer: "عادة يتم التسليم خلال دقائق من إتمام الدفع، حيث يتم نقل الإيميل وتأمين الحساب في جلسة واتساب واحدة مباشرة.",
  },
  {
    question: "هل يمكن دفع ثمن الحساب بالتقسيط؟",
    answer: "نعم، يمكن ترتيب الدفع عبر تابي أو تمارا بالتنسيق المباشر مع إدارة المتجر عبر الواتساب. يتم تقسيم المبلغ على 4 دفعات بدون فوائد إضافية.",
  },
  {
    question: "ما الفرق بين حساب ماكس وحساب شبه ماكس؟",
    answer: "الحساب الماكس يكون فيه جميع المباني والقوات والأبطال والمعدات على أعلى مستوى متاح لتاون هوله. الحساب شبه الماكس قد تنقصه بعض التطويرات الأخيرة (مثل بعض معدات الأبطال أو أسوار)، لكنه يظل تنافسياً وبسعر أقل.",
  },
];

const cocFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: cocFaqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export default function ClashOfClans() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const th = searchParams.get("townHall");
      if (th && ["16", "17", "18"].includes(th.trim())) {
        setLocation(`/clash-of-clans/town-hall-${th.trim()}`, { replace: true });
      }
    }
  }, [setLocation]);

  const { data: accounts, isLoading } = useListAccounts({ game: "clash-of-clans" });
  const { data: featuredAccounts, isLoading: loadingFeatured } = useListAccounts({ game: "clash-of-clans", featured: "true" });

  const itemListJsonLd = accounts && accounts.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "حسابات كلاش أوف كلانس للبيع",
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
      { "@type": "ListItem", position: 2, name: "حسابات كلاش أوف كلانس", item: "https://www.clashmarket.online/clash-of-clans" },
    ],
  };

  const jsonLdArray = [breadcrumbJsonLd, itemListJsonLd, cocFaqJsonLd].filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <SEO
        title="حسابات كلاش أوف كلانس للبيع | متجر كلاش ماركت"
        description="اشترِ حسابات وقرى كلاش أوف كلانس (تاون هول 14 إلى 18) بتسليم يدوي مباشر وضمان وفق سياسة المتجر. كلاش ماركت — متجر حسابات كلاش في السعودية والخليج."
        url="https://www.clashmarket.online/clash-of-clans"
        jsonLd={jsonLdArray}
      />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 md:py-16 max-w-6xl">
        {/* Intro Section */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6 text-foreground tracking-tight break-words">حسابات كلاش أوف كلانس للبيع</h1>
        <div className="max-w-4xl mb-12 space-y-4 text-base md:text-lg text-muted-foreground leading-relaxed md:leading-8">
          <p>
            يوفر كلاش ماركت قريات وحسابات كلاش أوف كلانس جاهزة للمنافسة، بمستويات تاون هول تبدأ من 14 وحتى 18. سواء كنت تبحث عن قرية ماكس لدخول حروب القبائل (CWL) مباشرة، أو حساب متقدم بسعر مناسب لميزانيتك — ستجد خيارات متنوعة تناسب مختلف الاحتياجات.
          </p>
          <p>
            جميع الحسابات المعروضة تم فحصها يدوياً قبل طرحها، ويتم التسليم بشكل مباشر عبر الواتساب مع نقل ملكية Supercell ID وتأمين الحساب على جهاز المشتري. المتجر يخدم اللاعبين في السعودية ودول الخليج العربي بالدرجة الأولى.
          </p>
        </div>

        {/* Town Hall Visual Navigation Cards */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">تصفح قريات كلاش حسب مستوى التاون هول</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/clash-of-clans/town-hall-18"
              className="group block rounded-2xl overflow-hidden border border-border/80 hover:border-primary/60 transition-all duration-300 shadow-md hover:shadow-primary/10 hover:-translate-y-1 bg-card/40"
            >
              <img
                src="/banners/th18-banner.png"
                alt="حسابات كلاش أوف كلانس تاون هول 18 للبيع"
                width={1024}
                height={393}
                loading="eager"
                className="w-full h-auto object-cover block aspect-[1024/393] group-hover:scale-105 transition-transform duration-500"
              />
            </Link>
            <Link
              href="/clash-of-clans/town-hall-17"
              className="group block rounded-2xl overflow-hidden border border-border/80 hover:border-primary/60 transition-all duration-300 shadow-md hover:shadow-primary/10 hover:-translate-y-1 bg-card/40"
            >
              <img
                src="/banners/th17-banner.png"
                alt="حسابات كلاش أوف كلانس تاون هول 17 للبيع"
                width={1024}
                height={393}
                loading="eager"
                className="w-full h-auto object-cover block aspect-[1024/393] group-hover:scale-105 transition-transform duration-500"
              />
            </Link>
            <Link
              href="/clash-of-clans/town-hall-16"
              className="group block rounded-2xl overflow-hidden border border-border/80 hover:border-primary/60 transition-all duration-300 shadow-md hover:shadow-primary/10 hover:-translate-y-1 bg-card/40"
            >
              <img
                src="/banners/th16-banner.png"
                alt="حسابات كلاش أوف كلانس تاون هول 16 للبيع"
                width={1024}
                height={393}
                loading="lazy"
                className="w-full h-auto object-cover block aspect-[1024/393] group-hover:scale-105 transition-transform duration-500"
              />
            </Link>
          </div>
        </section>

        {/* Featured Section */}
        {featuredAccounts && featuredAccounts.length > 0 && (
          <section className="mb-12 p-6 rounded-2xl bg-card/50 border border-border/80">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-border/60">
              <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
                <span>⭐ حسابات كلاش أوف كلانس المميزة</span>
              </h2>
              <span className="text-xs md:text-sm text-amber-500 font-semibold">مختارة بعناية ومضمونة</span>
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
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">قريات وحسابات كلاش المتاحة الآن</h2>
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

        {/* What determines account value */}
        <section className="mt-20 space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">ما الذي يحدد قيمة حساب كلاش أوف كلانس؟</h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed md:leading-8 max-w-4xl">
            ليس كل حساب بنفس تاون هول يحمل نفس القيمة. هناك عدة عوامل أساسية تؤثر على سعر وجودة القرية وأدائها في الحروب:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-muted-foreground">
            <div className="bg-card border border-border/80 hover:border-primary/50 transition-colors rounded-xl p-5 md:p-6 shadow-sm">
              <h3 className="font-bold text-lg md:text-xl text-foreground mb-2 flex items-center gap-2">
                <span className="text-primary text-xl">🏰</span> مستوى التاون هول
              </h3>
              <p className="text-sm md:text-base leading-relaxed">أعلى تاون حالياً هو TH18 الذي صدر في نوفمبر 2025. كلما ارتفع المستوى، زادت القدرات الدفاعية والهجومية المتاحة، وارتفعت القيمة التنافسية للقرية.</p>
            </div>
            <div className="bg-card border border-border/80 hover:border-primary/50 transition-colors rounded-xl p-5 md:p-6 shadow-sm">
              <h3 className="font-bold text-lg md:text-xl text-foreground mb-2 flex items-center gap-2">
                <span className="text-primary text-xl">👑</span> مستوى الأبطال الستة
              </h3>
              <p className="text-sm md:text-base leading-relaxed">اللعبة تحتوي حالياً على 6 أبطال: الملك، الملكة، الحكيم الكبير، البطلة الملكية، أمير المينيون، ودوق التنين. مستوياتهم القصوى تصنع الفارق الحاسم في الهجمات الثلاث نجوم.</p>
            </div>
            <div className="bg-card border border-border/80 hover:border-primary/50 transition-colors rounded-xl p-5 md:p-6 shadow-sm">
              <h3 className="font-bold text-lg md:text-xl text-foreground mb-2 flex items-center gap-2">
                <span className="text-primary text-xl">⚔️</span> معدات الأبطال (Hero Equipment)
              </h3>
              <p className="text-sm md:text-base leading-relaxed">نظام المعدات يتيح تخصيص قدرات كل بطل بقطعتين. تتراوح بين معدات عادية (حتى لفل 18) ومعدات ملحمية (حتى لفل 27)، وتمنح القوة الضاربة في الدوري والحروب التنافسية.</p>
            </div>
            <div className="bg-card border border-border/80 hover:border-primary/50 transition-colors rounded-xl p-5 md:p-6 shadow-sm">
              <h3 className="font-bold text-lg md:text-xl text-foreground mb-2 flex items-center gap-2">
                <span className="text-primary text-xl">💎</span> التقدم التنافسي والموارد
              </h3>
              <p className="text-sm md:text-base leading-relaxed">عدد الجواهر، السكنات الحصرية، مستوى عاصمة الكلان، وتصنيف دوري الأساطير — كلها ميزات إضافية تزيد من ثراء وجودة الحساب.</p>
            </div>
          </div>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed pt-2">
            للاطلاع على تفاصيل كل مستوى تاون ومميزاته، يمكنك قراءة <Link href="/blog/clash-of-clans-town-hall-levels-buying-guide" className="text-primary font-medium hover:underline">دليل مستويات التاون هول وأفضل قرية للشراء</Link>.
          </p>
        </section>

        {/* Choosing the right TH */}
        <section className="mt-16 bg-card/40 border border-border/70 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">كيف تختار التاون هول الأنسب لميزانيتك؟</h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed md:leading-8">
            الاختيار يعتمد على هدفك التنافسي وخبرتك في الهجوم والميزانية المحددة:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground">
            <div className="p-4 rounded-xl bg-background/60 border border-border/60">
              <h3 className="font-bold text-foreground mb-1 text-base md:text-lg">TH14 و TH15 — بداية اقتصادية متوازنة</h3>
              <p className="text-sm md:text-base leading-relaxed">خيار رائع للمبتدئين أو العائدين للعبة للدخول في حروب القبائل بتكلفة معقولة جداً.</p>
            </div>
            <div className="p-4 rounded-xl bg-background/60 border border-border/60">
              <h3 className="font-bold text-foreground mb-1 text-base md:text-lg">TH16 و TH17 — أداء تنافسي عالي</h3>
              <p className="text-sm md:text-base leading-relaxed">يناسب اللاعبين الراغبين بالمنافسة في دوريات الأساطير وCWL المتقدم بسعر تنافسي وممتاز.</p>
            </div>
            <div className="p-4 rounded-xl bg-background/60 border border-border/60">
              <h3 className="font-bold text-foreground mb-1 text-base md:text-lg">TH18 ماكس — القمة المطلقة</h3>
              <p className="text-sm md:text-base leading-relaxed">أعلى مستوى في كلاش أوف كلانس حالياً، مناسب للاعب الذي يبحث عن قرية مكتملة لا ينقصها شيء.</p>
            </div>
            <div className="p-4 rounded-xl bg-background/60 border border-border/60">
              <h3 className="font-bold text-foreground mb-1 text-base md:text-lg">هل TH17 ماكس أفضل من TH18 ناقص؟</h3>
              <p className="text-sm md:text-base leading-relaxed">نعم تماماً، فالقرية ذات الدفاعات والأبطال المكتملة تقدم نتائج وثباتاً أعلى في الحروب من تاون متسرع ناقص التطوير.</p>
            </div>
          </div>
        </section>

        {/* Security & buying process */}
        <section className="mt-16 space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">خطوات الفحص والتسليم والأمان</h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed md:leading-8 max-w-4xl">
            نعتمد في كلاش ماركت طريقة التسليم اليدوي المباشر لضمان راحة بالك وانتقال القرية لبريدك بأعلى معايير الأمان:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-card border border-border/80 rounded-xl p-5">
              <div className="w-9 h-9 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center mb-3">1</div>
              <h3 className="font-bold text-foreground text-base md:text-lg mb-2">الاختيار والاتفاق</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">تختار القرية المناسبة من الموقع وتتواصل مع إدارة المتجر عبر الواتساب، ويتم الاتفاق على طريقة الدفع (تحويل بنكي أو تقسيط تابي وتمارا).</p>
            </div>
            <div className="bg-card border border-border/80 rounded-xl p-5">
              <div className="w-9 h-9 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center mb-3">2</div>
              <h3 className="font-bold text-foreground text-base md:text-lg mb-2">نقل وتحديث البريد</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">يتم نقل بريد Supercell ID لبريدك الشخصي المباشر وتغيير كلمات السر لضمان ملكيتك الحصرية والكاملة للقرية.</p>
            </div>
            <div className="bg-card border border-border/80 rounded-xl p-5">
              <div className="w-9 h-9 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center mb-3">3</div>
              <h3 className="font-bold text-foreground text-base md:text-lg mb-2">التأمين والضمان الذهبي</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">تفعيل حماية الحساب (Account Protection) برقم هاتفك وتسليمك أكواد الاسترداد، مع سريان ضمان المتجر الشامل.</p>
            </div>
          </div>
          <div className="pt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm md:text-base text-muted-foreground">
            <span>• راجع <Link href="/blog/how-to-change-supercell-id-email-guide" className="text-primary hover:underline">دليل تغيير إيميل Supercell ID</Link></span>
            <span>• اقرأ <Link href="/blog/clash-of-clans-account-ban-reasons-protection-guide" className="text-primary hover:underline">دليل حماية القرى وتجنب المخالفات</Link></span>
            <span>• اطلع على <Link href="/guarantee" className="text-primary hover:underline">سياسة الضمان وحماية المشتري</Link></span>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">الأسئلة الشائعة حول شراء قريات كلاش أوف كلانس</h2>
          <div className="space-y-4 max-w-4xl">
            {cocFaqItems.map((item, i) => (
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
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3 text-foreground">جاهز لاختيار قريتك والبدء في الحروب؟</h2>
          <p className="text-muted-foreground text-base md:text-lg mb-6 max-w-2xl mx-auto leading-relaxed">
            تصفح القريات المتاحة أعلاه، أو تواصل مباشرة مع فريق كلاش ماركت عبر الواتساب لطلب مواصفات معينة أو استفسار عن أي قرية.
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
            <Link href="/clash-royale" className="px-8 py-4 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-xl text-base transition-all border border-primary/30">
              تصفح حسابات كلاش رويال
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}


import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useListAccounts } from "@workspace/api-client-react";
import { AccountCard } from "@/components/AccountCard";
import { SEO } from "@/components/SEO";
import { Link } from "wouter";

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
  const { data: accounts, isLoading } = useListAccounts({ game: "clash-of-clans" });

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
      <main className="flex-1 container mx-auto px-4 py-16">
        {/* Intro Section */}
        <h1 className="text-4xl font-bold mb-4">حسابات كلاش أوف كلانس للبيع</h1>
        <div className="max-w-3xl mb-10 space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            يوفر كلاش ماركت قريات وحسابات كلاش أوف كلانس جاهزة للمنافسة، بمستويات تاون هول تبدأ من 14 وحتى 18. سواء كنت تبحث عن قرية ماكس لدخول حروب القبائل (CWL) مباشرة، أو حساب متقدم بسعر مناسب لميزانيتك — ستجد خيارات متنوعة تناسب مختلف الاحتياجات.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            جميع الحسابات المعروضة تم فحصها يدوياً قبل طرحها، ويتم التسليم بشكل مباشر عبر الواتساب مع نقل ملكية Supercell ID وتأمين الحساب على جهاز المشتري. المتجر يخدم اللاعبين في السعودية ودول الخليج العربي بالدرجة الأولى.
          </p>
        </div>

        {/* Accounts Grid */}
        <h2 className="text-2xl font-bold mb-6 text-primary/90">قريات وحسابات كلاش المتاحة الآن</h2>
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
        <section className="mt-16 max-w-3xl space-y-6">
          <h2 className="text-2xl font-bold">ما الذي يحدد قيمة حساب كلاش أوف كلانس؟</h2>
          <p className="text-muted-foreground leading-relaxed">
            ليس كل حساب بنفس تاون هول يحمل نفس القيمة. هناك عدة عوامل تؤثر على سعر وجودة القرية:
          </p>
          <div className="space-y-4 text-muted-foreground">
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-1">مستوى التاون هول</h3>
              <p className="text-sm leading-relaxed">أعلى تاون حالياً هو TH18 الذي صدر في نوفمبر 2025. كلما ارتفع المستوى، زادت القدرات الدفاعية والهجومية المتاحة، لكن أيضاً يرتفع السعر.</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-1">مستوى الأبطال</h3>
              <p className="text-sm leading-relaxed">اللعبة تحتوي حالياً على 6 أبطال: الملك، الملكة، الحكيم الكبير، البطلة الملكية، أمير المينيون، ودوق التنين. مستوى الأبطال هو أحد أهم العوامل في حسم المعارك الثلاث نجوم.</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-1">معدات الأبطال (Hero Equipment)</h3>
              <p className="text-sm leading-relaxed">نظام المعدات يتيح تخصيص قدرات كل بطل بتركيب قطعتين من المعدات. تتراوح بين معدات عادية (حتى لفل 18) ومعدات ملحمية (حتى لفل 27)، وتؤثر بشكل كبير على الأداء التنافسي.</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-1">التقدم التنافسي والموارد</h3>
              <p className="text-sm leading-relaxed">عدد الجواهر، السكنات، التقدم في دوري الأساطير، ومستوى عاصمة الكلان — كلها عوامل إضافية ترفع من جاذبية الحساب.</p>
            </div>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            للاطلاع على تفاصيل كل مستوى تاون ومميزاته، يمكنك قراءة <Link href="/blog/clash-of-clans-town-hall-levels-buying-guide" className="text-primary hover:underline">دليل مستويات التاون هول وأفضل قرية للشراء</Link>.
          </p>
        </section>

        {/* Choosing the right TH */}
        <section className="mt-12 max-w-3xl space-y-4">
          <h2 className="text-2xl font-bold">كيف تختار التاون هول المناسب؟</h2>
          <p className="text-muted-foreground leading-relaxed">
            الاختيار يعتمد على هدفك من اللعبة وميزانيتك. إليك بعض النقاط العملية:
          </p>
          <ul className="space-y-3 text-muted-foreground text-sm">
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span><strong>TH14 أو TH15</strong> — خيار اقتصادي جيد للمبتدئين الراغبين في دخول حروب القبائل بتكلفة معقولة. القرية قادرة على المنافسة في الدوريات المتوسطة.</span></li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span><strong>TH16 أو TH17</strong> — يناسب اللاعب الذي يريد الوصول للمراحل المتقدمة من CWL ودوري الأساطير. غالباً ما يكون بسعر أقل من TH18 مع قدرات تنافسية عالية.</span></li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span><strong>TH18 ماكس</strong> — الخيار الأعلى حالياً. مناسب للاعب المحترف الذي يريد قرية مكتملة فوراً.</span></li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span><strong>TH17 ماكس أفضل من TH18 ناقص؟</strong> — في كثير من الحالات، نعم. قرية TH17 مكتملة التطوير أقوى فعلياً في المنافسة من TH18 بأبطال ومباني غير مكتملة، لأن التوازن بين الدفاع والهجوم أهم من رقم التاون.</span></li>
          </ul>
        </section>

        {/* Security & buying process */}
        <section className="mt-12 max-w-3xl space-y-4">
          <h2 className="text-2xl font-bold">الفحص والتسليم وإجراءات الأمان</h2>
          <p className="text-muted-foreground leading-relaxed">
            عند شراء حساب من كلاش ماركت، تتم العملية على عدة خطوات لضمان سلامة الانتقال:
          </p>
          <ol className="space-y-2 text-muted-foreground text-sm list-decimal list-inside">
            <li>تختار القرية المناسبة وتتواصل مع إدارة المتجر عبر الواتساب.</li>
            <li>يتم الاتفاق على طريقة الدفع (تحويل بنكي مباشر، أو ترتيب التقسيط عبر تابي/تمارا).</li>
            <li>بعد إتمام الدفع، يتم نقل بريد Supercell ID إلى بريدك الشخصي.</li>
            <li>يتم تغيير كلمة سر البريد وتفعيل حماية الحساب (Account Protection) برقم هاتفك.</li>
            <li>تتسلم رموز الاسترداد (Recovery Codes) لضمان استمرار وصولك للحساب.</li>
          </ol>
          <p className="text-muted-foreground text-sm leading-relaxed">
            لمزيد من التفاصيل حول نقل الإيميل وتأمين Supercell ID، راجع <Link href="/blog/how-to-change-supercell-id-email-guide" className="text-primary hover:underline">دليل تغيير إيميل Supercell ID وتأمين الحساب</Link>. ولمعرفة كيف تحافظ على استقرار القرية بعد الاستلام، اقرأ <Link href="/blog/clash-of-clans-account-ban-reasons-protection-guide" className="text-primary hover:underline">دليل حماية القرية وتجنب المخالفات</Link>.
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            يمكنك أيضاً الاطلاع على <Link href="/guarantee" className="text-primary hover:underline">سياسة الضمان وحماية المشتري</Link> أو <Link href="/how-it-works" className="text-primary hover:underline">تفاصيل طريقة الشراء والتسليم</Link>.
          </p>
        </section>

        {/* FAQ Section */}
        <section className="mt-16 max-w-3xl">
          <h2 className="text-2xl font-bold mb-6">أسئلة شائعة حول شراء حسابات كلاش أوف كلانس</h2>
          <div className="space-y-4">
            {cocFaqItems.map((item, i) => (
              <details
                key={i}
                className="group border border-border rounded-lg bg-card/50 backdrop-blur-sm"
              >
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
        </section>

        {/* CTA */}
        <section className="mt-12 max-w-3xl text-center bg-card border border-border rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-3">جاهز لاختيار قريتك؟</h2>
          <p className="text-muted-foreground text-sm mb-4">تصفح الحسابات المتاحة أعلاه، أو تواصل مع إدارة المتجر عبر الواتساب للاستفسار عن حساب محدد أو طلب مواصفات معينة.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || ""}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-colors"
            >
              تواصل عبر الواتساب
            </a>
            <Link href="/clash-royale" className="px-6 py-3 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-xl text-sm transition-colors border border-primary/20">
              أو تصفح حسابات كلاش رويال
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}


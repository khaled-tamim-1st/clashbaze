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
      <main className="flex-1 container mx-auto px-4 py-16">
        {/* Intro */}
        <h1 className="text-4xl font-bold mb-4">حسابات كلاش رويال للبيع</h1>
        <div className="max-w-3xl mb-10 space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            يوفر كلاش ماركت حسابات كلاش رويال جاهزة للمنافسة في السلم التنافسي وRanked Mode. سواء كنت تبحث عن حساب بكروت Level 16 وتطورات مكتملة، أو حساب متقدم بسعر مناسب — ستجد خيارات متنوعة تلبي أهدافك في اللعبة.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            كلاش رويال لعبة مختلفة تماماً عن كلاش أوف كلانس — التقدم فيها يعتمد على مستوى البطاقات والتطورات والأبطال وليس على مباني القرية. لذلك قيمة الحساب تُقاس بمعايير خاصة نوضحها أدناه.
          </p>
        </div>

        {/* Accounts Grid */}
        <h2 className="text-2xl font-bold mb-6 text-primary/90">حسابات كلاش رويال المتاحة الآن</h2>
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
        <section className="mt-16 max-w-3xl space-y-6">
          <h2 className="text-2xl font-bold">ما الذي يميز حساب كلاش رويال المتقدم؟</h2>
          <div className="space-y-4 text-muted-foreground">
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-1">مستوى البطاقات</h3>
              <p className="text-sm leading-relaxed">أقصى مستوى للبطاقات حالياً هو Level 16 (صدر في نوفمبر 2025). كلما ارتفع مستوى بطاقاتك، زادت قوتها في المعارك. الحساب الذي يحتوي على عدد كبير من البطاقات في المستوى الأعلى يعطيك مرونة أكبر في بناء تشكيلات متنوعة.</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-1">تطورات البطاقات (Evolutions)</h3>
              <p className="text-sm leading-relaxed">التطورات هي نسخ محسّنة من البطاقات الأساسية تضيف قدرات جديدة بعد نشر البطاقة عدة مرات. يوجد أكثر من 40 تطور حالياً. الحسابات التي تحتوي على تطورات مكتملة تمنحك ميزة تنافسية واضحة.</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-1">الأبطال والتشامبيونز</h3>
              <p className="text-sm leading-relaxed">كلاش رويال يحتوي على نظام Champions (مثل Archer Queen وGolden Knight وSkeleton King) بالإضافة إلى نظام Heroes الأحدث. كل تشكيلة يمكنها استخدام خانة بطل وخانة تطور وخانة حرة.</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-1">التقدم التنافسي</h3>
              <p className="text-sm leading-relaxed">مستوى الكؤوس، الأداء في Ranked Mode (المعروف سابقاً بـPath of Legends)، ومستوى King Tower — كلها تعكس قوة الحساب وتاريخه التنافسي.</p>
            </div>
          </div>
        </section>

        {/* What to check before buying */}
        <section className="mt-12 max-w-3xl space-y-4">
          <h2 className="text-2xl font-bold">ما الذي تفحصه قبل شراء حساب رويال؟</h2>
          <ul className="space-y-3 text-muted-foreground text-sm">
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span><strong>عدد البطاقات في Level 16</strong> — كلما زاد العدد، زادت خياراتك في بناء تشكيلات تنافسية.</span></li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span><strong>التطورات المفعّلة</strong> — التطورات الأساسية مثل Royal Giant وHog Rider وKnight تعتبر ضرورية للمنافسة.</span></li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span><strong>الكؤوس وأعلى موسم</strong> — يعطيك فكرة عن المستوى الحقيقي الذي وصله الحساب.</span></li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span><strong>حالة Supercell ID</strong> — تأكد أن الحساب يأتي مع البريد الأساسي وإمكانية نقل الملكية بشكل كامل.</span></li>
          </ul>
        </section>

        {/* Buying & security */}
        <section className="mt-12 max-w-3xl space-y-4">
          <h2 className="text-2xl font-bold">الاستلام والأمان</h2>
          <p className="text-muted-foreground leading-relaxed">
            عملية شراء حساب كلاش رويال تتم بنفس آلية التسليم اليدوي المباشر — تتواصل مع إدارة المتجر عبر الواتساب، ويتم نقل بريد Supercell ID وتأمين الحساب على جهازك. نظراً لأن Supercell ID مشترك بين جميع ألعاب Supercell، فإن نقل البريد يشمل أي ألعاب أخرى مربوطة بنفس الحساب.
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            للاطلاع على خطوات نقل الإيميل وتفعيل حماية الحساب، راجع <Link href="/blog/how-to-change-supercell-id-email-guide" className="text-primary hover:underline">دليل تغيير إيميل Supercell ID</Link>. ولتفاصيل سياسة المتجر، اطلع على <Link href="/guarantee" className="text-primary hover:underline">سياسة الضمان وحماية المشتري</Link>.
          </p>
        </section>

        {/* FAQ Section */}
        <section className="mt-16 max-w-3xl">
          <h2 className="text-2xl font-bold mb-6">أسئلة شائعة حول شراء حسابات كلاش رويال</h2>
          <div className="space-y-4">
            {crFaqItems.map((item, i) => (
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
          <h2 className="text-xl font-bold mb-3">جاهز لاختيار حسابك؟</h2>
          <p className="text-muted-foreground text-sm mb-4">تصفح الحسابات المعروضة أعلاه، أو تواصل معنا عبر الواتساب للاستفسار عن حساب بمواصفات محددة.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || ""}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-colors"
            >
              تواصل عبر الواتساب
            </a>
            <Link href="/clash-of-clans" className="px-6 py-3 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-xl text-sm transition-colors border border-primary/20">
              أو تصفح قريات كلاش أوف كلانس
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
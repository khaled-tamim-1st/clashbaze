import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useListAccounts } from "@workspace/api-client-react";
import { AccountCard } from "@/components/AccountCard";
import { SEO } from "@/components/SEO";

const cocFaqItems = [
  {
    question: "كيف أشتري حساب كلاش أوف كلانس من كلاش ماركت؟",
    answer: "اختر القرية المناسبة من القائمة، اضغط على زر الواتساب، ويتواصل معك الوسيط المعتمد لإتمام نقل ملكية Supercell ID وتغيير البريد الإلكتروني خلال 5 إلى 15 دقيقة بأمان تام.",
  },
  {
    question: "هل حسابات كلاش أوف كلانس مضمونة ضد السحب؟",
    answer: "نعم، جميع الحسابات مفحوصة ومربوطة بسوبر سيل آيدي جديد باسمك مع ضمان كامل ضد الاسترجاع ووساطة رسمية تحمي حقوق المشتري.",
  },
  {
    question: "هل يوجد حسابات كلاش رخيصة؟",
    answer: "نعم، نوفر قريات وحسابات بمختلف الأسعار تبدأ من تاون 12 وحتى تاون 18 فل ماكس لتناسب جميع الميزانيات مع تسليم فوري عبر الواتساب.",
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
    name: "حسابات كلاش أوف كلانس للبيع في السعودية والخليج",
    itemListElement: accounts.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://www.clashmarket.online/account/${a.slug}`,
      name: a.title,
    })),
  } : undefined;

  const jsonLdArray = [itemListJsonLd, cocFaqJsonLd].filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <SEO
        title="متجر كلاش اوف كلانس | حسابات كلاش للبيع (تاون ماكس)"
        description="أفضل متجر كلاش اوف كلانس لشراء حسابات كلاش اوف كلانس وقريات تاون 16 و17 و18 ماكس بأسعار رخيصة وتسليم فوري وضمان كامل مع متجر كلاش ماركت."
        url="https://www.clashmarket.online/clash-of-clans"
        jsonLd={jsonLdArray}
      />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-4">متجر كلاش اوف كلانس — حسابات كلاش اوف كلانس للبيع</h1>
        <p className="text-muted-foreground mb-8 max-w-3xl leading-relaxed">
          أفضل متجر كلاش اوف كلانس لشراء وبيع حسابات كلاش اوف كلانس والقرى المضمونة في السعودية ودول الخليج العربي. قريات تاون هول ماكس مع تسليم فوري وضمان شامل.
        </p>

        <h2 className="text-2xl font-bold mb-6 text-primary/90">حسابات كلاش اوف كلانس وقريات تاون ماكس للبيع</h2>
        
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

        {/* FAQ Section */}
        <section className="mt-16 max-w-3xl">
          <h2 className="text-2xl font-bold mb-6">الأسئلة الشائعة حول شراء حسابات كلاش أوف كلانس</h2>
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
      </main>
      <Footer />
    </div>
  );
}

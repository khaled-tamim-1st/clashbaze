import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useListAccounts } from "@workspace/api-client-react";
import { AccountCard } from "@/components/AccountCard";
import { SEO } from "@/components/SEO";

const crFaqItems = [
  {
    question: "كيف أشتري حساب كلاش رويال من كلاش ماركت؟",
    answer: "اختر الحساب المناسب، تواصل عبر الواتساب، ويتم نقل الملكية وتغيير البريد الإلكتروني خلال دقائق بأمان تام.",
  },
  {
    question: "هل حسابات كلاش رويال فيها تطورات بطاقات (Evolutions)؟",
    answer: "نعم، نوفر حسابات بتطورات بطاقات كاملة وكروت ماكس ليفل 15 وساحات عالية مع ضمان كامل.",
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
    name: "حسابات كلاش رويال للبيع في السعودية والخليج",
    itemListElement: accounts.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://www.clashmarket.online/account/${a.slug}`,
      name: a.title,
    })),
  } : undefined;

  const jsonLdArray = [itemListJsonLd, crFaqJsonLd].filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <SEO
        title="حسابات كلاش رويال للبيع - كروت ماكس وإيفو | كلاش ماركت"
        description="حسابات كلاش رويال للبيع في السعودية والخليج. كروت ماكس ليفل 15 وتطورات إيفو بأسعار رخيصة وتسليم فوري وضمان كامل مع كلاش ماركت."
        url="https://www.clashmarket.online/clash-royale"
        jsonLd={jsonLdArray}
      />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-4">حسابات كلاش رويال للبيع — كروت ماكس وساحة الأساطير</h1>
        <p className="text-muted-foreground mb-8 max-w-3xl leading-relaxed">
          تشكيلات وحسابات كلاش رويال قوية جاهزة لدوري الأبطال مع كروت ليفل 14 و15 ماكس وتطويرات حديثة في السعودية والخليج العربي.
        </p>

        <h2 className="text-2xl font-bold mb-6 text-primary/90">حسابات كلاش رويال كروت ماكس وساحة الأساطير</h2>
        
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
          <h2 className="text-2xl font-bold mb-6">الأسئلة الشائعة حول شراء حسابات كلاش رويال</h2>
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
      </main>
      <Footer />
    </div>
  );
}
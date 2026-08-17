import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useListAccounts } from "@workspace/api-client-react";
import { AccountCard } from "@/components/AccountCard";
import { SEO } from "@/components/SEO";

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

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <SEO
        title="حسابات كلاش رويال للبيع في السعودية والخليج (كروت ماكس)"
        description="تسوق أحدث حسابات كلاش رويال (Clash Royale) مع كروت ماكس وأرينا عالية وأسعار تنافسية عبر كلاش ماركت. تطورات بطاقات، إيموتات نادرة، وضمان كامل."
        url="https://www.clashmarket.online/clash-royale"
        jsonLd={itemListJsonLd}
      />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-4">حسابات كلاش رويال للبيع</h1>
        <p className="text-muted-foreground mb-8 max-w-3xl leading-relaxed">
          تشكيلات وحسابات كلاش رويال قوية جاهزة لدوري الأبطال مع كروت ليفل 14 و15 ماكس وتطويرات حديثة في السعودية والخليج العربي.
        </p>
        
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
      </main>
      <Footer />
    </div>
  );
}
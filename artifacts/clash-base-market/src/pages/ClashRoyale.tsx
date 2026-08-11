import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useListAccounts } from "@workspace/api-client-react";
import { AccountCard } from "@/components/AccountCard";
import { SEO } from "@/components/SEO";

export default function ClashRoyale() {
  const { data: accounts, isLoading } = useListAccounts({ game: "clash-royale" });

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <SEO
        title="حسابات كلاش رويال للبيع - أفضل الحسابات"
        description="تسوق أحدث حسابات كلاش رويال (Clash Royale) مع كروت ماكس وأرينا عالية وأسعار تنافسية عبر كلاش ماركت."
        url="https://www.clashmarket.online/clash-royale"
      />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">حسابات كلاش رويال</h1>
        
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
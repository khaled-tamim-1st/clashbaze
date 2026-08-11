import { useRoute } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useGetAccount, useGetRelatedAccounts } from "@workspace/api-client-react";
import { AccountGallery } from "@/components/AccountGallery";
import { AccountCard } from "@/components/AccountCard";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";

export default function AccountDetail() {
  const [, params] = useRoute("/account/:slug");
  const slug = params?.slug || "";
  
  const { data: account, isLoading } = useGetAccount(slug);
  const { data: relatedAccounts, isLoading: loadingRelated } = useGetRelatedAccounts(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-16 text-center text-xl text-muted-foreground">
          لم يتم العثور على الحساب
        </main>
        <Footer />
      </div>
    );
  }

  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "";
  const message = `أريد شراء حساب ${account.whatsappMessage || account.title}`;
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  const gameLabel = account.game === "clash-of-clans" ? "كلاش أوف كلانس" : "كلاش رويال";
  const seoDescription = account.description
    ? account.description.slice(0, 160)
    : `${account.title} - ${gameLabel}، السعر ${account.price.toLocaleString("ar-SA")} ر.س. تفاصيل الحساب وشراء آمن عبر الواتساب من كلاش ماركت.`;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <SEO
        title={`حساب ${account.title}`}
        description={seoDescription}
        url={`https://www.clashmarket.online/account/${account.slug}`}
        image={account.images?.[0] || undefined}
      />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div>
            <AccountGallery images={account.images} />
          </div>
          <div>
            <div className="mb-4">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold text-white ${account.game === 'clash-of-clans' ? 'bg-blue-600' : 'bg-red-600'}`}>
                {account.game === "clash-of-clans" ? "كلاش أوف كلانس" : "كلاش رويال"}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{account.title}</h1>
            
            <div className="flex items-center gap-4 mb-8">
              <span className="text-3xl font-extrabold text-primary">{account.price.toLocaleString("ar-SA")} ر.س</span>
              {account.oldPrice && (
                <span className="text-xl text-muted-foreground line-through">{account.oldPrice.toLocaleString("ar-SA")} ر.س</span>
              )}
            </div>

            <div className="bg-card border border-border rounded-xl p-6 mb-8">
              <h3 className="text-xl font-bold mb-4 border-b border-border pb-2">تفاصيل الحساب</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                {account.townHall && (
                  <div>
                    <span className="text-muted-foreground block text-sm">مستوى القرية (TH)</span>
                    <span className="font-bold text-lg">{account.townHall}</span>
                  </div>
                )}
                {account.arena && (
                  <div>
                    <span className="text-muted-foreground block text-sm">الساحة</span>
                    <span className="font-bold text-lg">{account.arena}</span>
                  </div>
                )}
                {account.league && (
                  <div>
                    <span className="text-muted-foreground block text-sm">مستوى الحساب</span>
                    <span className="font-bold text-lg">{account.league}</span>
                  </div>
                )}
                {account.trophies && (
                  <div>
                    <span className="text-muted-foreground block text-sm">الكؤوس</span>
                    <span className="font-bold text-lg">{account.trophies}</span>
                  </div>
                )}
                {account.heroes && (
                  <div>
                    <span className="text-muted-foreground block text-sm">الأبطال</span>
                    <span className="font-bold text-lg">{account.heroes}</span>
                  </div>
                )}
                {account.gems && (
                  <div>
                    <span className="text-muted-foreground block text-sm">الجواهر</span>
                    <span className="font-bold text-lg">{account.gems}</span>
                  </div>
                )}
                {account.skins && (
                  <div>
                    <span className="text-muted-foreground block text-sm">السكنات</span>
                    <span className="font-bold text-lg">{account.skins}</span>
                  </div>
                )}
              </div>
              
              {account.description && (
                <div className="mt-6 pt-4 border-t border-border">
                  <span className="text-muted-foreground block text-sm mb-2">الوصف</span>
                  <p className="leading-relaxed whitespace-pre-wrap">{account.description}</p>
                </div>
              )}
            </div>

            <Button asChild size="lg" className="w-full text-lg h-14 bg-primary text-primary-foreground hover:bg-primary/90">
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">شراء الآن عبر الواتساب</a>
            </Button>
          </div>
        </div>

        {relatedAccounts && relatedAccounts.length > 0 && (
          <section className="pt-16 border-t border-border">
            <h2 className="text-2xl font-bold mb-8">حسابات مشابهة</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedAccounts.map(related => (
                <AccountCard key={related.id} account={related} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
import { useRoute, Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useGetAccount, useGetRelatedAccounts } from "@workspace/api-client-react";
import { AccountGallery } from "@/components/AccountGallery";
import { AccountCard } from "@/components/AccountCard";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";

import { useCurrency } from "@/contexts/CurrencyContext";

export default function AccountDetail() {
  const [, params] = useRoute("/account/:slug");
  const slug = params?.slug || "";
  
  const { data: account, isLoading } = useGetAccount(slug);
  const { data: relatedAccounts, isLoading: loadingRelated } = useGetRelatedAccounts(slug);
  const { formatPrice } = useCurrency();

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
  const priceFormatted = formatPrice(account.price);
  const message = `أريد شراء حساب ${account.whatsappMessage || account.title} (${priceFormatted})`;
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  const gameLabel = account.game === "clash-of-clans" ? "كلاش أوف كلانس" : "كلاش رويال";
  const isCoc = account.game === "clash-of-clans";
  const seoDescription = isCoc
    ? (account.description
        ? `شراء قرية كلاش ${account.title} بسعر ${account.price.toLocaleString("ar-SA")} ر.س من متجر كلاش. ${account.description.slice(0, 70)} - تسليم فوري وضمان شامل.`
        : `شراء قرية كلاش ${account.title} بسعر ${account.price.toLocaleString("ar-SA")} ر.س من متجر كلاش في السعودية والخليج مع تسليم فوري وضمان شامل.`)
    : (account.description
        ? `شراء حساب كلاش رويال ${account.title} بسعر ${account.price.toLocaleString("ar-SA")} ر.س من متجر كلاش. ${account.description.slice(0, 70)} - تسليم فوري وضمان شامل.`
        : `شراء حساب كلاش رويال ${account.title} بسعر ${account.price.toLocaleString("ar-SA")} ر.س من متجر كلاش في السعودية والخليج مع تسليم فوري وضمان شامل.`);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: account.title,
    description: seoDescription,
    image: account.images && account.images.length > 0 ? account.images : ["https://www.clashmarket.online/thumbnail.png"],
    brand: {
      "@type": "Brand",
      name: "Supercell",
    },
    category: gameLabel,
    offers: {
      "@type": "Offer",
      price: account.price,
      priceCurrency: "SAR",
      priceValidUntil: "2026-12-31",
      itemCondition: "https://schema.org/UsedCondition",
      availability:
        account.status === "available"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `https://www.clashmarket.online/account/${account.slug}`,
      seller: {
        "@type": "Organization",
        name: "كلاش ماركت",
        url: "https://www.clashmarket.online",
      },
    },
  };

  const breadcrumbItems = [
    { name: "كلاش ماركت", path: "/" },
    { name: gameLabel, path: isCoc ? "/clash-of-clans" : "/clash-royale" },
  ];

  if (isCoc && account.townHall && ["16", "17", "18"].includes(String(account.townHall).trim())) {
    breadcrumbItems.push({
      name: `تاون هول ${account.townHall}`,
      path: `/clash-of-clans/town-hall-${account.townHall}`,
    });
  }

  breadcrumbItems.push({ name: account.title, path: `/account/${account.slug}` });

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

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <SEO
        title={isCoc
          ? (account.townHall ? `قرية كلاش ${account.title} - تاون ${account.townHall} | متجر كلاش` : `قرية كلاش ${account.title} | متجر كلاش`)
          : `حساب كلاش رويال ${account.title} | متجر كلاش`}
        description={seoDescription}
        url={`https://www.clashmarket.online/account/${account.slug}`}
        image={account.images?.[0] || undefined}
        jsonLd={[productJsonLd, breadcrumbJsonLd]}
      />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
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
            
            <div className="flex items-center gap-4 mb-4">
              <span className="text-3xl font-extrabold text-primary">{formatPrice(account.price)}</span>
              {account.oldPrice && (
                <span className="text-xl text-muted-foreground line-through">{formatPrice(account.oldPrice)}</span>
              )}
            </div>

            <div className="p-3 mb-8 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-2 text-sm text-amber-300 font-medium">
              <span>🛡️</span>
              <span>فحص يدوي للحساب + تسليم الإيميل الأساسي + ضمان كامل ضد السحب</span>
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

            <div className="mt-3 text-center">
              <Link href="/guarantee" className="text-xs text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1">
                <span>🛡️ مشمول بالضمان الذهبي وحماية المشتري</span>
                <span className="underline font-semibold">تعرف على التفاصيل</span>
              </Link>
            </div>
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
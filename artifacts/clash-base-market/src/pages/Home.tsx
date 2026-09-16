import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useGetFeaturedAccounts, useListAccounts, useListBlogPosts } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Testimonials } from "@/components/Testimonials";
import { SEO } from "../components/SEO";

export default function Home() {
  // 1. استدعاء الـ Hooks داخل نطاق الدالة مع عزل البيانات بدقة
  const { data: cocFeatured, isLoading: loadingCocFeatured } = useGetFeaturedAccounts({ game: "clash-of-clans" });
  const { data: crFeatured, isLoading: loadingCrFeatured } = useGetFeaturedAccounts({ game: "clash-royale" });
  const { data: latestAccounts, isLoading: loadingLatest } = useListAccounts({ limit: 6 });
  const { data: blogPosts, isLoading: loadingBlogs } = useListBlogPosts({ limit: 3 });

  const allFeatured = [...(cocFeatured || []), ...(crFeatured || [])];
  const homeJsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "كلاش ماركت",
      alternateName: ["Clash Market", "متجر كلاش", "clashmarket.online"],
      url: "https://www.clashmarket.online/",
      inLanguage: "ar-SA",
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "كلاش ماركت",
      url: "https://www.clashmarket.online/",
      logo: "https://www.clashmarket.online/thumbnail.png",
      description: "متجر كلاش ماركت الأول لبيع وشراء حسابات كلاش اوف كلانس وحسابات كلاش رويال في السعودية والخليج. متجر كلاش موثوق بتسليم فوري وضمان شامل.",
      areaServed: [
        { "@type": "Country", name: "Saudi Arabia" },
        { "@type": "Country", name: "United Arab Emirates" },
        { "@type": "Country", name: "Kuwait" },
        { "@type": "Country", name: "Qatar" },
        { "@type": "Country", name: "Bahrain" },
        { "@type": "Country", name: "Oman" },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "أحدث حسابات كلاش للبيع في السعودية والخليج",
      itemListElement: allFeatured.map((a, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `https://www.clashmarket.online/account/${a.slug}`,
        name: a.title,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "كيف تتم عملية شراء ونقل حساب كلاش أوف كلانس أو كلاش رويال؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "بعد اختيار الحساب المناسب، تضغط على زر شراء عبر الواتساب، نتواصل معك مباشرة من إدارة المتجر ويتم نقل ملكية السوبر سيل آيدي (Supercell ID) وتغيير البريد الإلكتروني وتفعيل الحماية بخطوتين برقمك فوراً وبأمان 100%."
          }
        },
        {
          "@type": "Question",
          name: "ما هي طرق الدفع المتاحة في السعودية ودول الخليج؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "نقبل التحويل البنكي المباشر للحسابات السعودية والخليجية، بالإضافة إلى إمكانية الدفع والتقسيط عبر تابي (Tabby) وتمارا (Tamara)؛ حيث يتم الاتفاق على الطريقة المناسبة والتسليم يدوياً ومباشرة عبر الواتساب بكل سهولة وأمان."
          }
        },
        {
          "@type": "Question",
          name: "هل الحسابات المعروضة في كلاش ماركت مضمونة؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "نعم، جميع الحسابات مملوكة ومفحوصة يدوياً ومشمولة بوثيقة الضمان الذهبي ضد السحب أو الاسترجاع مدى الحياة، مع تسليم الإيميل الأساسي النظيف."
          }
        },
        {
          "@type": "Question",
          name: "كم يستغرق تسليم الحساب بعد إتمام الدفع؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "التسليم يدوي وفوري عبر الواتساب فور إتمام الاتفاق، حيث يستغرق عادةً من 5 إلى 15 دقيقة لإتمام نقل البريد وتأمين الحساب على جهازك خطوة بخطوة."
          }
        },
        {
          "@type": "Question",
          name: "هل يمكنني بيع حسابي لمتجر كلاش ماركت؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "نعم، نحن نشتري الحسابات القوية والمميزة كاش ومباشرة! يمكنك التواصل معنا عبر الواتساب لعرض مواصفات حسابك وسنقوم بفحصه وتقييمه وشرائه منك بأفضل سعر مع تحويل مالي سريع."
          }
        }
      ]
    }
  ];

  return (
    <>
      {/* 2. إعدادات SEO الخاصة بالصفحة الرئيسية */}
      <SEO 
        title="متجر كلاش | حسابات كلاش اوف كلانس وكلاش رويال للبيع"
        description="متجر كلاش ماركت الأول لبيع وشراء حسابات كلاش اوف كلانس وحسابات كلاش رويال في السعودية والخليج. متجر كلاش موثوق بتسليم فوري وضمان شامل."
        url="https://www.clashmarket.online/"
        image="https://www.clashmarket.online/thumbnail.png"
        jsonLd={homeJsonLd}
      />

      <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
        <Navbar />
        <main className="flex-1">
          {/* Main Hero Header */}
          <section className="container mx-auto px-4 py-8 md:py-10 text-center md:text-start">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 text-foreground tracking-tight break-words">
              متجر كلاش | بيع وشراء حسابات كلاش اوف كلانس وكلاش رويال
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl leading-relaxed">
              متجر كلاش ماركت الأول لبيع وشراء حسابات كلاش اوف كلانس وحسابات كلاش رويال في السعودية والخليج. متجر كلاش موثوق بتسليم فوري وضمان شامل.
            </p>
          </section>

          {/* Promo Banners */}
          <section className="w-full border-b border-border">
            <img
              src="/banners/payment-banner-methods.jpg"
              alt="طرق دفع متنوعة تناسب احتياجك - Google Pay وتابي وباي بال وآبل باي وفيزا وتمارا وتحويل بنكي وماستركارد"
              className="w-full h-auto object-cover block"
              loading="lazy"
            />
            <img
              src="/banners/payment-banner-tabby.jpg"
              alt="قسط قريتك مع كلاش ماركت - تابي وتمارا"
              className="w-full h-auto object-cover block"
              loading="eager"
            />
          </section>

          <section className="w-full border-b border-border">
            <Link href="/clash-of-clans">
              <img
                src="/banners/4.jpg"
                alt="أفضل حسابات كلاش أوف كلانس بالسعودية"
                className="w-full h-auto object-cover block"
                loading="eager"
              />
            </Link>
            
            <Link href="/clash-royale">
              <img
                src="/banners/5.jpg"
                alt="أفضل حسابات كلاش رويال بالسعودية"
                className="w-full h-auto object-cover block"
                loading="eager"
              />
            </Link>
          </section>

          <section className="w-full border-b border-border">
            <img
              src="/banners/6.png"
              alt="عروض كلاش ماركت الحصرية"
              className="w-full h-auto object-cover block"
              loading="lazy"
            />
            <img
              src="/banners/7.png"
              alt="ضمان وآمان الحسابات مع كلاش ماركت"
              className="w-full h-auto object-cover block"
              loading="lazy"
            />
          </section>

          {/* Why Choose Us */}
          <section className="container mx-auto px-4 py-12">
            <div className="bg-card/40 border border-border/80 rounded-2xl p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">
                لماذا تختار كلاش ماركت في السعودية ودول الخليج؟
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-muted-foreground">
                <div className="flex gap-3 items-start bg-background/40 p-4 rounded-xl border border-border/60">
                  <span className="text-2xl">🛡️</span>
                  <div>
                    <h3 className="font-bold text-foreground mb-1 text-base">أمان وضمان ذهبي</h3>
                    <p className="text-sm leading-relaxed">فحص يدوي لكل حساب والتأكد من ربط السوبر سيل آيدي وتغيير الإيميل الأساسي بسلاسة وضمان عدم الاسترجاع.</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start bg-background/40 p-4 rounded-xl border border-border/60">
                  <span className="text-2xl">💳</span>
                  <div>
                    <h3 className="font-bold text-foreground mb-1 text-base">طرق دفع متعددة</h3>
                    <p className="text-sm leading-relaxed">تحويل بنكي مباشر لحسابات سعودية وخليجية، مع إمكانية الدفع والتقسيط عبر تابي وتمارا بالاتفاق المباشر.</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start bg-background/40 p-4 rounded-xl border border-border/60">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <h3 className="font-bold text-foreground mb-1 text-base">تسليم يدوي مباشر</h3>
                    <p className="text-sm leading-relaxed">إتمام المعاملات خطوة بخطوة والتواصل المباشر عبر الواتساب مع إدارة المتجر خلال دقائق.</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start bg-background/40 p-4 rounded-xl border border-border/60">
                  <span className="text-2xl">💰</span>
                  <div>
                    <h3 className="font-bold text-foreground mb-1 text-base">أسعار تنافسية</h3>
                    <p className="text-sm leading-relaxed">تقييم عادل للقرى والحسابات بناءً على السوق الخليجي والعربي مع أفضل قيمة مقابل السعر.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Homepage FAQs */}
          <section className="container mx-auto px-4 py-8">
            <div className="bg-card/40 border border-border/80 rounded-2xl p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">
                الأسئلة الشائعة حول بيع وشراء حسابات كلاش
              </h2>
              <div className="space-y-4">
                <details className="border border-border/70 rounded-xl p-4 bg-background/50 cursor-pointer">
                  <summary className="font-semibold text-foreground text-base md:text-lg">س: كيف تتم عملية شراء ونقل حساب كلاش أوف كلانس أو كلاش رويال؟</summary>
                  <p className="mt-3 text-muted-foreground text-sm md:text-base leading-relaxed">بعد اختيار الحساب المناسب، تضغط على زر شراء عبر الواتساب، نتواصل معك مباشرة من إدارة المتجر ويتم نقل ملكية السوبر سيل آيدي (Supercell ID) وتغيير البريد الإلكتروني وتفعيل الحماية بخطوتين برقمك فوراً وبأمان 100%.</p>
                </details>
                <details className="border border-border/70 rounded-xl p-4 bg-background/50 cursor-pointer">
                  <summary className="font-semibold text-foreground text-base md:text-lg">س: ما هي طرق الدفع المتاحة في السعودية ودول الخليج؟</summary>
                  <p className="mt-3 text-muted-foreground text-sm md:text-base leading-relaxed">نقبل التحويل البنكي المباشر للحسابات السعودية والخليجية، بالإضافة إلى إمكانية الدفع والتقسيط عبر تابي (Tabby) وتمارا (Tamara)؛ حيث يتم الاتفاق على الطريقة المناسبة والتسليم يدوياً ومباشرة عبر الواتساب بكل سهولة وأمان.</p>
                </details>
                <details className="border border-border/70 rounded-xl p-4 bg-background/50 cursor-pointer">
                  <summary className="font-semibold text-foreground text-base md:text-lg">س: هل الحسابات المعروضة في كلاش ماركت مضمونة؟</summary>
                  <p className="mt-3 text-muted-foreground text-sm md:text-base leading-relaxed">نعم، جميع الحسابات مملوكة ومفحوصة يدوياً ومشمولة بوثيقة الضمان الذهبي ضد السحب أو الاسترجاع مدى الحياة، مع تسليم الإيميل الأساسي النظيف.</p>
                </details>
                <details className="border border-border/70 rounded-xl p-4 bg-background/50 cursor-pointer">
                  <summary className="font-semibold text-foreground text-base md:text-lg">س: كم يستغرق تسليم الحساب بعد إتمام الدفع؟</summary>
                  <p className="mt-3 text-muted-foreground text-sm md:text-base leading-relaxed">التسليم يدوي وفوري عبر الواتساب فور إتمام الاتفاق، حيث يستغرق عادةً من 5 إلى 15 دقيقة لإتمام نقل البريد وتأمين الحساب على جهازك خطوة بخطوة.</p>
                </details>
                <details className="border border-border/70 rounded-xl p-4 bg-background/50 cursor-pointer">
                  <summary className="font-semibold text-foreground text-base md:text-lg">س: هل يمكنني بيع حسابي لمتجر كلاش ماركت؟</summary>
                  <p className="mt-3 text-muted-foreground text-sm md:text-base leading-relaxed">نعم، نحن نشتري الحسابات القوية والمميزة كاش ومباشرة! يمكنك التواصل معنا عبر الواتساب لعرض مواصفات حسابك وسنقوم بفحصه وتقييمه وشرائه منك بأفضل سعر مع تحويل مالي سريع.</p>
                </details>
              </div>
            </div>
          </section>

          <Testimonials />

          {/* Blog Preview */}
          <section className="py-16 container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-foreground">أحدث المقالات</h2>
              <Link href="/blog" className="text-primary hover:underline">المزيد من المقالات</Link>
            </div>
            {loadingBlogs ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <div key={i} className="h-64 bg-muted animate-pulse rounded-lg"></div>)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {blogPosts?.map(post => (
                  <Card key={post.id} className="bg-card border-border overflow-hidden hover:border-primary transition-colors">
                    <div className="aspect-video bg-muted relative">
                      {post.coverImage ? (
                        <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">صورة المقال</div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <Link href={`/blog/${post.slug}`}>
                        <h3 className="text-xl font-bold hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                      </Link>
                      <p className="mt-2 text-muted-foreground line-clamp-2 text-sm">{post.content.replace(/<[^>]*>?/gm, '')}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
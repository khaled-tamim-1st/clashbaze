import { useState, useRef } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useGetFeaturedAccounts, useListAccounts, useListBlogPosts } from "@workspace/api-client-react";
import { AccountCard } from "@/components/AccountCard";
import { Card, CardContent } from "@/components/ui/card";
import { Testimonials } from "@/components/Testimonials";
import { SEO } from "../components/SEO";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

export default function Home() {
  // 1. استدعاء الـ Hooks داخل نطاق الدالة
  const { data: featuredAccounts, isLoading: loadingFeatured } = useGetFeaturedAccounts();
  const { data: latestAccounts, isLoading: loadingLatest } = useListAccounts({ limit: 6 });
  const { data: blogPosts, isLoading: loadingBlogs } = useListBlogPosts({ limit: 3 });

  // تحكم بالسحب والتمرير التفاعلي بالماوس والتاتش
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const amount = 340;
      scrollRef.current.scrollBy({
        left: direction === "right" ? amount : -amount,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      {/* 2. إعدادات SEO الخاصة بالصفحة الرئيسية */}
      <SEO 
        title="كلاش ماركت | بيع وشراء حسابات كلاش أوف كلانس وكلاش رويال"
        description="متجر كلاش ماركت الموثوق لبيع وشراء حسابات كلاش أوف كلانس وكلاش رويال في السعودية والخليج. قريات تاون ماكس، تشكيلات قوية، تسليم فوري، ودفع آمن عبر تابي ومدى."
        url="https://www.clashmarket.online/"
        image="https://www.clashmarket.online/thumbnail.png"
      />

      <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
        <Navbar />
        <main className="flex-1">
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

          {/* Featured Accounts - Interactive Slider */}
          <section className="py-16 bg-card/30 border-y border-border/50">
            <div className="container mx-auto px-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                      حسابات مميزة
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      اسحب يمين ويسار أو استخدم الأسهم لاستعراض الحسابات
                    </p>
                  </div>
                </div>

                {featuredAccounts && featuredAccounts.length > 0 && (
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => scroll("right")}
                      className="w-10 h-10 rounded-full border border-border bg-card hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
                      aria-label="السابق"
                      title="السابق"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => scroll("left")}
                      className="w-10 h-10 rounded-full border border-border bg-card hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
                      aria-label="التالي"
                      title="التالي"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              {loadingFeatured ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-96 bg-muted animate-pulse rounded-xl"
                    />
                  ))}
                </div>
              ) : !featuredAccounts || featuredAccounts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  لا توجد حسابات مميزة حالياً
                </div>
              ) : (
                <div
                  ref={scrollRef}
                  onMouseDown={handleMouseDown}
                  onMouseLeave={handleMouseLeave}
                  onMouseUp={handleMouseUp}
                  onMouseMove={handleMouseMove}
                  className={`flex gap-6 overflow-x-auto pb-6 pt-2 select-none scroll-smooth ${
                    isDragging ? "cursor-grabbing" : "cursor-grab"
                  }`}
                  style={{ scrollbarWidth: "none" }}
                >
                  {featuredAccounts.map((account) => (
                    <div
                      key={account.id}
                      className="w-[300px] shrink-0 transition-transform duration-200 hover:-translate-y-1"
                    >
                      <AccountCard account={account} />
                    </div>
                  ))}
                </div>
              )}
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
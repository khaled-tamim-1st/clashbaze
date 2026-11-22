import { Link, useRoute } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useGetBlogPost } from "@workspace/api-client-react";
import { SEO } from "@/components/SEO";

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export default function BlogDetail() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug || "";
  
  const { data: post, isLoading } = useGetBlogPost(slug);

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

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-16 text-center text-xl text-muted-foreground">
          لم يتم العثور على المقال
        </main>
        <Footer />
      </div>
    );
  }

  const seoTitle = post.seoTitle || post.title;
  const seoDescription = post.seoDescription || stripHtml(post.content).slice(0, 160);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: seoDescription,
    inLanguage: "ar-SA",
    image: post.coverImage ? [post.coverImage] : ["https://www.clashmarket.online/opengraph.png"],
    datePublished: post.createdAt,
    dateModified: post.createdAt,
    author: {
      "@type": "Organization",
      name: "كلاش ماركت",
      url: "https://www.clashmarket.online",
    },
    publisher: {
      "@type": "Organization",
      name: "كلاش ماركت",
      url: "https://www.clashmarket.online",
      logo: {
        "@type": "ImageObject",
        url: "https://www.clashmarket.online/opengraph.png",
      },
    },
    mainEntityOfPage: `https://www.clashmarket.online/blog/${post.slug}`,
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <SEO
        title={seoTitle.includes("كلاش ماركت") ? seoTitle : `${seoTitle} | كلاش ماركت`}
        description={seoDescription}
        url={`https://www.clashmarket.online/blog/${post.slug}`}
        image={post.coverImage || undefined}
        type="article"
        jsonLd={articleJsonLd}
      />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-16 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">{post.title}</h1>
          <div className="text-muted-foreground">
            {new Date(post.createdAt).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {post.coverImage && (
          <div className="w-full aspect-video rounded-xl overflow-hidden mb-8 border border-border">
            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Callout to Clash of Clans Store */}
        <div className="bg-card/70 border border-primary/40 rounded-xl p-5 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🏰</span>
            <strong className="text-foreground text-base">تنويه من متجر كلاش ماركت:</strong>
          </div>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
            هل تبحث عن قرية كلاش جاهزة بمواصفات ماكس وتوفير سنوات من التطوير؟ تفضل بزيارة{" "}
            <Link href="/clash-of-clans" className="text-primary font-bold underline">
              متجر كلاش أوف كلانس
            </Link>{" "}
            واستعرض أقوى قريات تاون هول 15 إلى 18 ماكس مع تسليم فوري بالواتساب وضمان ذهبي شامل.
          </p>
          <div className="flex flex-wrap gap-3 items-center">
            <Link
              href="/clash-of-clans"
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs md:text-sm hover:bg-primary/90 transition-colors"
            >
              دخول متجر كلاش أوف كلانس ←
            </Link>
            <Link href="/clash-of-clans/town-hall-18" className="text-xs text-muted-foreground hover:text-primary underline">
              قريات تاون 18 ماكس
            </Link>
            <Link href="/clash-of-clans/town-hall-17" className="text-xs text-muted-foreground hover:text-primary underline">
              قريات تاون 17
            </Link>
          </div>
        </div>

        <div className="prose prose-lg max-w-none text-foreground prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        {/* Bottom Store Banner */}
        <div className="mt-12 p-6 rounded-2xl bg-card border border-border text-center">
          <h3 className="text-xl font-bold text-foreground mb-2">تسوّق الآن بأمان من متجر كلاش ماركت</h3>
          <p className="text-sm text-muted-foreground mb-4">قريات كلاش أوف كلانس وحسابات كلاش رويال مفحوصة ومضمونة مع تسليم فوري.</p>
          <div className="flex justify-center flex-wrap gap-3">
            <Link
              href="/clash-of-clans"
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors"
            >
              زيارة متجر كلاش أوف كلانس (قريات ماكس) ←
            </Link>
            <Link
              href="/clash-royale"
              className="px-5 py-2.5 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm hover:bg-secondary/80 transition-colors"
            >
              متجر كلاش رويال ←
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
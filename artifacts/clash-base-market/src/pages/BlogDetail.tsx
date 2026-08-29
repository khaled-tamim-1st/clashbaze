import { useRoute } from "wouter";
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
          <div className="w-full aspect-video rounded-xl overflow-hidden mb-12 border border-border">
            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="prose prose-lg max-w-none text-foreground prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80">
          {/* Note: In a real app, you might want to use a safe HTML renderer like DOMPurify or a Markdown component */}
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
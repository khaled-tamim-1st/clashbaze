import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useListBlogPosts } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { SEO } from "@/components/SEO";

export default function Blog() {
  const { data: blogPosts, isLoading } = useListBlogPosts();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <SEO
        title="مدونة كلاش ماركت"
        description="أحدث المقالات والنصائح حول حسابات كلاش أوف كلانز وكلاش رويال من كلاش ماركت."
        url="https://clashbaze.com/blog"
      />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">المدونة</h1>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-80 bg-muted animate-pulse rounded-lg"></div>)}
          </div>
        ) : blogPosts && blogPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map(post => (
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
                  <p className="mt-2 text-muted-foreground line-clamp-3 text-sm">{post.content.replace(/<[^>]*>?/gm, '')}</p>
                  <div className="mt-4 text-xs text-muted-foreground">
                    {new Date(post.createdAt).toLocaleDateString('ar-SA')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground text-lg">
            لا توجد مقالات حالياً.
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
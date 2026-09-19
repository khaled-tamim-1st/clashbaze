import { useQuery } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { Star, CheckCircle2, MessageSquare, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TouchMarquee } from "@/components/TouchMarquee";
import { Link } from "wouter";

interface Review {
  id: number;
  customerName: string;
  rating: number;
  comment: string;
  game: string | null;
  status: string;
  createdAt: string;
}

interface ReviewsResponse {
  reviews: Review[];
  stats: {
    averageRating: number;
    totalReviews: number;
    distribution: Record<string, number>;
  };
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1 mb-3" dir="rtl">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "fill-amber-400 text-amber-400"
              : "fill-muted/30 text-muted/30"
          }`}
        />
      ))}
    </div>
  );
}

function TestimonialCard({ review }: { review: Review }) {
  return (
    <Card className="w-[320px] sm:w-[350px] shrink-0 bg-card border border-border/80 hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-md rounded-2xl overflow-hidden font-['Tajawal',sans-serif]">
      <CardContent className="p-5 sm:p-6 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <StarRating rating={review.rating} />
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <CheckCircle2 size={11} />
              <span>مشتري معتمد</span>
            </span>
          </div>
          <p className="text-foreground/90 text-sm leading-relaxed mb-4 line-clamp-4 text-right">
            "{review.comment}"
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/20">
              {review.customerName.charAt(0)}
            </div>
            <div className="text-right">
              <p className="font-bold text-foreground text-xs">{review.customerName}</p>
              <p className="text-[11px] text-muted-foreground">
                {review.game === "clash-royale" ? "كلاش رويال" : "كلاش أوف كلانس"}
              </p>
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground/80">
            {new Date(review.createdAt).toLocaleDateString("ar-SA", { month: "short", day: "numeric" })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export function Testimonials() {
  const { data, isLoading } = useQuery<ReviewsResponse>({
    queryKey: ["/api/reviews"],
    queryFn: () => customFetch<ReviewsResponse>("/api/reviews"),
  });

  const reviews = data?.reviews ?? [];

  // If reviews list is shorter than 6, repeat items so the marquee scrolls smoothly without gaps
  let displayReviews = [...reviews];
  if (displayReviews.length > 0 && displayReviews.length < 8) {
    displayReviews = [...displayReviews, ...displayReviews, ...displayReviews];
  }

  if (!isLoading && reviews.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-card/60 border-y border-border overflow-hidden font-['Tajawal',sans-serif]" style={{ fontFamily: "'Tajawal', sans-serif" }}>
      <div className="container mx-auto px-4 mb-8 text-center" dir="rtl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3 border border-primary/20">
          <MessageSquare size={13} />
          <span>تجارب حقيقية موثقة</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
          آراء وتقييمات عملائنا
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-4">
          تجارب حقيقية من لاعبين ومحبين لكلاش وثقوا في متجر كلاش ماركت لتسليم ونقل حساباتهم بأمان وضمان رسمي.
        </p>
        <div>
          <Link
            href="/reviews"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary hover:text-primary/80 transition-colors underline underline-offset-4"
          >
            <span>عرض كل التقييمات أو أضف تقييمك</span>
            <ArrowLeft size={14} />
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center gap-4 py-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-[320px] h-[180px] rounded-2xl bg-muted/20 animate-pulse" />
          ))}
        </div>
      ) : (
        <TouchMarquee speed={0.7}>
          {displayReviews.map((r, i) => (
            <TestimonialCard key={`${r.id}-${i}`} review={r} />
          ))}
        </TouchMarquee>
      )}
    </section>
  );
}
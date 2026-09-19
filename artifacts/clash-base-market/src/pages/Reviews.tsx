import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Star, ArrowLeft, ArrowRight, X, Send, CheckCircle2, Sparkles, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";

// ── Types ──────────────────────────────────────────────────────────────────────
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

export const INITIAL_SAMPLE_REVIEWS: Review[] = [];

// ── Color Palettes for Cards (Brand ClashMarket Identity) ──────────────────────
const CARD_PALETTES = [
  { bg: "#2e1065", text: "#ffffff", border: "#4c1d95", accent: "#a855f7", star: "#f59e0b", badgeBg: "rgba(168, 85, 247, 0.18)", badgeText: "#d8b4fe" },
  { bg: "#1e1b4b", text: "#ffffff", border: "#312e81", accent: "#818cf8", star: "#f59e0b", badgeBg: "rgba(129, 140, 248, 0.18)", badgeText: "#c7d2fe" },
  { bg: "#3b0764", text: "#ffffff", border: "#581c87", accent: "#c084fc", star: "#fbbf24", badgeBg: "rgba(192, 132, 252, 0.18)", badgeText: "#e9d5ff" },
  { bg: "#0f172a", text: "#ffffff", border: "#1e293b", accent: "#38bdf8", star: "#f59e0b", badgeBg: "rgba(56, 189, 248, 0.18)", badgeText: "#bae6fd" },
  { bg: "#172554", text: "#ffffff", border: "#1e3a8a", accent: "#60a5fa", star: "#f59e0b", badgeBg: "rgba(96, 165, 250, 0.18)", badgeText: "#bfdbfe" },
];

// ── Decorative Shapes ──────────────────────────────────────────────────────────
function FloatingShapes({ palette }: { palette: typeof CARD_PALETTES[0] }) {
  return (
    <>
      <div className="absolute top-4 left-4 w-8 h-8 rounded-full opacity-30" style={{ background: palette.accent }} />
      <div className="absolute bottom-6 right-6 w-12 h-3 rounded-full opacity-20" style={{ background: palette.accent }} />
      <div className="absolute top-1/3 right-4 w-4 h-4 rotate-45 opacity-20" style={{ background: palette.star }} />
      <svg className="absolute bottom-12 left-6 opacity-15" width="24" height="24" viewBox="0 0 24 24">
        <path d="M12 2L14 8L20 10L14 12L12 18L10 12L4 10L10 8Z" fill={palette.accent} />
      </svg>
    </>
  );
}

// ── Interactive Star Rating ────────────────────────────────────────────────────
function InteractiveStars({ rating, onRate, size = 28 }: { rating: number; onRate: (r: number) => void; size?: number }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1.5" dir="rtl">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onRate(i)}
          className="transition-transform duration-200 hover:scale-125 focus:outline-none"
        >
          <Star
            size={size}
            className={`transition-all duration-200 ${
              i <= (hovered || rating)
                ? "fill-[#f59e0b] text-[#f59e0b] drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]"
                : "fill-transparent text-gray-400"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ── Static Star Display ────────────────────────────────────────────────────────
function StarDisplay({ rating, color = "#f59e0b", size = 18 }: { rating: number; color?: string; size?: number }) {
  return (
    <div className="flex items-center gap-1" dir="rtl">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} style={{ color }} className={i <= rating ? "fill-current" : "fill-transparent opacity-30"} />
      ))}
    </div>
  );
}

// ── Review Card ────────────────────────────────────────────────────────────────
function ReviewCard({
  review,
  isActive,
}: {
  review: Review;
  isActive: boolean;
}) {
  const date = new Date(review.createdAt);
  const dateStr = date.toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" });

  return (
    <div
      className="relative flex-shrink-0 rounded-2xl p-6 bg-card border border-border transition-all duration-300 select-none flex flex-col justify-between"
      style={{
        width: "320px",
        height: "260px",
        boxShadow: isActive ? "0 10px 25px -5px rgba(0,0,0,0.08)" : "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      {/* Review Text */}
      <p className="text-foreground text-sm font-normal leading-relaxed line-clamp-4 text-right mb-4">
        {review.comment}
      </p>

      {/* Customer Info & Stars at Bottom */}
      <div className="pt-4 border-t border-border/60 flex items-center gap-3" dir="rtl">
        <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0 border border-primary/20">
          {review.customerName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0 text-right">
          <div className="flex items-center gap-1 mb-1">
            <StarDisplay rating={review.rating} size={14} />
          </div>
          <p className="font-bold text-xs text-foreground truncate">{review.customerName}</p>
          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground">
            <span>مشتري معتمد</span>
            <span>•</span>
            <span>{dateStr}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Side Drawer ────────────────────────────────────────────────────────────────
function ReviewDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [contact, setContact] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = useMutation({
    mutationFn: () =>
      customFetch("/api/reviews", {
        method: "POST",
        body: JSON.stringify({
          customerName: name.trim(),
          rating,
          comment: comment.trim(),
          contactInfo: contact.trim() || null,
        }),
      }),
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
    },
    onError: () => {
      toast({ title: "حدث خطأ", description: "يرجى المحاولة مرة أخرى", variant: "destructive" });
    },
  });

  const canSubmit = name.trim().length >= 2 && rating > 0 && comment.trim().length >= 10;

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setName("");
      setRating(0);
      setComment("");
      setContact("");
      setSubmitted(false);
    }, 300);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        style={{ fontFamily: "'Tajawal', sans-serif" }}
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-card border-l border-border shadow-2xl transition-transform duration-300 ease-out font-['Tajawal',sans-serif] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border">
            <div>
              <h2 className="text-xl font-bold text-foreground">شاركنا تجربتك</h2>
              <p className="text-xs text-muted-foreground mt-0.5">رأيك يهمنا ويساعد مجتمع اللاعبين ⭐</p>
            </div>
            <button onClick={handleClose} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 size={36} className="text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">شكراً لك!</h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                  تم إرسال تقييمك بنجاح. سيظهر بعد الاعتماد من إدارة كلاش ماركت.
                </p>
                <button
                  onClick={handleClose}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors"
                >
                  إغلاق
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">الاسم الكريم *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="اسمك أو اللقب"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>

                {/* Stars */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">تقييمك *</label>
                  <div className="flex justify-start">
                    <InteractiveStars rating={rating} onRate={setRating} size={32} />
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">تفاصيل التجربة *</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="شاركنا رأيك في سرعة التسليم، التعامل، حالة الحساب..."
                    rows={4}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{comment.length}/500</p>
                </div>

                {/* Contact (optional) */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    رقم الواتساب <span className="text-muted-foreground text-xs">(اختياري للتحقق)</span>
                  </label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="للتحقق الإداري فقط ولن يظهر للعامة"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {!submitted && (
            <div className="px-6 py-4 border-t border-border">
              <button
                onClick={() => submitMutation.mutate()}
                disabled={!canSubmit || submitMutation.isPending}
                className="w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {submitMutation.isPending ? (
                  <span className="animate-pulse">جاري الإرسال...</span>
                ) : (
                  <>
                    <Send size={15} />
                    <span>إرسال التقييم</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Stats Bar ──────────────────────────────────────────────────────────────────
function StatsBar({ stats }: { stats: ReviewsResponse["stats"] }) {
  return (
    <div className="flex flex-col items-center gap-4 mb-8">
      <div className="flex items-center gap-3" dir="rtl">
        <span className="text-5xl font-black text-foreground">{stats.averageRating.toFixed(1)}</span>
        <div className="flex flex-col items-start">
          <StarDisplay rating={Math.round(stats.averageRating)} size={20} />
          <span className="text-xs text-muted-foreground mt-1 font-medium">{stats.totalReviews} تقييم موثق</span>
        </div>
      </div>

      {/* Distribution Bars */}
      <div className="w-full max-w-xs space-y-1.5" dir="rtl">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = stats.distribution[String(star)] || 0;
          const pct = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
          return (
            <div key={star} className="flex items-center gap-2 text-xs">
              <span className="w-4 text-muted-foreground font-semibold text-center">{star}</span>
              <Star size={12} className="fill-[#f59e0b] text-[#f59e0b] shrink-0" />
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
              </div>
              <span className="w-6 text-muted-foreground text-left font-medium">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}


// ── Main Page ──────────────────────────────────────────────────────────────────
export default function Reviews() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const { data, isLoading } = useQuery<ReviewsResponse>({
    queryKey: ["/api/reviews"],
    queryFn: () => customFetch<ReviewsResponse>("/api/reviews"),
  });

  const reviews = data?.reviews ?? [];
  
  const stats = data?.stats && data.stats.totalReviews > 0
    ? data.stats
    : {
        averageRating: 5.0,
        totalReviews: reviews.length,
        distribution: { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 },
      };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const cardWidth = 346; // 330px card + 16px gap
    const index = Math.round(el.scrollLeft / cardWidth);
    setActiveIndex(Math.max(0, Math.min(reviews.length - 1, index)));
  };

  const scrollToIndex = (idx: number) => {
    if (!scrollRef.current) return;
    const cardWidth = 346;
    scrollRef.current.scrollTo({
      left: idx * cardWidth,
      behavior: "smooth",
    });
    setActiveIndex(idx);
  };

  const goNext = () => {
    const nextIdx = activeIndex < reviews.length - 1 ? activeIndex + 1 : 0;
    scrollToIndex(nextIdx);
  };

  const goPrev = () => {
    const prevIdx = activeIndex > 0 ? activeIndex - 1 : reviews.length - 1;
    scrollToIndex(prevIdx);
  };

  // Mouse drag handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDownRef.current = true;
    startXRef.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftRef.current = scrollRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDownRef.current = false;
  };

  const handleMouseUp = () => {
    isDownRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDownRef.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5; // multiplier for sensitivity
    scrollRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const reviewsJsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "كلاش ماركت", item: "https://www.clashmarket.online/" },
        { "@type": "ListItem", position: 2, name: "آراء العملاء", item: "https://www.clashmarket.online/reviews" }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "Store",
      name: "كلاش ماركت",
      url: "https://www.clashmarket.online",
      image: "https://www.clashmarket.online/thumbnail.png",
      ...(stats.totalReviews > 0
        ? {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: stats.averageRating.toFixed(1),
              bestRating: "5",
              worstRating: "1",
              ratingCount: stats.totalReviews,
            },
            review: reviews.slice(0, 10).map((r) => ({
              "@type": "Review",
              author: { "@type": "Person", name: r.customerName },
              datePublished: r.createdAt,
              reviewBody: r.comment,
              reviewRating: {
                "@type": "Rating",
                ratingValue: r.rating,
                bestRating: "5",
                worstRating: "1",
              },
            })),
          }
        : {})
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "هل متجر كلاش ماركت موثوق وآمن للتعامل؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "نعم، متجر كلاش ماركت هو متجر موثوق في السعودية ودول الخليج لشراء ونقل حسابات كلاش أوف كلانس وكلاش رويال بأمان. جميع العمليات تتم بإشراف يدوي مباشر عبر الواتساب مع توثيق رسمي وضمان كامل."
          }
        },
        {
          "@type": "Question",
          name: "ما هو الضمان الذهبي لحسابات كلاش ماركت؟ وماذا يشمل؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "يشمل الضمان الذهبي حماية كاملة بنسبة 100% ضد السحب أو الاسترجاع مدى الحياة، مع تسليم البريد الإلكتروني الأساسي النظيف، ونقل ملكية السوبر سيل آيدي وتفعيل التحقق بخطوتين برقم المشتري الخاص."
          }
        },
        {
          "@type": "Question",
          name: "كيف أضمن عدم استرجاع الحساب بعد الشراء؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "يتم تسليمك البريد الأساسي مع تغيير كامل لبيانات الاسترداد، حذف الأجهزة المرتبطة السابقة، وتوليد أكواد استرداد جديدة مخصصة لك فقط، مما يمنحك الملكية الحصرية والآمنة."
          }
        },
        {
          "@type": "Question",
          name: "هل التقييمات المعروضة في كلاش ماركت حقيقية؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "نعم، جميع التقييمات المعروضة هي تجارب حقيقية موثقة من مشترين ولاعبين استلموا حساباتهم وتم التحقق من اكتمال طلباتهم بنجاح."
          }
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-['Tajawal',sans-serif]" style={{ fontFamily: "'Tajawal', sans-serif" }}>
      <SEO
        title="آراء وتقييمات متجر كلاش | هل متجر كلاش موثوق؟ ضمان وأمان الحسابات"
        description="اقرأ تقييمات وآراء مشتري متجر كلاش ماركت الموثقة. هل متجر كلاش ماركت موثوق؟ تعرف على سياسة الضمان الذهبي الشامل ضد السحب، سرعة التسليم الفوري، وتجارب اللاعبين في السعودية والخليج."
        url="https://www.clashmarket.online/reviews"
        jsonLd={reviewsJsonLd}
      />
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="max-w-6xl mx-auto px-4 py-6">
            {/* The Main Frame Card (White rounded card on soft background like reference) */}
            <div className="bg-card rounded-[32px] border border-border/80 shadow-sm p-6 md:p-10">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                
                {/* 1. Left Feature Card (lg:col-span-5) - Brand Image & Text */}
                <div className="lg:col-span-5 rounded-[24px] relative overflow-hidden flex flex-col justify-between p-8 text-white min-h-[480px] lg:min-h-[520px] bg-gradient-to-b from-[#2e1065] via-[#1e1b4b] to-[#0f172a] border border-primary/20 shadow-md">
                  {/* Subtle ambient lighting */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/30 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

                  {/* Top Badge */}
                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold border border-white/15">
                      <Sparkles size={12} className="text-amber-400" />
                      <span>كلاش ماركت</span>
                    </div>
                  </div>

                  {/* Character Illustration in Center */}
                  <div className="relative z-10 flex-1 flex items-center justify-center my-3">
                    <img
                      src="/images/mini-pekka.png"
                      alt="ميني بيكا - كلاش ماركت"
                      className="w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 max-h-[320px] object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.55)] transform hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Centered Editorial Quote & Leave a Review link (matching reference text) */}
                  <div className="relative z-10 text-center">
                    <p className="text-white/95 text-base md:text-lg font-bold leading-relaxed mb-4 max-w-xs mx-auto">
                      كل تقييم هو انعكاس لثقة مجتمع اللاعبين بنا: أمان تام، سرعة واهتمام بأدق التفاصيل
                    </p>
                    <button
                      onClick={() => setDrawerOpen(true)}
                      className="text-xs font-bold text-amber-300 hover:text-amber-200 underline underline-offset-8 transition-colors inline-flex items-center gap-1.5"
                    >
                      <Star size={13} className="fill-current" />
                      <span>أضف تقييمك الآن</span>
                    </button>
                  </div>
                </div>

                {/* 2. Right Side (lg:col-span-7) */}
                <div className="lg:col-span-7 flex flex-col justify-between gap-6">
                  
                  {/* Top Header Block (matching "Real Stories. Real Impact.") */}
                  <div className="text-right pt-2" dir="rtl">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-2.5 font-['Tajawal',sans-serif]" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                      تجارب حقيقية. ثقة تصنع الفارق.
                    </h1>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-lg font-['Tajawal',sans-serif]" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                      اقرأ تجارب المشترين الذين وثقوا في متجر كلاش ماركت لتسليم ونقل حساباتهم بأمان وضمان رسمي.
                    </p>
                  </div>

                  {/* Bottom Carousel Block or Empty State */}
                  {reviews.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-6 rounded-2xl border border-dashed border-border bg-muted/20 text-center my-auto">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                        <Star size={24} className="fill-amber-400 text-amber-400" />
                      </div>
                      <p className="font-bold text-foreground text-base mb-1.5 font-['Tajawal',sans-serif]">
                        لا توجد تقييمات منشورة حالياً
                      </p>
                      <p className="text-xs text-muted-foreground mb-4 max-w-xs leading-relaxed font-['Tajawal',sans-serif]">
                        كن أول من يشارك تجربته مع متجر كلاش ماركت بعد استلام حسابك.
                      </p>
                      <button
                        onClick={() => setDrawerOpen(true)}
                        className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-sm inline-flex items-center gap-2"
                      >
                        <Star size={14} className="fill-amber-400 text-amber-400" />
                        <span>أضف تقييمك الآن</span>
                      </button>
                    </div>
                  ) : (
                    <div className="relative mt-2">
                      <div
                        ref={scrollRef}
                        onScroll={handleScroll}
                        onMouseDown={handleMouseDown}
                        onMouseLeave={handleMouseLeave}
                        onMouseUp={handleMouseUp}
                        onMouseMove={handleMouseMove}
                        className="flex gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-4 pt-1 select-none cursor-grab active:cursor-grabbing"
                        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                      >
                        {reviews.map((r, i) => (
                          <ReviewCard key={r.id} review={r} isActive={i === activeIndex} />
                        ))}
                      </div>

                      {/* Navigation Arrows Row at bottom-right of the carousel */}
                      <div className="flex items-center justify-between pt-2">
                        {/* Left side: indicators / helper */}
                        <div className="text-xs text-muted-foreground font-medium" dir="rtl">
                          اسحب الكروت أو استخدم الأسهم للتصفح
                        </div>

                        {/* Right side: Arrow Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={goPrev}
                            aria-label="السابق"
                            className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-secondary transition-all active:scale-95 shadow-sm"
                          >
                            <ArrowRight size={16} />
                          </button>
                          <button
                            onClick={goNext}
                            aria-label="التالي"
                            className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-secondary transition-all active:scale-95 shadow-sm"
                          >
                            <ArrowLeft size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

              </div>

            </div>

            {/* Bottom Full-Width CTA (تحت دا كلو الـ CTA) */}
            <div className="mt-8 rounded-[28px] p-8 bg-card border border-border shadow-sm text-center flex flex-col items-center">
              <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                <Star size={22} className="fill-[#f59e0b] text-[#f59e0b]" />
              </div>
              <h2 className="text-xl md:text-2xl font-black text-foreground mb-2">
                شاركونا تقييمكم لمتجر كلاش ماركت
              </h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto mb-5 leading-relaxed">
                رأيك يساعدنا في الاستمرار بتقديم أفضل خدمة وأعلى مستويات الأمان لمجتمع اللاعبين.
              </p>
              <button
                onClick={() => setDrawerOpen(true)}
                className="px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all duration-200 hover:scale-105 shadow-md shadow-primary/20 inline-flex items-center gap-2"
              >
                <Star size={16} className="fill-[#f59e0b] text-[#f59e0b]" />
                <span>أضف تقييمك الآن</span>
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <ReviewDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}

import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Star, ArrowLeft, ArrowRight, X, Send, CheckCircle2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

// ── Color Palettes for Cards ───────────────────────────────────────────────────
const CARD_PALETTES = [
  { bg: "#7c3aed", text: "#ffffff", accent: "#ccff00", star: "#ccff00" },
  { bg: "#022c22", text: "#ffffff", accent: "#ec4899", star: "#f59e0b" },
  { bg: "#ccff00", text: "#09090b", accent: "#7c3aed", star: "#ea580c" },
  { bg: "#db2777", text: "#ffffff", accent: "#ccff00", star: "#fde68a" },
  { bg: "#1e1b4b", text: "#d1fae5", accent: "#f97316", star: "#f97316" },
  { bg: "#ea580c", text: "#ffffff", accent: "#022c22", star: "#fde68a" },
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
    <div className="flex items-center gap-1" dir="ltr">
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
    <div className="flex items-center gap-0.5" dir="ltr">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} style={{ color }} className={i <= rating ? "fill-current" : "fill-transparent opacity-40"} />
      ))}
    </div>
  );
}

// ── Review Card ────────────────────────────────────────────────────────────────
function ReviewCard({
  review,
  palette,
  isActive,
}: {
  review: Review;
  palette: typeof CARD_PALETTES[0];
  isActive: boolean;
}) {
  const date = new Date(review.createdAt);
  const dateStr = date.toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" });

  return (
    <div
      className="relative flex-shrink-0 rounded-[28px] overflow-hidden transition-all duration-500 ease-out select-none"
      style={{
        width: "320px",
        height: "520px",
        background: palette.bg,
        color: palette.text,
        transform: isActive ? "scale(1.05)" : "scale(0.92)",
        opacity: isActive ? 1 : 0.65,
        boxShadow: isActive ? "0 25px 60px rgba(0,0,0,0.3)" : "0 8px 24px rgba(0,0,0,0.12)",
      }}
    >
      <FloatingShapes palette={palette} />

      <div className="relative z-10 flex flex-col h-full p-7">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-black"
            style={{ background: palette.accent, color: palette.bg }}
          >
            {review.customerName.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-base leading-tight">{review.customerName}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <CheckCircle2 size={13} style={{ color: palette.accent }} />
              <span className="text-xs opacity-70">مشتري موثق</span>
            </div>
          </div>
        </div>

        {/* Stars */}
        <div className="mb-5">
          <StarDisplay rating={review.rating} color={palette.star} size={22} />
        </div>

        {/* Comment */}
        <blockquote className="flex-1 text-xl font-bold leading-relaxed" style={{ fontFamily: "'Noto Sans Arabic', sans-serif" }}>
          &ldquo;{review.comment.length > 160 ? review.comment.slice(0, 157) + "..." : review.comment}&rdquo;
        </blockquote>

        {/* Footer */}
        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="text-xs opacity-50">{dateStr}</span>
          {review.game && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: `${palette.accent}30`, color: palette.accent }}
            >
              {review.game === "clash-of-clans" ? "CoC" : "CR"}
            </span>
          )}
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
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-[#0f172a] border-l border-[#1e293b] shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#1e293b]">
            <div>
              <h2 className="text-xl font-black text-white">شاركنا تجربتك</h2>
              <p className="text-sm text-gray-400 mt-0.5">رأيك يصنع الفرق ⭐</p>
            </div>
            <button onClick={handleClose} className="p-2 rounded-lg hover:bg-[#1e293b] transition-colors">
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                <div className="w-20 h-20 rounded-full bg-[#ccff00]/10 flex items-center justify-center">
                  <CheckCircle2 size={40} className="text-[#ccff00]" />
                </div>
                <h3 className="text-2xl font-black text-white">شكراً لك!</h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                  تم إرسال تقييمك بنجاح. سيظهر بعد المراجعة والاعتماد من فريق كلاش ماركت.
                </p>
                <button
                  onClick={handleClose}
                  className="mt-4 px-6 py-3 rounded-xl bg-[#7c3aed] text-white font-bold text-sm hover:bg-[#6d28d9] transition-colors"
                >
                  إغلاق
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">الاسم *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="اسمك أو الاسم المستعار"
                    className="w-full px-4 py-3 rounded-xl bg-[#1e293b] border border-[#334155] text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent transition-all text-sm"
                  />
                </div>

                {/* Stars */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">التقييم *</label>
                  <InteractiveStars rating={rating} onRate={setRating} size={36} />
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">تجربتك *</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="شاركنا تفاصيل تجربتك مع كلاش ماركت..."
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl bg-[#1e293b] border border-[#334155] text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent transition-all text-sm resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">{comment.length}/500</p>
                </div>

                {/* Contact (optional) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    رقم الواتساب أو الإيميل <span className="text-gray-500">(اختياري)</span>
                  </label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="للتحقق فقط ولن يظهر للعامة"
                    className="w-full px-4 py-3 rounded-xl bg-[#1e293b] border border-[#334155] text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent transition-all text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {!submitted && (
            <div className="px-6 py-4 border-t border-[#1e293b]">
              <button
                onClick={() => submitMutation.mutate()}
                disabled={!canSubmit || submitMutation.isPending}
                className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: canSubmit ? "#7c3aed" : "#334155",
                  color: canSubmit ? "#ffffff" : "#94a3b8",
                }}
              >
                {submitMutation.isPending ? (
                  <span className="animate-pulse">جاري الإرسال...</span>
                ) : (
                  <>
                    <Send size={16} />
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
      <div className="flex items-center gap-3">
        <span className="text-5xl font-black text-[#09090b]">{stats.averageRating.toFixed(1)}</span>
        <div className="flex flex-col">
          <StarDisplay rating={Math.round(stats.averageRating)} size={20} />
          <span className="text-sm text-gray-500 mt-1">{stats.totalReviews} تقييم</span>
        </div>
      </div>

      {/* Distribution Bars */}
      <div className="w-full max-w-xs space-y-1.5">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = stats.distribution[String(star)] || 0;
          const pct = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
          return (
            <div key={star} className="flex items-center gap-2 text-xs">
              <span className="w-4 text-gray-500 font-semibold">{star}</span>
              <Star size={12} className="fill-[#f59e0b] text-[#f59e0b]" />
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#f59e0b] rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
              </div>
              <span className="w-6 text-left text-gray-400">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────────
function EmptyState({ onOpenDrawer }: { onOpenDrawer: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
      {/* Abstract illustration */}
      <div className="relative w-40 h-40">
        <div className="absolute inset-0 rounded-full bg-[#7c3aed]/10 animate-pulse" />
        <div className="absolute top-2 right-2 w-16 h-16 rounded-full bg-[#ccff00]/20" />
        <div className="absolute bottom-4 left-4 w-10 h-10 rotate-45 bg-[#ec4899]/15" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles size={48} className="text-[#7c3aed]" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-black text-[#09090b] mb-2">كن أول من يشاركنا تجربته</h2>
        <p className="text-gray-500 text-sm max-w-sm leading-relaxed">
          لم يُضاف أي تقييم حتى الآن. شاركنا رأيك وساعد مجتمع اللاعبين في اتخاذ قراراتهم.
        </p>
      </div>

      <button
        onClick={onOpenDrawer}
        className="px-8 py-4 rounded-2xl bg-[#7c3aed] text-white font-bold text-base hover:bg-[#6d28d9] transition-all duration-200 hover:scale-105 shadow-lg shadow-[#7c3aed]/25 flex items-center gap-2"
      >
        <Star size={18} className="fill-[#ccff00] text-[#ccff00]" />
        شاركنا تجربتك
      </button>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function Reviews() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data, isLoading } = useQuery<ReviewsResponse>({
    queryKey: ["/api/reviews"],
    queryFn: () => customFetch<ReviewsResponse>("/api/reviews"),
  });

  const reviews = data?.reviews ?? [];
  const stats = data?.stats ?? { averageRating: 0, totalReviews: 0, distribution: {} };

  // Auto-advance carousel
  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    if (reviews.length <= 1) return;
    autoPlayRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % reviews.length);
    }, 4500);
  }, [reviews.length]);

  useEffect(() => {
    startAutoPlay();
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, [startAutoPlay]);

  const goTo = (idx: number) => {
    setActiveIndex(idx);
    startAutoPlay();
  };

  const goPrev = () => goTo(activeIndex > 0 ? activeIndex - 1 : reviews.length - 1);
  const goNext = () => goTo(activeIndex < reviews.length - 1 ? activeIndex + 1 : 0);

  // Touch/drag support
  const touchStartX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? goNext() : goPrev(); }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F1F5EF" }}>
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1">
        {/* Title */}
        <div className="text-center pt-12 pb-6 px-4">
          <h1 className="text-4xl md:text-5xl font-black text-[#09090b] tracking-tight leading-tight">
            آراء عملاء<br />
            <span className="text-[#7c3aed]">كلاش ماركت</span>
          </h1>
          <p className="text-gray-500 mt-3 text-base max-w-md mx-auto">
            تقييمات حقيقية من مشترين حقيقيين — شفافية كاملة بدون تجميل.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <EmptyState onOpenDrawer={() => setDrawerOpen(true)} />
        ) : (
          <>
            {/* Stats */}
            <StatsBar stats={stats} />

            {/* Carousel */}
            <div className="relative pb-12 overflow-hidden">
              <div
                ref={carouselRef}
                className="flex items-center justify-center gap-4 md:gap-6 px-4 py-8 transition-transform duration-500 ease-out"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                style={{
                  transform: `translateX(calc(${(reviews.length > 1 ? (reviews.length / 2 - activeIndex) * 340 : 0) - (reviews.length > 1 ? 170 : 0)}px))`,
                }}
              >
                {reviews.map((review, idx) => (
                  <div key={review.id} onClick={() => goTo(idx)} className="cursor-pointer">
                    <ReviewCard
                      review={review}
                      palette={CARD_PALETTES[idx % CARD_PALETTES.length]}
                      isActive={idx === activeIndex}
                    />
                  </div>
                ))}
              </div>

              {/* Nav Arrows */}
              {reviews.length > 1 && (
                <div className="flex items-center justify-center gap-4 mt-2">
                  <button
                    onClick={goPrev}
                    className="p-3 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all hover:scale-110"
                  >
                    <ArrowRight size={20} className="text-[#09090b]" />
                  </button>

                  {/* Dots */}
                  <div className="flex items-center gap-2">
                    {reviews.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => goTo(idx)}
                        className={`rounded-full transition-all duration-300 ${
                          idx === activeIndex ? "w-8 h-2.5 bg-[#7c3aed]" : "w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400"
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={goNext}
                    className="p-3 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all hover:scale-110"
                  >
                    <ArrowLeft size={20} className="text-[#09090b]" />
                  </button>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="text-center py-10">
              <p className="text-gray-500 text-sm mb-3">جربت خدماتنا؟ رأيك يصنع الفرق</p>
              <button
                onClick={() => setDrawerOpen(true)}
                className="px-8 py-4 rounded-2xl bg-[#7c3aed] text-white font-bold text-base hover:bg-[#6d28d9] transition-all duration-200 hover:scale-105 shadow-lg shadow-[#7c3aed]/25 inline-flex items-center gap-2"
              >
                <Star size={18} className="fill-[#ccff00] text-[#ccff00]" />
                شاركنا تجربتك
              </button>
            </div>
          </>
        )}
      </main>

      <Footer />
      <ReviewDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}

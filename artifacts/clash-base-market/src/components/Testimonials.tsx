import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type Testimonial = {
  name: string;
  text: string;
  rating: number;
};

const testimonials: Testimonial[] = [
  { name: "عبدالله السالم", text: "تعامل احترافي وسرعة في التسليم، الحساب مطابق تمامًا للوصف. تجربة ممتازة هكرر التعامل تاني.", rating: 5 },
  { name: "فيصل الغامدي", text: "أسعار مناسبة جدًا وضمان حقيقي، تواصلت مع الدعم واتحل استفساري في دقايق.", rating: 5 },
  { name: "محمد العتيبي", text: "أول مرة أشتري حساب أونلاين وكنت خايف، بس الموقع كسب ثقتي من أول عملية.", rating: 5 },
  { name: "خالد الحربي", text: "طرق الدفع متنوعة وسهلة، واستلمت بيانات الحساب فورًا بعد الدفع.", rating: 4 },
  { name: "سلطان القحطاني", text: "متجر موثوق فعلاً، جربت أكتر من حساب من عندهم ومفيش أي مشكلة لحد دلوقتي.", rating: 5 },
  { name: "ناصر الدوسري", text: "خدمة عملاء متعاونة جدًا وردهم سريع على واتساب، أنصح به لأي حد عايز يشتري بأمان.", rating: 5 },
  // ضيف/امسح ريفيوز هنا براحتك
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5 mb-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-primary text-primary" : "fill-muted text-muted"}`} />
      ))}
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <Card className="w-[320px] shrink-0 bg-card border-border">
      <CardContent className="p-6">
        <StarRating rating={testimonial.rating} />
        <p className="text-foreground/90 text-sm leading-relaxed mb-4 line-clamp-4">{testimonial.text}</p>
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
            {testimonial.name.charAt(0)}
          </div>
          <span className="font-semibold text-foreground text-sm">{testimonial.name}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function Testimonials() {
  const loopItems = [...testimonials, ...testimonials];

  return (
    <section className="py-16 bg-card border-y border-border overflow-hidden">
      <div className="container mx-auto px-4 mb-10 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-3">آراء عملائنا</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          آلاف العملاء اشتروا حسابات كلاش من عندنا، وده جزء بسيط من تجاربهم
        </p>
      </div>

      <div className="marquee-container">
        <div className="marquee-track flex flex-nowrap gap-6">
          {loopItems.map((t, i) => (
            <TestimonialCard key={i} testimonial={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
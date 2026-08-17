import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

export const faqData = [
  {
    question: "كيف تتم عملية شراء ونقل حساب كلاش أوف كلانس أو كلاش رويال؟",
    answer:
      "بعد اختيار الحساب المناسب، تضغط على زر شراء عبر الواتساب، يتواصل معك الوسيط المعتمد ويتم نقل ملكية السوبر سيل آيدي (Supercell ID) وتغيير البريد الإلكتروني وتفعيل الحماية بخطوتين برقمك فوراً وبأمان 100%.",
  },
  {
    question: "ما هي طرق الدفع المتاحة في السعودية ودول الخليج؟",
    answer:
      "نوفر كافة طرق الدفع المحلية المعتمدة: مدى (Mada)، تابي (Tabby)، تمارا (Tamara) للتقسيط، Apple Pay، تحويل بنكي سعودي وخليجي مباشر، والبطاقات الائتمانية (Visa / MasterCard).",
  },
  {
    question: "هل الحسابات المعروضة في كلاش ماركت مضمونة؟",
    answer:
      "نعم، جميع الحسابات مفحوصة وموثقة مع ضمان كامل ضد السحب أو الاسترجاع، ووساطة رسمية تضمن حقوق المشتري والبائع.",
  },
  {
    question: "كم يستغرق تسليم الحساب بعد إتمام الدفع؟",
    answer:
      "التسليم فوري ومباشر، عادةً يستغرق من 5 إلى 15 دقيقة لإتمام نقل الحساب وتأكيده معك خطوة بخطوة.",
  },
  {
    question: "هل يمكنني بيع حسابي عبر متجر كلاش ماركت؟",
    answer:
      "نعم، يمكنك التواصل معنا عبر الواتساب لعرض مواصفات حسابك وتقييمه وعرضه للمشترين بعمولة وساطة رمزية وأمان تام.",
  },
];

export function FAQ() {
  return (
    <section className="py-16 container mx-auto px-4 max-w-4xl">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
          الأسئلة الشائعة حول بيع وشراء الحسابات
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          إليك إجابات لأهم الاستفسارات حول أمان الحسابات، طرق الدفع، وسرعة التسليم في السعودية والخليج
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqData.map((item, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-border/60 rounded-xl px-5 bg-background/50 hover:border-primary/40 transition-colors"
            >
              <AccordionTrigger className="text-base md:text-lg font-bold text-foreground hover:no-underline py-4">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed text-sm md:text-base pb-4">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

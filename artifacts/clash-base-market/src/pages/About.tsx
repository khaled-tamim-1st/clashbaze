import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { Link } from "wouter";
import { Shield, Users, CheckCircle2, MessageCircle } from "lucide-react";

export default function About() {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "966576742294";

  return (
    <>
      <SEO
        title="من نحن | متجر كلاش ماركت لتداول حسابات كلاش"
        description="تعرف على كلاش ماركت، المنصة المتخصصة لبيع وشراء حسابات وقريات كلاش أوف كلانس وكلاش رويال المضمونة في السعودية ودول الخليج العربي."
        url="https://www.clashmarket.online/about"
      />

      <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
        <Navbar />

        <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold mb-3">
              منصة الجيمرز في الخليج
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
              من نحن في كلاش ماركت
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-sm md:text-base">
              متجر متخصص في توفير وساطة آمنة وموثوقة لبيع وشراء قريات كلاش أوف كلانس وحسابات كلاش رويال في المملكة العربية السعودية ودول الخليج العربي.
            </p>
          </div>

          <div className="space-y-8">
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-4">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                هدفنا وأسلوب عملنا
              </h2>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                بدأ <strong>كلاش ماركت</strong> لتوفير بديل آمن للاعبين بدلاً من التعامل مع أطراف مجهولة في منصات التواصل. نعتمد أسلوب البيع اليدوي المباشر؛ حيث يقوم وسيط المتجر بفحص كل حساب بنفسه، والتأكد من أمان البريد الإلكتروني وسجل القرية قبل عرضها أو تسليمها للمشتري.
              </p>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                هدفنا أن يحصل اللاعب على قرية ماكس أو حساب متقدم جاهز للمنافسة في حروب القبائل ودوري الأساطير دون إضاعة سنوات طويلة في التطوير، وضمن بيئة تعامل واضحة ومضمونة.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
                <Users className="w-8 h-8 text-primary mb-2" />
                <h3 className="text-lg font-bold">تعامل مباشر وإنساني</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  لا نستخدم روبوتات تسليم آلية قد تقع في أخطاء أو تعرض الحساب للحظر. كل عملية بيع وشراء تتم بمحادثة حقيقية مباشرة عبر الواتساب خطوة بخطوة.
                </p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
                <h3 className="text-lg font-bold">فحص دقيق قبل التسليم</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  نتأكد من استقلالية البريد الإلكتروني وخلو الحساب من أي نزاعات ملكية، ونساعد المشتري في نقل السوبر سيل آيدي وتأمين الحساب برقم هاتفه.
                </p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 text-center space-y-4 shadow-sm">
              <h3 className="text-xl font-bold">جاهز لاختيار حسابك أو لديك استفسار؟</h3>
              <p className="text-muted-foreground text-sm max-w-lg mx-auto">
                فريق وساطة كلاش ماركت متاح عبر الواتساب للإجابة عن أي سؤال حول الحسابات وطريقة الاستلام.
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-2">
                <Link href="/clash-of-clans" className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-sm transition-colors">
                  تصفح قريات كلاش أوف كلانس
                </Link>
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-colors shadow"
                >
                  <MessageCircle className="w-4 h-4" />
                  مراسلة الوسيط على الواتساب
                </a>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

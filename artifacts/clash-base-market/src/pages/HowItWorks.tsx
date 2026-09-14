import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { Link } from "wouter";
import { MessageCircle, ShieldCheck, CreditCard, KeyRound } from "lucide-react";

export default function HowItWorks() {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "966576742294";

  return (
    <>
      <SEO
        title="طريقة الشراء والتسليم اليدوي | متجر كلاش ماركت"
        description="تعرف على خطوات شراء واستلام حسابات كلاش أوف كلانس وكلاش رويال في كلاش ماركت. تسليم يدوي مباشر بإشراف وسيط معتمد عبر الواتساب."
        url="https://www.clashmarket.online/how-it-works"
      />

      <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
        <Navbar />

        <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold mb-3">
              وساطة يدوية معتمدة
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
              كيف تتم عملية الشراء والتسليم في كلاش ماركت؟
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-sm md:text-base">
              نعتمد في كلاش ماركت على نظام التسليم اليدوي المباشر عبر الواتساب لضمان أمان كل خطوة، والتحقق من نقل الحساب والإيميل لجهازك بدقة وتحت إشراف الوسيط.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6 mb-12">
            {/* خطوة 1 */}
            <div className="p-6 bg-card border border-border rounded-2xl flex flex-col md:flex-row items-start gap-6 hover:border-primary/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-black text-xl shrink-0">
                1
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  اختر الحساب المناسب
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  تصفح قسم <Link href="/clash-of-clans" className="text-primary font-bold hover:underline">كلاش أوف كلانس</Link> أو <Link href="/clash-royale" className="text-primary font-bold hover:underline">كلاش رويال</Link>، وشاهد صور الحساب وتفاصيل اللفل والأبطال والأسعار المعروضة بكل شفافية.
                </p>
              </div>
            </div>

            {/* خطوة 2 */}
            <div className="p-6 bg-card border border-border rounded-2xl flex flex-col md:flex-row items-start gap-6 hover:border-primary/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xl shrink-0">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold">
                  التواصل المباشر عبر الواتساب
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  اضغط على زر <strong>"شراء عبر الواتساب"</strong> الموجود في صفحة الحساب. سيتم توجيهك مباشرة لمحادثة الوسيط مع إرفاق تفاصيل الحساب المطلوب لتأكيد توفره فوراً والاتفاق على وسيلة الدفع المناسبة لك.
                </p>
              </div>
            </div>

            {/* خطوة 3 */}
            <div className="p-6 bg-card border border-border rounded-2xl flex flex-col md:flex-row items-start gap-6 hover:border-primary/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-black text-xl shrink-0">
                <CreditCard className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold">
                  تحويل المبلغ بالاتفاق مع الوسيط
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  يتم تحويل قيمة الحساب بالوسيلة المتفق عليها مباشرة مع الوسيط في محادثة الواتساب (مثل التحويل البنكي المباشر للحسابات البنكية السعودية أو الخليجية).
                </p>
              </div>
            </div>

            {/* خطوة 4 */}
            <div className="p-6 bg-card border border-border rounded-2xl flex flex-col md:flex-row items-start gap-6 hover:border-primary/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-xl shrink-0">
                <KeyRound className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold">
                  نقل الحساب وتأمينه خطوة بخطوة
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  يقوم الوسيط معك في نفس اللحظة بتسليمك بيانات الإيميل الأساسي أو تغيير بريد Supercell ID إلى بريدك الشخصي، ومساعدتك في تفعيل التحقق برقم هاتفك لضمان دخولك للقرية وخروج المالك السابق نهائياً.
                </p>
              </div>
            </div>
          </div>

          {/* صندوق الثقة والضمان */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 text-center max-w-3xl mx-auto space-y-4 shadow-sm">
            <ShieldCheck className="w-12 h-12 text-primary mx-auto" />
            <h3 className="text-2xl font-bold">كل عملية بيع مشمولة بالضمان الذهبي</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              لأننا نبيع يدوياً، فإننا نقوم بفحص وتجربة كل حساب قبل تسليمه لك للتأكد من نظافة سجله وخلوه من أي مشاكل.
            </p>
            <div className="pt-2">
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-colors shadow"
              >
                <MessageCircle className="w-5 h-5" />
                تواصل مع الوسيط للاستفسار
              </a>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { Link } from "wouter";
import { ShieldCheck, Mail, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function Guarantee() {
  return (
    <>
      <SEO
        title="سياسة الضمان الذهبي والاسترجاع | متجر كلاش ماركت"
        description="تعرف على وثيقة الضمان الذهبي في كلاش ماركت. حماية كاملة ضد سحب الحسابات، تسليم الإيميل الأساسي، وتعويض مالي فوري أو استبدال الحساب 100%."
        url="https://www.clashmarket.online/guarantee"
      />

      <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
        <Navbar />

        <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-bold mb-3">
              وثيقة الأمان الرسمية
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
              سياسة الضمان الذهبي وحماية المشتري
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-sm md:text-base">
              في كلاش ماركت، ندرك أن هاجس المشتري الأول في سوق حسابات الألعاب هو "أمان الحساب وعدم سحبه". لذلك وضعنا بروتوكول ضمان مالي وقانوني صارم يحمي استثمارك من أول دقيقة.
            </p>
          </div>

          {/* مصفوفة ركائز الضمان */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 bg-card border border-border rounded-2xl shadow-sm hover:border-primary/50 transition-colors">
              <ShieldCheck className="w-10 h-10 text-amber-400 mb-4" />
              <h2 className="text-xl font-bold mb-2">ضمان عدم السحب مدى الحياة</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                جميع الحسابات المعروضة في المتجر تخضع لفحص ملكية جذري. نضمن لك خلو الحساب من أي مطالبات استرداد أو بلاغات نزاع من المالك الأصلي طوال فترة استخدامك له.
              </p>
            </div>

            <div className="p-6 bg-card border border-border rounded-2xl shadow-sm hover:border-primary/50 transition-colors">
              <Mail className="w-10 h-10 text-amber-400 mb-4" />
              <h2 className="text-xl font-bold mb-2">تسليم الإيميل الأساسي النظيف</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                لا نقوم بالربط العشوائي أو المؤقت؛ يتم تسليم المشتري حق الوصول الكامل للبريد الإلكتروني الأساسي المربوط بحساب Supercell ID، مع تصفير كافة ارتباطات الأجهزة السابقة.
              </p>
            </div>

            <div className="p-6 bg-card border border-border rounded-2xl shadow-sm hover:border-primary/50 transition-colors">
              <RefreshCw className="w-10 h-10 text-amber-400 mb-4" />
              <h2 className="text-xl font-bold mb-2">التعويض الفوري المباشر</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                في حال ثبوت أي خلل تقني أو نزاع على الحساب خارج عن سوء استخدام العميل، تلتزم منصة كلاش ماركت بتعويضه بحساب مطابق للمواصفات أو استرداد كامل المبلغ المدفوع فوراً.
              </p>
            </div>
          </div>

          {/* تفاصيل البنود */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-8 shadow-sm">
            <div>
              <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-primary" />
                1. بروتوكول الوساطة وفحص الأمان
              </h2>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                يعمل وسيط كلاش ماركت المعتمد كطرف ضامن ومحايد؛ حيث لا يتم تسليم أموال البيع للمالك السابق إلا بعد مراجعة سجل الـ IP، والتأكد من عدم وجود تسجيلات دخول نشطة غير مصرح بها، واكتمال نقل بيانات البريد وربط هاتف المشتري بنجاح.
              </p>
            </div>

            <div className="border-t border-border pt-6">
              <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-primary" />
                2. الحالات التي يغطيها الضمان الذهبي
              </h2>
              <ul className="list-disc pr-6 text-muted-foreground space-y-2 text-sm md:text-base">
                <li>محاولة استرجاع الحساب من خلال مراسلة دعم Supercell بمعلومات المنشأ القديمة.</li>
                <li>وجود شحنات ملغاة سابقة (Chargebacks) تسببت في سالب جواهر قبل تاريخ الشراء.</li>
                <li>عدم تطابق المواصفات المستلمة داخل اللعبة مع بيانات وصور العرض في المتجر.</li>
              </ul>
            </div>

            <div className="border-t border-border pt-6">
              <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-amber-400" />
                3. الحالات المستثناة من الضمان
              </h2>
              <ul className="list-disc pr-6 text-muted-foreground space-y-2 text-sm md:text-base">
                <li>مخالفة سياسة اللعب النظيف من Supercell بعد الاستلام (مثل استخدام برامج البوت، الهاكات، أو مشاركة الحساب مع لاعبين في دول متعددة خلال فترات زمنية متقاربة).</li>
                <li>مراسلة الدعم الفني للعبة من أجهزة جديدة فور الشراء دون اتباع إرشادات الاستقرار الموصى بها.</li>
                <li>فقدان المشتري للوصول إلى بريده الإلكتروني الشخصي أو رقم هاتفه الموثق.</li>
              </ul>
            </div>

            <div className="p-4 bg-muted/40 rounded-xl border-r-4 border-amber-400 text-sm text-foreground/90">
              <strong>تنبيه للأمان:</strong> يوفر فريق الدعم المباشر عبر الواتساب دليلاً فورياً خطوة بخطوة أثناء التسليم لتطبيق إعدادات الحماية الثنائية لضمان سريان وثيقة الضمان بصورة قانونية متكاملة.
            </div>

            <div className="pt-4 flex flex-wrap gap-4 justify-center">
              <Link href="/clash-of-clans" className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-sm transition-colors">
                تصفح حسابات كلاش أوف كلانس
              </Link>
              <Link href="/clash-royale" className="px-6 py-3 bg-card border border-border hover:border-primary text-foreground font-bold rounded-xl text-sm transition-colors">
                تصفح حسابات كلاش رويال
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

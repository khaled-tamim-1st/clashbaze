import { Link } from "wouter";

export function Footer() {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "";
  const whatsappLink = `https://wa.me/${whatsappNumber}`;

  return (
    <footer className="border-t border-border bg-card">
      <div className="container px-4 py-8 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold text-primary mb-4">كلاش ماركت</h3>
            <p className="text-sm text-muted-foreground">
              المتجر المتخصص في بيع وشراء حسابات كلاش أوف كلانس وكلاش رويال في السعودية والخليج.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4 text-foreground">روابط سريعة</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/clash-of-clans" className="hover:text-primary">حسابات كلاش أوف كلانس</Link></li>
              <li><Link href="/clash-royale" className="hover:text-primary">حسابات كلاش رويال</Link></li>
              <li><Link href="/blog" className="hover:text-primary">مدونة كلاش ماركت</Link></li>
              <li><Link href="/about" className="hover:text-primary">كلاش ماركت / من نحن</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4 text-foreground">معلومات مهمة</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/guarantee" className="hover:text-primary">سياسة الضمان وحماية المشتري</Link></li>
              <li><Link href="/how-it-works" className="hover:text-primary">طريقة الشراء والتسليم</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4 text-foreground">تواصل معنا</h3>
            <p className="text-sm text-muted-foreground mb-4">
              نحن هنا لمساعدتك في أي وقت. تواصل معنا عبر الواتساب.
            </p>
            <a 
              href={whatsappLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              تواصل واتساب
            </a>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} كلاش ماركت. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
}


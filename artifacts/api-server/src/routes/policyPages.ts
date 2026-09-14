import { Router } from "express";
import { escapeHtml, pageShell, breadcrumbHtml, breadcrumbJsonLd, SITE_NAME, SITE_URL } from "../lib/pageshell";

const router = Router();

// 1. صفحة سياسة الضمان الذهبي (/guarantee)
router.get("/guarantee", (req, res) => {
  const title = `سياسة الضمان الذهبي وحماية المشتري | ${SITE_NAME}`;
  const description =
    "تعرف على وثيقة الضمان الذهبي في كلاش ماركت. حماية كاملة ضد سحب الحسابات، تسليم الإيميل الأساسي، وتعويض مالي فوري أو استبدال الحساب 100%.";

  const breadcrumbs = [
    { name: "الرئيسية", path: "/" },
    { name: "سياسة الضمان الذهبي", path: "/guarantee" },
  ];

  const jsonLd = [
    breadcrumbJsonLd(breadcrumbs),
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      description,
      url: `${SITE_URL}/guarantee`,
      inLanguage: "ar-SA",
      isPartOf: {
        "@type": "WebSite",
        name: SITE_NAME,
        url: SITE_URL,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "ما هو ضمان عدم سحب الحساب في كلاش ماركت؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "جميع الحسابات المعروضة في المتجر تخضع لفحص ملكية جذري. نضمن لك خلو الحساب من أي مطالبات استرداد أو بلاغات نزاع من المالك الأصلي طوال فترة استخدامك له.",
          },
        },
        {
          "@type": "Question",
          name: "هل يتم تسليم الإيميل الأساسي مع الحساب؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "نعم، يتم تسليم المشتري حق الوصول الكامل للبريد الإلكتروني الأساسي المربوط بحساب Supercell ID، مع تصفير كافة ارتباطات الأجهزة السابقة.",
          },
        },
        {
          "@type": "Question",
          name: "ما هي سياسة التعويض في حال حدوث مشكلة بالحساب؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "في حال ثبوت أي خلل تقني أو نزاع على الحساب خارج عن سوء استخدام العميل، تلتزم منصة كلاش ماركت بتعويضه بحساب مطابق للمواصفات أو استرداد كامل المبلغ المدفوع فوراً.",
          },
        },
      ],
    },
  ];

  const bodyHtml = `
    ${breadcrumbHtml(breadcrumbs)}

    <article class="prose" style="max-width: 850px; margin: 0 auto; line-height: 1.8;">
      <header style="text-align: center; margin-bottom: 36px;">
        <span style="display:inline-block; padding: 4px 14px; background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 9999px; font-size: 0.85rem; font-weight: 700; margin-bottom: 12px;">
          وثيقة الأمان الرسمية
        </span>
        <h1 style="font-size: 2.2rem; font-weight: 800; color: #f8fafc; margin-bottom: 16px;">
          سياسة الضمان الذهبي وحماية المشتري
        </h1>
        <p style="color: #94a3b8; font-size: 1.05rem; max-width: 680px; margin: 0 auto;">
          في كلاش ماركت، ندرك أن هاجس المشتري الأول في سوق حسابات الألعاب هو أمان الحساب وعدم سحبه. لذلك وضعنا بروتوكول ضمان مالي وإجرائي صارم يحمي استثمارك من أول دقيقة.
        </p>
      </header>

      <section style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 40px;">
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 24px;">
          <div style="font-size: 2rem; margin-bottom: 12px;">🛡️</div>
          <h2 style="font-size: 1.25rem; font-weight: 700; color: #f8fafc; margin-bottom: 8px;">ضمان عدم السحب مدى الحياة</h2>
          <p style="color: #94a3b8; font-size: 0.95rem; margin: 0;">
            جميع الحسابات المعروضة في المتجر تخضع لفحص ملكية جذري، مع ضمان استقرار القرية وخلوها من أي مطالبات استرداد أو نزاعات سابقة.
          </p>
        </div>

        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 24px;">
          <div style="font-size: 2rem; margin-bottom: 12px;">✉️</div>
          <h2 style="font-size: 1.25rem; font-weight: 700; color: #f8fafc; margin-bottom: 8px;">تسليم الإيميل الأساسي النظيف</h2>
          <p style="color: #94a3b8; font-size: 0.95rem; margin: 0;">
            لا نقوم بالربط العشوائي أو المؤقت؛ يتم تسليمك الوصول الكامل للبريد الإلكتروني المربوط بـ Supercell ID وتأمينه برقم هاتفك الشخصي.
          </p>
        </div>

        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 24px;">
          <div style="font-size: 2rem; margin-bottom: 12px;">🔄</div>
          <h2 style="font-size: 1.25rem; font-weight: 700; color: #f8fafc; margin-bottom: 8px;">التعويض الفوري المباشر</h2>
          <p style="color: #94a3b8; font-size: 0.95rem; margin: 0;">
            في حال ثبوت أي خلل تقني أو مشكلة بالحساب خارجة عن سوء الاستخدام، نلتزم بتعويضك بحساب بديل مطابق أو استرداد كامل المبلغ فوراً.
          </p>
        </div>
      </section>

      <section style="background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 28px; margin-bottom: 32px;">
        <h2 style="font-size: 1.4rem; font-weight: 700; color: #f8fafc; margin-bottom: 14px;">
          1. بروتوكول فحص وتأمين الملكية الصارم
        </h2>
        <p style="color: #cbd5e1; font-size: 1rem; margin-bottom: 24px;">
          نقوم في كلاش ماركت بفحص كل حساب وتملكه بشكل كامل؛ حيث نراجع سجل الـ IP، ونتأكد من عدم وجود تسجيلات دخول نشطة غير مصرح بها، وتصفير ارتباطات الأجهزة السابقة، قبل تسليم بيانات الإيميل الأساسي وربط هاتف المشتري بنجاح.
        </p>

        <h2 style="font-size: 1.4rem; font-weight: 700; color: #f8fafc; margin-bottom: 14px; border-top: 1px solid #334155; padding-top: 20px;">
          2. الحالات التي يغطيها الضمان الذهبي
        </h2>
        <ul style="color: #cbd5e1; padding-right: 20px; font-size: 0.95rem; margin-bottom: 24px;">
          <li style="margin-bottom: 8px;">محاولة استرجاع الحساب من خلال مراسلة دعم Supercell بمعلومات المنشأ القديمة.</li>
          <li style="margin-bottom: 8px;">وجود شحنات ملغاة سابقة (Chargebacks) تسببت في سالب جواهر قبل تاريخ الشراء.</li>
          <li style="margin-bottom: 8px;">عدم تطابق المواصفات المستلمة داخل اللعبة مع بيانات وصور العرض في المتجر.</li>
        </ul>

        <h2 style="font-size: 1.4rem; font-weight: 700; color: #f8fafc; margin-bottom: 14px; border-top: 1px solid #334155; padding-top: 20px;">
          3. الحالات المستثناة من الضمان
        </h2>
        <ul style="color: #cbd5e1; padding-right: 20px; font-size: 0.95rem; margin-bottom: 24px;">
          <li style="margin-bottom: 8px;">مخالفة سياسة اللعب النظيف من Supercell بعد الاستلام (مثل استخدام برامج البوت أو الهاكات أو مشاركة الحساب).</li>
          <li style="margin-bottom: 8px;">مراسلة الدعم الفني للعبة من أجهزة جديدة فور الشراء دون اتباع إرشادات الاستقرار الموصى بها.</li>
          <li style="margin-bottom: 8px;">فقدان المشتري للوصول إلى بريده الإلكتروني الشخصي أو رقم هاتفه الموثق.</li>
        </ul>

        <div style="background: rgba(245, 158, 11, 0.1); border-right: 4px solid #f59e0b; padding: 16px; border-radius: 8px; color: #f8fafc; font-size: 0.95rem;">
          <strong>تنبيه للأمان:</strong> يوفر فريق إدارة المتجر عبر الواتساب إرشاداً خطوة بخطوة أثناء التسليم لتفعيل الحماية برقم الجوال وأكواد الاسترداد لضمان أعلى مستويات الأمان.
        </div>
      </section>

      <div style="text-align: center; margin-top: 36px;">
        <a class="cta" href="/clash-of-clans" style="margin-left: 12px;">تصفح حسابات كلاش أوف كلانس</a>
        <a class="cta" href="/clash-royale" style="background: #2563eb;">تصفح حسابات كلاش رويال</a>
      </div>
    </article>
  `;

  res.set("Content-Type", "text/html; charset=utf-8");
  res.send(pageShell({
    title,
    description,
    canonicalPath: "/guarantee",
    bodyHtml,
    jsonLd,
  }));
});

// 2. صفحة طريقة الشراء والتسليم اليدوي (/how-it-works)
router.get("/how-it-works", (req, res) => {
  const title = `طريقة الشراء والتسليم اليدوي المباشر | ${SITE_NAME}`;
  const description =
    "تعرف على خطوات شراء واستلام حسابات كلاش أوف كلانس وكلاش رويال في كلاش ماركت. تسليم يدوي مباشر ومضمون من إدارة المتجر عبر الواتساب.";

  const breadcrumbs = [
    { name: "الرئيسية", path: "/" },
    { name: "طريقة الشراء والتسليم", path: "/how-it-works" },
  ];

  const jsonLd = [
    breadcrumbJsonLd(breadcrumbs),
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "كيفية شراء واستلام حساب كلاش عبر كلاش ماركت",
      description: "دليل خطوات شراء حساب كلاش أوف كلانس أو كلاش رويال بنظام التسليم اليدوي المباشر عبر الواتساب.",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "اختيار الحساب المناسب",
          text: "تصفح معروضات كلاش أوف كلانس أو كلاش رويال واطلع على الصور والمستوى والمواصفات والأسعار.",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "التواصل المباشر عبر الواتساب",
          text: "اضغط على زر شراء عبر الواتساب للتواصل المباشر مع المتجر وتأكيد توفر الحساب والاتفاق على طريقة الدفع المناسبة (تحويل بنكي أو تابي وتمارا).",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "الدفع والتحويل بالاتفاق المباشر",
          text: "يتم سداد قيمة الحساب بالطريقة المتفق عليها عبر الواتساب (تحويل بنكي مباشر، أو الدفع والتقسيط عبر تابي وتمارا بالاتفاق المباشر).",
        },
        {
          "@type": "HowToStep",
          position: 4,
          name: "نقل الحساب وتأمينه خطوة بخطوة",
          text: "نقوم بتسليمك بيانات الإيميل الأساسي وربط الحساب ببياناتك وهاتفك الشخصي ومساعدتك في تأمينه.",
        },
      ],
    },
  ];

  const bodyHtml = `
    ${breadcrumbHtml(breadcrumbs)}

    <article class="prose" style="max-width: 850px; margin: 0 auto; line-height: 1.8;">
      <header style="text-align: center; margin-bottom: 36px;">
        <span style="display:inline-block; padding: 4px 14px; background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 9999px; font-size: 0.85rem; font-weight: 700; margin-bottom: 12px;">
          متجر موثوق — بيع وشراء مباشر
        </span>
        <h1 style="font-size: 2.2rem; font-weight: 800; color: #f8fafc; margin-bottom: 16px;">
          كيف تتم عملية الشراء والتسليم في كلاش ماركت؟
        </h1>
        <p style="color: #94a3b8; font-size: 1.05rem; max-width: 680px; margin: 0 auto;">
          نعتمد في كلاش ماركت على نظام التسليم اليدوي المباشر عبر الواتساب لضمان أمان كل خطوة، والتحقق من نقل الحساب والإيميل لجهازك بدقة وتحت إشرافنا المباشر.
        </p>
      </header>

      <section style="display: flex; flex-direction: column; gap: 20px; margin-bottom: 40px;">
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 24px; display: flex; gap: 20px; align-items: flex-start;">
          <div style="background: rgba(245, 158, 11, 0.2); color: #f59e0b; width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; font-weight: 900; flex-shrink: 0;">
            1
          </div>
          <div>
            <h2 style="font-size: 1.3rem; font-weight: 700; color: #f8fafc; margin-bottom: 6px;">اختر الحساب المناسب</h2>
            <p style="color: #94a3b8; font-size: 0.95rem; margin: 0;">
              تصفح قسم <a href="/clash-of-clans" style="color:#f59e0b; font-weight:700;">كلاش أوف كلانس</a> أو <a href="/clash-royale" style="color:#f59e0b; font-weight:700;">كلاش رويال</a>، وشاهد صور الحساب وتفاصيل اللفل والأبطال والأسعار المعروضة بكل شفافية.
            </p>
          </div>
        </div>

        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 24px; display: flex; gap: 20px; align-items: flex-start;">
          <div style="background: rgba(16, 185, 129, 0.2); color: #10b981; width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; font-weight: 900; flex-shrink: 0;">
            2
          </div>
          <div>
            <h2 style="font-size: 1.3rem; font-weight: 700; color: #f8fafc; margin-bottom: 6px;">التواصل المباشر عبر الواتساب</h2>
            <p style="color: #94a3b8; font-size: 0.95rem; margin: 0;">
              اضغط على زر <strong>"شراء عبر الواتساب"</strong> في صفحة الحساب، وسيقوم النظام بتوجيهك مباشرة لمحادثتنا في المتجر لتأكيد توفر الحساب فوراً والاتفاق على طريقة الدفع المناسبة لك (تحويل بنكي أو تابي وتمارا بالاتفاق المباشر).
            </p>
          </div>
        </div>

        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 24px; display: flex; gap: 20px; align-items: flex-start;">
          <div style="background: rgba(59, 130, 246, 0.2); color: #3b82f6; width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; font-weight: 900; flex-shrink: 0;">
            3
          </div>
          <div>
            <h2 style="font-size: 1.3rem; font-weight: 700; color: #f8fafc; margin-bottom: 6px;">الدفع والتحويل بالاتفاق المباشر</h2>
            <p style="color: #94a3b8; font-size: 0.95rem; margin: 0;">
              يتم سداد قيمة الحساب بالطريقة التي تناسبك بعد الاتفاق في محادثة الواتساب، سواء عبر التحويل البنكي المباشر لحساباتنا السعودية والخليجية، أو التنسيق للدفع والتقسيط عبر تابي وتمارا يدوياً وبكل سهولة.
            </p>
          </div>
        </div>

        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 24px; display: flex; gap: 20px; align-items: flex-start;">
          <div style="background: rgba(245, 158, 11, 0.2); color: #f59e0b; width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; font-weight: 900; flex-shrink: 0;">
            4
          </div>
          <div>
            <h2 style="font-size: 1.3rem; font-weight: 700; color: #f8fafc; margin-bottom: 6px;">نقل الحساب وتأمينه خطوة بخطوة</h2>
            <p style="color: #94a3b8; font-size: 0.95rem; margin: 0;">
              نقوم معك في نفس اللحظة بتسليمك بيانات الإيميل الأساسي وتأكيد ربط Supercell ID ببريدك الشخصي ورقم هاتفك لضمان امتلاكك الكامل والنهائي للقرية بأعلى معايير الأمان.
            </p>
          </div>
        </div>
      </section>

      <section style="background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 28px; text-align: center;">
        <h3 style="font-size: 1.4rem; font-weight: 700; color: #f8fafc; margin-bottom: 12px;">كل عملية بيع مشمولة بالضمان الذهبي</h3>
        <p style="color: #94a3b8; font-size: 0.95rem; max-width: 600px; margin: 0 auto 20px;">
          أموالك وحسابك في أمان تام تحت مظلة الضمان الذهبي لمتجر كلاش ماركت.
        </p>
        <a class="cta" href="/guarantee">قراءة تفاصيل الضمان الذهبي</a>
      </section>
    </article>
  `;

  res.set("Content-Type", "text/html; charset=utf-8");
  res.send(pageShell({
    title,
    description,
    canonicalPath: "/how-it-works",
    bodyHtml,
    jsonLd,
  }));
});

// 3. صفحة من نحن (/about)
router.get("/about", (req, res) => {
  const title = `كلاش ماركت – متجر حسابات كلاش أوف كلانس وكلاش رويال | من نحن`;
  const description =
    "تعرف على كلاش ماركت، المتجر المتخصص في بيع وشراء حسابات كلاش أوف كلانس وكلاش رويال بتسليم يدوي مباشر وضمان وفق سياسة المتجر في السعودية والخليج.";

  const breadcrumbs = [
    { name: "الرئيسية", path: "/" },
    { name: "من نحن", path: "/about" },
  ];

  const aboutFaq = [
    {
      q: "هل كلاش ماركت متجر رسمي معتمد من Supercell؟",
      a: "لا. كلاش ماركت متجر مستقل يعمل في سوق تداول حسابات الألعاب. ليس له أي ارتباط أو اعتماد رسمي من شركة Supercell.",
    },
    {
      q: "كيف أتواصل مع المتجر؟",
      a: "التواصل يتم عبر الواتساب مباشرة للتحدث مع إدارة المتجر وإتمام خطوات الشراء والاستلام خطوة بخطوة.",
    },
    {
      q: "هل يمكنني بيع حسابي لكلاش ماركت؟",
      a: "نعم، يمكنك التواصل مع إدارة المتجر عبر الواتساب وعرض تفاصيل حسابك. إذا استوفى الحساب معايير الفحص يتم الاتفاق والشراء مباشرة.",
    },
    {
      q: "ما طرق الدفع المتاحة؟",
      a: "تحويل بنكي مباشر على حسابات سعودية وخليجية، أو ترتيب الدفع عبر تابي أو تمارا بالتنسيق المباشر مع إدارة المتجر.",
    },
  ];

  const jsonLd = [
    breadcrumbJsonLd(breadcrumbs),
    {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: title,
      description,
      url: `${SITE_URL}/about`,
      inLanguage: "ar-SA",
      mainEntity: {
        "@type": "Organization",
        name: SITE_NAME,
        alternateName: ["Clash Market", "متجر كلاش", "كلاش ماركت حسابات"],
        url: SITE_URL,
        logo: `${SITE_URL}/thumbnail.png`,
        description,
        areaServed: [
          { "@type": "Country", name: "المملكة العربية السعودية" },
          { "@type": "Country", name: "الإمارات العربية المتحدة" },
          { "@type": "Country", name: "الكويت" },
          { "@type": "Country", name: "قطر" },
          { "@type": "Country", name: "البحرين" },
          { "@type": "Country", name: "سلطنة عمان" },
        ],
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: aboutFaq.map(f => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.a,
        },
      })),
    },
  ];

  const faqHtml = aboutFaq
    .map(
      f => `
      <details style="border: 1px solid #334155; border-radius: 8px; margin-bottom: 8px;">
        <summary style="padding: 12px; cursor: pointer; font-weight: 600; color: #f8fafc;">${escapeHtml(f.q)}</summary>
        <p style="padding: 0 12px 12px; color: #94a3b8; line-height: 1.8; margin: 0;">${escapeHtml(f.a)}</p>
      </details>`
    )
    .join("");

  const bodyHtml = `
    ${breadcrumbHtml(breadcrumbs)}

    <article class="prose" style="max-width: 850px; margin: 0 auto; line-height: 1.8;">
      <header style="text-align: center; margin-bottom: 36px;">
        <span style="display:inline-block; padding: 4px 14px; background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 9999px; font-size: 0.85rem; font-weight: 700; margin-bottom: 12px;">
          متجر حسابات كلاش في الخليج
        </span>
        <h1 style="font-size: 2.2rem; font-weight: 800; color: #f8fafc; margin-bottom: 16px;">
          كلاش ماركت – متجر وسوق حسابات كلاش أوف كلانس وكلاش رويال
        </h1>
        <p style="color: #94a3b8; font-size: 1.05rem; max-width: 680px; margin: 0 auto;">
          متجر تجاري متخصص في شراء وبيع حسابات كلاش أوف كلانس وكلاش رويال، يخدم اللاعبين في المملكة العربية السعودية ودول الخليج العربي.
        </p>
      </header>

      <section style="background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 28px; margin-bottom: 28px;">
        <h2 style="font-size: 1.4rem; font-weight: 700; color: #f8fafc; margin-bottom: 12px;">من هو كلاش ماركت؟</h2>
        <p style="color: #cbd5e1; font-size: 1rem; margin-bottom: 16px;">
          كلاش ماركت هو متجر مستقل بدأ بهدف توفير مكان واحد يمكن للاعبين من خلاله شراء حسابات كلاش أوف كلانس وكلاش رويال بشكل مباشر وواضح. نحن نعمل كتجار متخصصين — نشتري الحسابات المتميزة من أصحابها، نفحصها يدوياً، ثم نعرضها للبيع مع ضمان وفق سياسة المتجر.
        </p>
        <p style="color: #cbd5e1; font-size: 1rem; margin: 0;">
          بدلاً من المخاطرة مع بائعين مجهولين على شبكات التواصل، يتعامل اللاعب مع متجر يقدم فحصاً مسبقاً، تسليماً يدوياً مباشراً، وإشرافاً دقيقاً على نقل ملكية Supercell ID وتأمين الحساب.
        </p>
      </section>

      <section style="background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 28px; margin-bottom: 28px;">
        <h2 style="font-size: 1.4rem; font-weight: 700; color: #f8fafc; margin-bottom: 12px;">ما الذي يقدمه المتجر؟</h2>
        <ul style="color: #cbd5e1; line-height: 2; padding-right: 20px;">
          <li><strong>حسابات كلاش أوف كلانس:</strong> قريات تاون هول 14 إلى 18 بمستويات تطوير وأبطال متنوعة. (<a href="/clash-of-clans" style="color: #f59e0b;">تصفح حسابات كلاش أوف كلانس</a>)</li>
          <li><strong>حسابات كلاش رويال:</strong> تشكيلات بطاقات Level 16 وتطورات Evolutions وأبطال. (<a href="/clash-royale" style="color: #60a5fa;">تصفح حسابات كلاش رويال</a>)</li>
          <li><strong>تسليم يدوي مباشر:</strong> متابعة شخصية خطوة بخطوة عبر الواتساب لتغيير البريد وتأمين الحساب برقمك.</li>
          <li><strong>طرق دفع مرنة:</strong> تحويل بنكي محلي أو تقسيط ميسر عبر تابي وتمارا بالتنسيق المباشر.</li>
        </ul>
      </section>

      <section style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 36px;">
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 24px;">
          <h3 style="font-size: 1.2rem; font-weight: 700; color: #f8fafc; margin-bottom: 8px;">🔍 كيف نفحص الحسابات؟</h3>
          <p style="color: #94a3b8; font-size: 0.95rem; margin: 0; line-height: 1.8;">
            نتحقق يدوياً من استقلالية البريد الأساسي، خلو الحساب من أي نزاعات ملكية، سلامة سجل الشحنات والجواهر، وعدم وجود أي مخالفات سابقة.
          </p>
        </div>

        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 24px;">
          <h3 style="font-size: 1.2rem; font-weight: 700; color: #f8fafc; margin-bottom: 8px;">🛡️ الضمان وحماية المشتري</h3>
          <p style="color: #94a3b8; font-size: 0.95rem; margin: 0; line-height: 1.8;">
            نلتزم بتسليم الإيميل الأساسي وتفعيل حماية الحساب (Account Protection) على رقم المشتري مع تقديم الدعم وفق <a href="/guarantee" style="color: #f59e0b;">سياسة الضمان</a> و<a href="/how-it-works" style="color: #f59e0b;">طريقة الشراء والتسليم</a>.
          </p>
        </div>
      </section>

      <section style="margin-bottom: 36px;">
        <h2 style="font-size: 1.4rem; font-weight: 700; color: #f8fafc; margin-bottom: 16px;">أسئلة شائعة عن كلاش ماركت</h2>
        ${faqHtml}
      </section>

      <div style="text-align: center; margin-top: 36px;">
        <a class="cta" href="/clash-of-clans" style="margin-left: 12px;">قريات كلاش أوف كلانس</a>
        <a class="cta" href="/clash-royale" style="background: #2563eb; color: #fff; margin-left: 12px;">حسابات كلاش رويال</a>
        <a class="cta" href="/blog" style="background: #334155; color: #f8fafc;">مدونة كلاش ماركت</a>
      </div>
    </article>
  `;

  res.set("Content-Type", "text/html; charset=utf-8");
  res.send(pageShell({
    title,
    description,
    canonicalPath: "/about",
    bodyHtml,
    jsonLd,
  }));
});

export default router;

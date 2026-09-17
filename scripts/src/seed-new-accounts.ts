import { db, accountsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export const allNewAccounts = [
  // ==========================================
  // Clash Royale Accounts
  // ==========================================
  {
    title: "حساب كلاش رويال ليفل 12 مع 142 إيموت و15+ سكن برج نادر — Clash Royale",
    slug: "cr-level12-up02q8jr",
    game: "clash-royale",
    price: "250.00",
    oldPrice: "320.00",
    images: [
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789657386/IMG-20260917-WA0104_ztrfcu.jpg",
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789657386/IMG-20260917-WA0106_oh9cdg.jpg",
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789657385/IMG-20260917-WA0107_m0g60z.jpg",
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789657402/IMG-20260917-WA0108_bh4nnj.jpg"
    ],
    description: `حساب كلاش رويال مميز ليفل 12 (تاغ #UP02Q8JR) مع مخزون تعبيرات وسكنات أسطورية للبيع عبر متجر كلاش ماركت.
🔹 المواصفات والمميزات: مستوى البرج 12 | أكثر من 4,125 انتصار في المعارك | 1,030 جوهرة جاهزة للاستخدام.
🔹 التعبيرات والسكنات: 142 تعبير (Emotes) نادر وحصري بإطارات لامعة ومميزة + أكثر من 15 سكن برج (Tower Skins) أسطوري من مواسم كلاش السابقة.
🔹 التطويرات والموارد: 42 قطعة تطور قوات وبواسل (فالكيري) | 8/8 جرعات ترقية سحرية (Max) | 21,744 نقطة نجوم (Star Points) | 53 شظية تجارة.
🔹 الأمان والضمان: نقل رسمي وآمن لحساب Supercell ID بالكامل وتغيير الإيميل الأساسي وتأمين الحماية برقمك مع الضمان الذهبي المعتمد ضد السحب.
🔹 التسليم والدفع: تسليم فوري وتواصل مباشر خلال 5 إلى 15 دقيقة عبر الواتساب، والدفع متاح عبر التحويل البنكي السعودي والتقسيط عبر تابي وتمارا.`,
    status: "available",
    townHall: null,
    arena: "الساحة الأسطورية (Legendary Arena)",
    trophies: 6500,
    heroes: null,
    gems: 1030,
    skins: "15+ سكن برج نادر وحصري (Tower Skins)",
    league: "دوري المنافسين",
    evolutions: "تطويرات بواسل متقدمة وقطع فالكيري إيفو (42 قطعة)",
    emotes: "142 تعبير نادر وحصري بإطارات متوهجة",
    maxCards: 25,
    whatsappMessage: "حساب كلاش رويال ليفل 12 تاغ UP02Q8JR بسعر 250",
    featured: true
  },
  {
    title: "حساب كلاش رويال ليفل 16 فل ماكس ليفل النخبة مع 33 ألف جوهرة — Clash Royale Elite",
    slug: "cr-level16-max-8qgvcq99g",
    game: "clash-royale",
    price: "400.00",
    oldPrice: "550.00",
    images: [
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789657367/IMG-20260917-WA0114_iqwxdb.jpg",
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789657366/IMG-20260917-WA0115_sruxp6.jpg",
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789657366/IMG-20260917-WA0116_ihirao.jpg",
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789657366/IMG-20260917-WA0117_cyvl78.jpg",
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789657366/IMG-20260917-WA0118_kfpmo1.jpg"
    ],
    description: `حساب كلاش رويال أسطوري ليفل 16 فل ماكس (Elite Level 16) مع ثروة هائلة من الجواهر للبيع عبر متجر كلاش ماركت.
🔹 القوة والمواصفات: مستوى الملك والأبراج 16 (الحد الأقصى) | تشكيلة قتالية كاملة ليفل 16 إيليت ماكس (انفرنو دراجون إيفو، زاب إيفو، جيش الهياكل إيفو، العملاق الكهربائي، البرق) | أكثر من 6,370 فوز في المعارك.
🔹 ثروة الموارد والجواهر: 33,160 جوهرة خضراء (قيمة الجواهر وحدها تفوق سعر الحساب بمراحل!) + 63,255 عملة ذهبية + 138,593 نقطة نجوم + 1,085,900 رمز نجمي ذهبي.
🔹 التعبيرات والعناصر السحرية: 154 تعبير نادر وحصري بتأثيرات بصرية متوهجة | 8/8 جرعات ترقية ماكس | 21 بطاقة جوكر أسطورية (تجاوز الحد الأقصى) | 193 بطاقة جوكر ملحمية | 4 بطاقات جوكر أبطال | 176 شظية تجارة.
🔹 الأمان والضمان: نقل ملكية رسمي وفوري لبريد Supercell ID المسجل مع تفعيل التحقق بخطوتين والضمان الذهبي الشامل مدى الحياة.
🔹 التسليم والدفع: تسليم سريع ومباشر عبر الواتساب، متاح تحويل بنكي لكافة البنوك السعودية والخليجية والتقسيط عبر تابي وتمارا.`,
    status: "available",
    townHall: null,
    arena: "الساحة الأسطورية (Legendary Arena)",
    trophies: 9000,
    heroes: null,
    gems: 33160,
    skins: "أبراج ليفل 16 ماكس النخبة ومجموعات سكنات حصرية",
    league: "دوري الأبطال الأعظم (Ultimate Champion)",
    evolutions: "تشكيلة إيفو متطورة (انفرنو دراجون، زاب، سكيليتون أرمي)",
    emotes: "154 تعبير نادر وأسطوري بإطارات لامعة",
    maxCards: 50,
    whatsappMessage: "حساب كلاش رويال ليفل 16 ماكس 33 ألف جوهرة بسعر 400",
    featured: true
  },

  // ==========================================
  // Clash of Clans Accounts (Town Hall 18)
  // ==========================================
  {
    title: "قرية كلاش أوف كلانس تاون هول 18 ليفل 263 — TH18",
    slug: "coc-th18-l263",
    game: "clash-of-clans",
    price: "490.00",
    oldPrice: "590.00",
    images: [
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789645537/IMG-20260917-WA0037_wjz5il.jpg",
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789645537/IMG-20260917-WA0038_rh0rwr.jpg",
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789645538/IMG-20260917-WA0039_haj7lo.jpg",
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789645538/IMG-20260917-WA0040_ikjoyi.jpg",
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789645539/IMG-20260917-WA0041_sezej2.jpg",
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789645539/IMG-20260917-WA0042_dq7y9p.jpg"
    ],
    description: `قرية كلاش أوف كلانس تاون هول 18 (TH18) ليفل 263 متطورة ومميزة للبيع عبر متجر كلاش ماركت.
🔹 المواصفات: تاون هول 18 | ليفل القرية: 263 | دفاعات وجيوش متقدمة جاهزة لحروب الكلانات ودوري CWL.
🔹 الأبطال: الملك 95 | الملكة 95 | الآمر 70 | البطلة الملكية 45 مع معدات قتالية مطورة.
🔹 الأمان والضمان: تسليم فوري ونقل رسمي لبريد Supercell ID وتفعيل الحماية برقم جوالك مع وثيقة الضمان الذهبي ضد السحب.
🔹 الدفع والتسليم: تسليم مباشر عبر الواتساب، ومتاح تحويل بنكي سعودي وخيارات التقسيط الميسر.`,
    status: "available",
    townHall: 18,
    arena: null,
    trophies: 5120,
    heroes: "الملك 95 | الملكة 95 | الآمر 70 | البطلة 45",
    gems: 2850,
    skins: "سكنات أبطال مميزة ومؤثرات خاصة",
    league: "دوري الأساطير (Legend League)",
    evolutions: null,
    emotes: null,
    maxCards: null,
    whatsappMessage: "قرية كلاش تاون 18 ليفل 263 سعر 490",
    featured: false
  },
  {
    title: "قرية كلاش أوف كلانس تاون هول 18 ليفل 257 — TH18",
    slug: "coc-th18-l257",
    game: "clash-of-clans",
    price: "550.00",
    oldPrice: "580.00",
    images: [
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789645541/IMG-20260917-WA0032_xsmeck.jpg",
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789645540/IMG-20260917-WA0029_dv1y4m.jpg",
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789645541/IMG-20260917-WA0030_n3vnp9.jpg",
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789645541/IMG-20260917-WA0031_lzibgy.jpg",
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789645542/IMG-20260917-WA0033_zy9lrl.jpg",
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789645540/IMG-20260917-WA0034_rsae3i.jpg",
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789645540/IMG-20260917-WA0035_fubaof.jpg",
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789645539/IMG-20260917-WA0036_djysp3.jpg"
    ],
    description: `قرية كلاش أوف كلانس تاون هول 18 (TH18) ليفل 257 للبيع عبر متجر كلاش ماركت بسعر اقتصادي منافس.
🔹 المواصفات: تاون هول 18 | ليفل القرية: 257 | أسوار متقدمة وتشكيلات هجومية قوية جاهزة للهجوم المباشر.
🔹 الأبطال: الملك 92 | الملكة 95 | الآمر 68 | البطلة الملكية 44.
🔹 الأمان والضمان: فحص شامل ونقل ملكية Supercell ID بالكامل وتغيير الإيميل الأساسي مع الضمان الذهبي مدى الحياة.
🔹 الدفع والتسليم: تسليم فوري وتواصل مباشر خطوة بخطوة عبر الواتساب.`,
    status: "available",
    townHall: 18,
    arena: null,
    trophies: 4950,
    heroes: "الملك 92 | الملكة 95 | الآمر 68 | البطلة 44",
    gems: 1950,
    skins: "مجموعة سكنات كلاش المشهورة وتصاميم مميزة",
    league: "دوري التايتن I (Titan League I)",
    evolutions: null,
    emotes: null,
    maxCards: null,
    whatsappMessage: "قرية كلاش تاون 18 ليفل 257 سعر 550",
    featured: false
  },
  {
    title: "قرية كلاش أوف كلانس تاون هول 18 ليفل عالي بسعر 580 ريال — TH18",
    slug: "coc-th18-l580",
    game: "clash-of-clans",
    price: "580.00",
    oldPrice: "690.00",
    images: [
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789645550/IMG-20260917-WA0004_rvihmq.jpg",
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789645548/IMG-20260917-WA0005_vrstbr.jpg",
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789645549/IMG-20260917-WA0006_awvo8q.jpg",
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789645549/IMG-20260917-WA0007_qs6rif.jpg",
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789645550/IMG-20260917-WA0008_d84nkp.jpg",
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789645549/IMG-20260917-WA0009_esi2az.jpg",
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789645548/IMG-20260917-WA0010_vn9uny.jpg"
    ],
    description: `قرية كلاش أوف كلانس تاون هول 18 (TH18) شبه ماكس ليفل عالي للبيع عبر متجر كلاش ماركت.
🔹 المواصفات: تاون هول 18 | ليفل عالي وقوي | دفاعات ثقيلة متطورة وتصاميم حرب أسطورية ضد المسح.
🔹 الأبطال: الملك 95 | الملكة 95 | الآمر 70 | البطلة الملكية 45 مع أسلحة أسطورية.
🔹 الأمان والضمان: نقل ملكية Supercell ID كامل مع تفعيل الحماية وتغيير البريد والضمان الذهبي المعتمد.
🔹 التسليم والدفع: تسليم سريع ومباشر 5-15 دقيقة عبر الواتساب وخيارات دفع ميسرة.`,
    status: "available",
    townHall: 18,
    arena: null,
    trophies: 5300,
    heroes: "الملك 95 | الملكة 95 | الآمر 70 | البطلة 45",
    gems: 3400,
    skins: "سكنات أبطال نادرة ومناظر قري أسطورية",
    league: "دوري الأساطير (Legend League)",
    evolutions: null,
    emotes: null,
    maxCards: null,
    whatsappMessage: "قرية كلاش تاون 18 عرض 580 ريال",
    featured: true
  },
  {
    title: "قرية كلاش أوف كلانس تاون هول 18 فل ماكس ليفل 270 أسطورية — TH18 Max",
    slug: "coc-th18-max-l270",
    game: "clash-of-clans",
    price: "850.00",
    oldPrice: "990.00",
    images: [
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789645547/IMG-20260917-WA0011_xbqj0e.jpg",
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789645547/IMG-20260917-WA0012_ruu31f.jpg",
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789645547/IMG-20260917-WA0013_qlj2cx.jpg",
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789645548/IMG-20260917-WA0014_gpxisc.jpg",
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789645545/IMG-20260917-WA0015_gkqz8h.jpg",
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789645545/IMG-20260917-WA0016_bak0yz.jpg",
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789645545/IMG-20260917-WA0017_d7v9bp.jpg",
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789645546/IMG-20260917-WA0018_skxggo.jpg",
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789645545/IMG-20260917-WA0019_o27zms.jpg",
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789645544/IMG-20260917-WA0020_yoyvhl.jpg",
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789645546/IMG-20260917-WA0021_xvj4fq.jpg",
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789645543/IMG-20260917-WA0022_xrt3lm.jpg",
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789645546/IMG-20260917-WA0023_kbkbns.jpg",
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789645543/IMG-20260917-WA0024_deydwq.jpg",
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789645542/IMG-20260917-WA0025_njmx1m.jpg",
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789645544/IMG-20260917-WA0026_cxttpq.jpg",
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789645544/IMG-20260917-WA0027_mntqyx.jpg",
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789645542/IMG-20260917-WA0028_pdi0fe.jpg"
    ],
    description: `قرية كلاش أوف كلانس تاون هول 18 فل ماكس أسطورية (TH18 Full Max) ليفل 270 بأعلى المواصفات للبيع عبر متجر كلاش ماركت.
🔹 المواصفات: تاون هول 18 فل ماكس بالكامل | ليفل الحساب: 270 | 18 صورة تفصيلية لجميع الدفاعات والجيش والأبطال.
🔹 الأبطال: أبطال ماكس بالكامل بأعلى مستوى ممكن مع كافة المعدات القتالية المطورة وسكنات حصرية نادرة.
🔹 الأمان والضمان: فحص دقيق بنسبة 100%، نقل ملكية رسمي لحساب Supercell ID، وتأمين برقم الهاتف مع الضمان الذهبي الدائم.
🔹 التسليم والدفع: تسليم فوري خلال دقائق عبر الواتساب مع خيارات الدفع والتقسيط عبر تابي وتمارا.`,
    status: "available",
    townHall: 18,
    arena: null,
    trophies: 5650,
    heroes: "أبطال ماكس بالكامل (95 / 95 / 70 / 45) بأعلى مستوى",
    gems: 5200,
    skins: "تشكيلة متكاملة من السكنات الحصرية النادرة ومناظر القرية",
    league: "دوري الأساطير (Legend League)",
    evolutions: null,
    emotes: null,
    maxCards: null,
    whatsappMessage: "قرية كلاش تاون 18 فل ماكس ليفل 270 سعر 850",
    featured: true
  }
];

async function seed() {
  console.log("🔄 جاري إدراج/تحديث الحسابات الجديدة في قاعدة البيانات...");

  for (const acc of allNewAccounts) {
    const existing = await db
      .select({ id: accountsTable.id })
      .from(accountsTable)
      .where(eq(accountsTable.slug, acc.slug))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(accountsTable)
        .set(acc)
        .where(eq(accountsTable.slug, acc.slug));
      console.log(`🔄 تم تحديث الحساب: ${acc.title}`);
    } else {
      await db.insert(accountsTable).values(acc);
      console.log(`✅ تم إضافة الحساب بنجاح: ${acc.title}`);
    }
  }

  console.log("🎉 تم حفظ جميع الحسابات بنجاح في قاعدة البيانات!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ خطأ أثناء الإدراج:", err);
  process.exit(1);
});

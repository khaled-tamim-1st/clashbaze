import { db, accountsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const newAccounts = [
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
    trophies: 5120,
    heroes: "الملك 95 | الملكة 95 | الآمر 70 | البطلة 45",
    gems: 2850,
    skins: "سكنات أبطال مميزة ومؤثرات خاصة",
    league: "دوري الأساطير (Legend League)",
    whatsappMessage: "قرية كلاش تاون 18 ليفل 263 سعر 490",
    featured: false
  },
  {
    title: "قرية كلاش أوف كلانس تاون هول 18 ليفل 257 — TH18",
    slug: "coc-th18-l257",
    game: "clash-of-clans",
    price: "450.00",
    oldPrice: "540.00",
    images: [
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789645540/IMG-20260917-WA0029_dv1y4m.jpg",
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789645541/IMG-20260917-WA0030_n3vnp9.jpg",
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789645541/IMG-20260917-WA0031_lzibgy.jpg",
      "https://res.cloudinary.com/doorrysnw/image/upload/v1789645541/IMG-20260917-WA0032_xsmeck.jpg",
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
    trophies: 4950,
    heroes: "الملك 92 | الملكة 95 | الآمر 68 | البطلة 44",
    gems: 1950,
    skins: "مجموعة سكنات كلاش المشهورة وتصاميم مميزة",
    league: "دوري التايتن I (Titan League I)",
    whatsappMessage: "قرية كلاش تاون 18 ليفل 257 سعر 450",
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
    trophies: 5300,
    heroes: "الملك 95 | الملكة 95 | الآمر 70 | البطلة 45",
    gems: 3400,
    skins: "سكنات أبطال نادرة ومناظر قري أسطورية",
    league: "دوري الأساطير (Legend League)",
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
    trophies: 5650,
    heroes: "أبطال ماكس بالكامل (95 / 95 / 70 / 45) بأعلى مستوى",
    gems: 5200,
    skins: "تشكيلة متكاملة من السكنات الحصرية النادرة ومناظر القرية",
    league: "دوري الأساطير (Legend League)",
    whatsappMessage: "قرية كلاش تاون 18 فل ماكس ليفل 270 سعر 850",
    featured: true
  }
];

async function seed() {
  console.log("🔄 جاري إدراج الحسابات الأربعة الجديدة في قاعدة البيانات...");

  for (const acc of newAccounts) {
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
      console.log(`🔄 تم تحديث الحساب الحالي: ${acc.title}`);
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

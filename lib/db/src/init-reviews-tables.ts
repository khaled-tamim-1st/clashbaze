import { pool } from "./index";

export async function initReviewsTable(): Promise<void> {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS "reviews" (
      "id" SERIAL PRIMARY KEY,
      "customer_name" VARCHAR(255) NOT NULL,
      "rating" INTEGER NOT NULL,
      "comment" TEXT NOT NULL,
      "game" VARCHAR(50),
      "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
      "admin_reply" TEXT,
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  try {
    await pool.query(createTableQuery);

    // If table is empty, seed with initial approved reviews
    const countRes = await pool.query(`SELECT COUNT(*) FROM "reviews"`);
    const count = parseInt(countRes.rows[0].count, 10);

    if (count === 0) {
      const seedQuery = `
        INSERT INTO "reviews" ("customer_name", "rating", "comment", "game", "status", "created_at")
        VALUES 
          ('سعود الشمري', 5, 'شريت حساب تاون هول 16 ماكس، التسليم كان فوري والدعم الفني قمة في الأخلاق والاحترافية. أنصح بالتعامل وبشدة!', 'clash-of-clans', 'approved', NOW() - INTERVAL '1 day'),
          ('عبدالله المطيري', 5, 'أفضل متجر كلاش في السعودية بلا منازع. نقل الإيميل تم بدقائق مع كامل إثباتات الشراء وأكواد الدعم.', 'clash-of-clans', 'approved', NOW() - INTERVAL '2 days'),
          ('محمد الدوسري', 5, 'شريت حساب كلاش رويال ليفل 16 إيفوليوشن ماكس، التعامل راقي والتسليم فوري على الواتساب. مصداقية 100% وتستاهلون كل خير.', 'clash-royale', 'approved', NOW() - INTERVAL '3 days'),
          ('فيصل الحربي', 5, 'تجربة شراء ممتازة وسلسة. وفروا لي وسيلة دفع مريحة بالتقسيط عبر تابي، وسلّموني بيانات السوبر سيل كاملة مع أكواد الاسترداد.', 'clash-of-clans', 'approved', NOW() - INTERVAL '4 days'),
          ('خالد العنزي', 5, 'كنت متخوف في البداية من الشراء أونلاين، لكن الضمان الذهبي وسرعة الرد طمّنتني. حساب تاون 17 ممتاز والعتاد كامل. شكراً كلاش ماركت!', 'clash-of-clans', 'approved', NOW() - INTERVAL '5 days');
      `;
      await pool.query(seedQuery);
      console.log("Seeded initial approved reviews into database.");
    }
  } catch (err) {
    console.error("Failed to initialize or seed reviews table:", err);
  }
}

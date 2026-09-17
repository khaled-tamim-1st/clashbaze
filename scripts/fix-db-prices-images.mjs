import { db, accountsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function run() {
  console.log("Fixing accounts in DB...");

  // 1. coc-th18-l257
  const [acc257] = await db.select().from(accountsTable).where(eq(accountsTable.slug, "coc-th18-l257"));
  if (acc257) {
    let imgs = [...(acc257.images || [])];
    const targetIdx = imgs.findIndex((img) => img.includes("WA0032"));
    if (targetIdx > 0) {
      const [target] = imgs.splice(targetIdx, 1);
      imgs.unshift(target);
    }
    await db
      .update(accountsTable)
      .set({
        price: "550.00",
        oldPrice: "580.00",
        images: imgs,
      })
      .where(eq(accountsTable.slug, "coc-th18-l257"));
    console.log("Updated coc-th18-l257 to 550.00 / 580.00, first image:", imgs[0]);
  }

  // 2. coc-th18-l256
  const [acc256] = await db.select().from(accountsTable).where(eq(accountsTable.slug, "coc-th18-l256"));
  if (acc256) {
    let imgs256 = [...(acc256.images || [])];
    const targetIdx256 = imgs256.findIndex((img) => img.includes("WA0010"));
    if (targetIdx256 > 0) {
      const [target] = imgs256.splice(targetIdx256, 1);
      imgs256.unshift(target);
    }
    await db
      .update(accountsTable)
      .set({
        images: imgs256,
      })
      .where(eq(accountsTable.slug, "coc-th18-l256"));
    console.log("Updated coc-th18-l256 first image:", imgs256[0]);
  }

  console.log("Done fixing DB.");
  process.exit(0);
}

run().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});

import { db, accountsTable } from "../../lib/db/src/index.ts";
import { eq } from "drizzle-orm";

async function updateAllAccountDescriptions() {
  console.log("🔄 جاري الاتصال بقاعدة البيانات واسترجاع الحسابات...");

  const allAccounts = await db.select().from(accountsTable);
  console.log(`📊 تم العثور على ${allAccounts.length} حساب في قاعدة البيانات.`);

  let updatedCount = 0;

  for (const account of allAccounts) {
    const isCoc = account.game === "clash-of-clans";
    
    // تفاصيل إضافية إن وُجدت
    const extraDetails: string[] = [];
    if (isCoc) {
      if (account.townHall) extraDetails.push(`تاون هول ${account.townHall}`);
      if (account.heroes) extraDetails.push(`الأبطال: ${account.heroes}`);
      if (account.gems) extraDetails.push(`الجواهر: ${account.gems}`);
      if (account.skins) extraDetails.push(`السكنات: ${account.skins}`);
      if (account.league) extraDetails.push(`الدوري: ${account.league}`);
    } else {
      if (account.arena) extraDetails.push(`الساحة: ${account.arena}`);
      if (account.evolutions) extraDetails.push(`التطويرات: ${account.evolutions}`);
      if (account.maxCards) extraDetails.push(`الكروت ماكس: ${account.maxCards}`);
      if (account.emotes) extraDetails.push(`الإيموتات: ${account.emotes}`);
    }

    const detailsLine = extraDetails.length > 0
      ? `🔹 تفاصيل ومواصفات: ${extraDetails.join(" | ")}`
      : `🔹 مواصفات الحساب: ${account.title} بكامل التطويرات والمميزات.`;

    const newDescription = isCoc
      ? `قرية كلاش أوف كلانس ${account.townHall ? `تاون هول ${account.townHall}` : "ماكس"} مميزة للبيع عبر متجر كلاش ماركت الموثوق في السعودية والخليج.
${detailsLine}
🔹 الأمان والضمان: نقل ملكية السوبر سيل آيدي (Supercell ID) وتغيير البريد الإلكتروني فورياً بأمان 100% مع ضمان شامل ضد السحب والاسترجاع.
🔹 التسليم: تسليم فوري ومباشر خلال 5 إلى 15 دقيقة عبر الواتساب مع دعم فني مستمر.
🔹 طرق الدفع: مدى، تابي، تمارا للتقسيط، Apple Pay، وتحويل بنكي سعودي وخليجي مباشر.`
      : `حساب كلاش رويال ${account.arena ? `ساحة ${account.arena}` : "مميز"} للبيع عبر متجر كلاش ماركت في السعودية ودول الخليج.
${detailsLine}
🔹 الأمان والضمان: نقل رسمي لحساب سوبر سيل آيدي مع ضمان كامل لحقوق المشتري وسرية تامة.
🔹 التسليم: تسليم فوري وسريع ومباشر عبر الواتساب.
🔹 طرق الدفع: مدى، تابي، تمارا، وApple Pay.`;

    await db
      .update(accountsTable)
      .set({ description: newDescription })
      .where(eq(accountsTable.id, account.id));

    updatedCount++;
    console.log(`✅ [${updatedCount}/${allAccounts.length}] تم تحديث وصف الحساب: "${account.title}"`);
  }

  console.log(`\n🎉 اكتمل التحديث بنجاح! تم تحديث أوصاف ${updatedCount} حساب في قاعدة البيانات.`);
  process.exit(0);
}

updateAllAccountDescriptions().catch((err) => {
  console.error("❌ حدث خطأ أثناء تحديث قاعدة البيانات:", err);
  process.exit(1);
});

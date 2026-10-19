import { db, accountsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { logger } from "./logger";

// Configuration
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8749591269:AAHje4y08V_upNGA4vC1H-CjXXc1Mgvo9Po";
const CLOUD_NAME = process.env.VITE_CLOUDINARY_CLOUD_NAME || "doorrysnw";
const UPLOAD_PRESET = process.env.VITE_CLOUDINARY_UPLOAD_PRESET || "clash_base_upload";
const ADMIN_SECRET = process.env.TELEGRAM_ADMIN_SECRET || "clash2026admin";
const SITE_URL = process.env.SITE_URL || "https://www.clashmarket.online";

// Format Cloudinary URLs to modern web standards (f_auto, q_auto)
export function formatCloudinaryUrl(url: string | undefined | null): string {
  if (!url) return "";
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    let formatted = url.replace(/\.(heic|heif)$/i, ".jpg");
    if (!formatted.includes("/f_auto") && !formatted.includes("/q_auto")) {
      formatted = formatted.replace("/upload/", "/upload/f_auto,q_auto/");
    }
    return formatted;
  }
  return url;
}

// Authorized admin chat IDs set
const authorizedChatIds = new Set<number>();

// Parse pre-configured admin IDs if any
if (process.env.TELEGRAM_ADMIN_IDS) {
  for (const idStr of process.env.TELEGRAM_ADMIN_IDS.split(",")) {
    const parsed = parseInt(idStr.trim(), 10);
    if (!isNaN(parsed) && parsed > 0) {
      authorizedChatIds.add(parsed);
    }
  }
}

// Wizard state types
export type WizardStep =
  | "IDLE"
  | "AWAITING_PASSWORD"
  | "AWAITING_GAME"
  | "AWAITING_TOWN_HALL"
  | "AWAITING_STATUS_TYPE"
  | "AWAITING_PRICE"
  | "AWAITING_OLD_PRICE"
  | "AWAITING_TITLE"
  | "AWAITING_DESCRIPTION"
  | "AWAITING_PHOTOS"
  | "CONFIRMATION";

export interface AccountDraft {
  game?: "clash-of-clans" | "clash-royale";
  townHall?: number;
  arena?: string;
  statusType?: string;
  price?: string;
  oldPrice?: string | null;
  title?: string;
  description?: string;
  images: string[];
}

export interface UserSession {
  step: WizardStep;
  data: AccountDraft;
  lastActive: number;
}

// In-memory sessions map (keyed by Telegram chatId)
const sessions = new Map<number, UserSession>();

function getSession(chatId: number): UserSession {
  let session = sessions.get(chatId);
  if (!session) {
    session = {
      step: "IDLE",
      data: { images: [] },
      lastActive: Date.now(),
    };
    sessions.set(chatId, session);
  }
  session.lastActive = Date.now();
  return session;
}

function resetSession(chatId: number) {
  sessions.set(chatId, {
    step: "IDLE",
    data: { images: [] },
    lastActive: Date.now(),
  });
}

// Helper to send Telegram requests
async function tgApi(method: string, body: Record<string, any>): Promise<any> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return (await res.json()) as any;
  } catch (err) {
    logger.error({ err, method }, "Telegram API call failed");
    return { ok: false, error: err };
  }
}

// Persistent main keyboard
const MAIN_KEYBOARD = {
  keyboard: [
    [{ text: "➕ إضافة حساب جديد" }, { text: "📦 إدارة وتحديث الحسابات" }],
    [{ text: "📊 إحصائيات المتجر" }, { text: "❌ إلغاء العملية" }],
  ],
  resize_keyboard: true,
};

// Send main menu
async function sendMainMenu(chatId: number, message = "اختر ما ترغب بالقيام به من القائمة أدناه:") {
  await tgApi("sendMessage", {
    chat_id: chatId,
    text: `👑 <b>لوحة تحكم كلاش ماركت</b> 🛡️\n\n${message}`,
    parse_mode: "HTML",
    reply_markup: MAIN_KEYBOARD,
  });
}

// Upload buffer to Cloudinary
export async function uploadImageToCloudinary(imageBuffer: Uint8Array, filename = "telegram_photo.jpg"): Promise<string | null> {
  try {
    const blob = new Blob([Buffer.from(imageBuffer)], { type: "image/jpeg" });
    const formData = new FormData();
    formData.append("file", blob, filename);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", "clashmarket/accounts");

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      logger.error({ errText }, "Cloudinary upload failed from bot");
      return null;
    }

    const data = (await response.json()) as { secure_url?: string };
    if (!data.secure_url) return null;
    return formatCloudinaryUrl(data.secure_url);
  } catch (err) {
    logger.error({ err }, "Error uploading to Cloudinary in bot");
    return null;
  }
}

// Download file buffer from Telegram
async function downloadTelegramFile(filePath: string): Promise<Uint8Array | null> {
  try {
    const url = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } catch (err) {
    logger.error({ err, filePath }, "Failed to download Telegram file");
    return null;
  }
}

// Generate unique SEO slug
export function generateSlug(game: string, townHall?: number, title?: string): string {
  const prefix = game === "clash-of-clans" ? "coc" : "cr";
  const level = townHall ? `th${townHall}` : "acc";
  const random = Math.random().toString(36).substring(2, 6);
  const time = Date.now().toString().slice(-4);
  return `${prefix}-${level}-${random}-${time}`;
}

// Start Add Account Wizard
async function startAddAccount(chatId: number) {
  const session = getSession(chatId);
  session.step = "AWAITING_GAME";
  session.data = { images: [] };

  await tgApi("sendMessage", {
    chat_id: chatId,
    text: "🎮 <b>الخطوة 1 من 7: اختر اللعبة</b>\n\nحدد اللعبة التي ينتمي إليها الحساب:",
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [
          { text: "⚔️ كلاش أوف كلانس", callback_data: "game_coc" },
          { text: "👑 كلاش رويال", callback_data: "game_cr" },
        ],
        [{ text: "❌ إلغاء", callback_data: "cancel_wizard" }],
      ],
    },
  });
}

// Handle Update
export async function handleTelegramUpdate(update: any) {
  try {
    // 1. Handle Callback Queries (Inline Buttons)
    if (update.callback_query) {
      const cb = update.callback_query;
      const chatId = cb.message?.chat?.id;
      const data = cb.data;

      if (!chatId) return;

      // Answer callback query quickly to dismiss loading state
      await tgApi("answerCallbackQuery", { callback_query_id: cb.id });

      // Verify admin
      if (!authorizedChatIds.has(chatId)) {
        await tgApi("sendMessage", {
          chat_id: chatId,
          text: "🔒 يرجى إدخال كلمة مرور الإدارة أولاً لتفعيل صلاحياتك.",
        });
        return;
      }

      const session = getSession(chatId);

      // Global cancel button
      if (data === "cancel_wizard") {
        resetSession(chatId);
        await tgApi("sendMessage", {
          chat_id: chatId,
          text: "❌ تم إلغاء العملية.",
          reply_markup: MAIN_KEYBOARD,
        });
        return;
      }

      // Step: Select Game
      if (data === "game_coc" || data === "game_cr") {
        session.data.game = data === "game_coc" ? "clash-of-clans" : "clash-royale";
        session.step = "AWAITING_TOWN_HALL";

        if (session.data.game === "clash-of-clans") {
          await tgApi("sendMessage", {
            chat_id: chatId,
            text: "🏰 <b>الخطوة 2 من 7: مستوى التاون هول (Town Hall)</b>\n\nاختر من الأزرار أو اكتب الرقم مباشرة (مثال: 16):",
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "TH 18 ⚡", callback_data: "th_18" },
                  { text: "TH 17 🌟", callback_data: "th_17" },
                  { text: "TH 16 🏰", callback_data: "th_16" },
                ],
                [
                  { text: "TH 15 ⚔️", callback_data: "th_15" },
                  { text: "TH 14 🛡️", callback_data: "th_14" },
                  { text: "TH 13 أو أقل", callback_data: "th_13" },
                ],
                [{ text: "❌ إلغاء", callback_data: "cancel_wizard" }],
              ],
            },
          });
        } else {
          await tgApi("sendMessage", {
            chat_id: chatId,
            text: "👑 <b>الخطوة 2 من 7: الساحة أو مستوى الملك</b>\n\nأرسل اسم الساحة أو المستوى كتابة (مثال: <code>ساحة 15</code> أو <code>King 14</code>):",
            parse_mode: "HTML",
          });
        }
        return;
      }

      // Step: TH Selected via Button
      if (data.startsWith("th_")) {
        const thVal = parseInt(data.replace("th_", ""), 10);
        session.data.townHall = thVal;
        session.step = "AWAITING_STATUS_TYPE";

        await tgApi("sendMessage", {
          chat_id: chatId,
          text: `🏰 تم تحديد تاون هول: <b>TH ${thVal}</b>\n\n<b>الخطوة 3 من 7: حالة التطوير</b>\nاختر نوع الحساب:`,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                { text: "🌟 ماكس بالكامل (Max)", callback_data: "status_max" },
                { text: "⚡ شبه ماكس (Semi-Max)", callback_data: "status_semi" },
              ],
              [
                { text: "🛡️ متقدم قوي", callback_data: "status_adv" },
                { text: "🎮 عادي", callback_data: "status_norm" },
              ],
            ],
          },
        });
        return;
      }

      // Step: Status Type Selected
      if (data.startsWith("status_")) {
        const typeMap: Record<string, string> = {
          status_max: "ماكس بالكامل",
          status_semi: "شبه ماكس",
          status_adv: "متقدم وقوي",
          status_norm: "متوسط",
        };
        session.data.statusType = typeMap[data] || "ماكس";
        session.step = "AWAITING_PRICE";

        await tgApi("sendMessage", {
          chat_id: chatId,
          text: "💰 <b>الخطوة 4 من 7: سعر البيع</b>\n\nأرسل سعر الحساب بالريال السعودي (أرقام فقط، مثال: <code>450</code>):",
          parse_mode: "HTML",
        });
        return;
      }

      // Step: Skip Old Price
      if (data === "skip_old_price") {
        session.data.oldPrice = null;
        await promptTitle(chatId, session);
        return;
      }

      // Step: Confirm Suggested Title
      if (data === "confirm_title") {
        await promptDescription(chatId, session);
        return;
      }

      // Step: Skip Description
      if (data === "skip_desc") {
        session.data.description = generateDefaultDescription(session.data);
        await promptPhotos(chatId, session);
        return;
      }

      // Step: Photos Done
      if (data === "photos_done") {
        if (!session.data.images || session.data.images.length === 0) {
          await tgApi("sendMessage", {
            chat_id: chatId,
            text: "⚠️ لم تقم بإرسال أي صور بعد! الرجاء إرسال صورة واحدة على الأقل قبل المتابعة.",
          });
          return;
        }

        session.step = "CONFIRMATION";
        const gameLabel = session.data.game === "clash-of-clans" ? "كلاش أوف كلانس" : "كلاش رويال";
        const levelLabel = session.data.townHall ? `تاون هول ${session.data.townHall}` : (session.data.arena || "عام");

        const previewText =
          `📋 <b>مراجعة بيانات الحساب قبل النشر:</b>\n` +
          `──────────────────\n` +
          `🎮 <b>اللعبة:</b> ${gameLabel}\n` +
          `🏰 <b>المستوى:</b> ${levelLabel}\n` +
          `🏷️ <b>العنوان:</b> ${session.data.title}\n` +
          `💰 <b>السعر:</b> ${session.data.price} ر.س ${session.data.oldPrice ? `<i>(السابق: ${session.data.oldPrice} ر.س)</i>` : ""}\n` +
          `📸 <b>عدد الصور المرفوعة:</b> ${session.data.images.length} صور على Cloudinary\n` +
          `📝 <b>الوصف:</b> ${session.data.description?.slice(0, 100)}...\n` +
          `──────────────────\n` +
          `اضغط <b>نشر الآن</b> لعرض الحساب فوراً على الموقع الحي 🚀`;

        await tgApi("sendMessage", {
          chat_id: chatId,
          text: previewText,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [{ text: "🚀 نشر الحساب في الموقع الآن", callback_data: "publish_now" }],
              [{ text: "❌ إلغاء", callback_data: "cancel_wizard" }],
            ],
          },
        });
        return;
      }

      // Step: Publish Account Now!
      if (data === "publish_now") {
        await publishAccount(chatId, session);
        return;
      }

      // Management actions
      if (data.startsWith("manage_acc_")) {
        const accId = parseInt(data.replace("manage_acc_", ""), 10);
        const [acc] = await db.select().from(accountsTable).where(eq(accountsTable.id, accId)).limit(1);
        if (!acc) {
          await tgApi("sendMessage", { chat_id: chatId, text: "❌ الحساب غير موجود." });
          return;
        }

        const isAvail = acc.status === "available";
        await tgApi("sendMessage", {
          chat_id: chatId,
          text: `📦 <b>إدارة الحساب #${acc.id}:</b>\n\nالعنوان: ${acc.title}\nالسعر: ${acc.price} ر.س\nالحالة الحالية: <b>${isAvail ? "🟢 متاح" : "🔴 تم البيع"}</b>`,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                isAvail
                  ? { text: "🏷️ تحويل إلى (تم البيع)", callback_data: `mark_sold_${acc.id}` }
                  : { text: "🟢 إعادة تنشيط (متاح)", callback_data: `mark_avail_${acc.id}` },
              ],
              [{ text: "🗑️ حذف الحساب", callback_data: `delete_acc_${acc.id}` }],
              [{ text: "🔙 رجوع", callback_data: "back_to_menu" }],
            ],
          },
        });
        return;
      }

      if (data.startsWith("mark_sold_")) {
        const accId = parseInt(data.replace("mark_sold_", ""), 10);
        await db.update(accountsTable).set({ status: "sold" }).where(eq(accountsTable.id, accId));
        await tgApi("sendMessage", {
          chat_id: chatId,
          text: `✅ تم تغيير حالة الحساب #${accId} إلى <b>(تم البيع)</b> بنجاح!`,
          parse_mode: "HTML",
          reply_markup: MAIN_KEYBOARD,
        });
        return;
      }

      if (data.startsWith("mark_avail_")) {
        const accId = parseInt(data.replace("mark_avail_", ""), 10);
        await db.update(accountsTable).set({ status: "available" }).where(eq(accountsTable.id, accId));
        await tgApi("sendMessage", {
          chat_id: chatId,
          text: `✅ تم تغيير حالة الحساب #${accId} إلى <b>(متاح)</b> بنجاح!`,
          parse_mode: "HTML",
          reply_markup: MAIN_KEYBOARD,
        });
        return;
      }

      if (data.startsWith("delete_acc_")) {
        const accId = parseInt(data.replace("delete_acc_", ""), 10);
        await db.delete(accountsTable).where(eq(accountsTable.id, accId));
        await tgApi("sendMessage", {
          chat_id: chatId,
          text: `🗑️ تم حذف الحساب #${accId} نهائياً من قاعدة البيانات والموقع.`,
          reply_markup: MAIN_KEYBOARD,
        });
        return;
      }

      if (data === "back_to_menu") {
        await sendMainMenu(chatId);
        return;
      }
    }

    // 2. Handle Text & Photo Messages
    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat?.id;
      const text = msg.text?.trim() || "";

      if (!chatId) return;

      // Handle Authentication check
      if (!authorizedChatIds.has(chatId)) {
        if (text === ADMIN_SECRET) {
          authorizedChatIds.add(chatId);
          await tgApi("sendMessage", {
            chat_id: chatId,
            text: "✅ <b>تم التحقق وتفعيل حسابك كأدمن بنجاح!</b>\n\nأهلاً بك في لوحة تحكم كلاش ماركت عبر تيليجرام 🛡️",
            parse_mode: "HTML",
            reply_markup: MAIN_KEYBOARD,
          });
          return;
        }

        await tgApi("sendMessage", {
          chat_id: chatId,
          text: "🔒 <b>مرحباً بك في بوت إدارة كلاش ماركت (@clashmarket_checker_bot)</b>\n\nهذا البوت محمي ومخصص لإدارة المتجر فقط.\n\nالرجاء إدخال كلمة مرور الإدارة لتفعيل صلاحياتك:",
          parse_mode: "HTML",
        });
        return;
      }

      const session = getSession(chatId);

      // Handle main menu button commands
      if (text === "/start" || text === "/menu" || text === "القائمة الرئيسية") {
        resetSession(chatId);
        await sendMainMenu(chatId, "أهلاً بك! تفضل باختيار العملية المطلوبة:");
        return;
      }

      if (text === "❌ إلغاء العملية" || text === "/cancel") {
        resetSession(chatId);
        await tgApi("sendMessage", {
          chat_id: chatId,
          text: "❌ تم إلغاء العملية الحالية.",
          reply_markup: MAIN_KEYBOARD,
        });
        return;
      }

      if (text === "➕ إضافة حساب جديد" || text === "/add") {
        await startAddAccount(chatId);
        return;
      }

      if (text === "📊 إحصائيات المتجر" || text === "/stats") {
        await showStoreStats(chatId);
        return;
      }

      if (text === "📦 إدارة وتحديث الحسابات" || text === "/manage") {
        await showManageAccounts(chatId);
        return;
      }

      // Handle Step: AWAITING_TOWN_HALL (typed by user)
      if (session.step === "AWAITING_TOWN_HALL") {
        if (session.data.game === "clash-of-clans") {
          const num = parseInt(text.replace(/[^\d]/g, ""), 10);
          if (isNaN(num) || num < 1 || num > 30) {
            await tgApi("sendMessage", {
              chat_id: chatId,
              text: "⚠️ يرجى إدخال رقم تاون هول صحيح (مثال: 16 أو 17):",
            });
            return;
          }
          session.data.townHall = num;
        } else {
          session.data.arena = text;
        }

        session.step = "AWAITING_STATUS_TYPE";
        await tgApi("sendMessage", {
          chat_id: chatId,
          text: "<b>الخطوة 3 من 7: حالة التطوير</b>\nاختر نوع الحساب:",
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                { text: "🌟 ماكس بالكامل (Max)", callback_data: "status_max" },
                { text: "⚡ شبه ماكس (Semi-Max)", callback_data: "status_semi" },
              ],
              [
                { text: "🛡️ متقدم قوي", callback_data: "status_adv" },
                { text: "🎮 عادي", callback_data: "status_norm" },
              ],
            ],
          },
        });
        return;
      }

      // Handle Step: AWAITING_PRICE
      if (session.step === "AWAITING_PRICE") {
        const cleanPrice = text.replace(/[^\d.]/g, "");
        const priceNum = parseFloat(cleanPrice);
        if (isNaN(priceNum) || priceNum <= 0) {
          await tgApi("sendMessage", {
            chat_id: chatId,
            text: "⚠️ يرجى إدخال رقم سعر صحيح (أرقام فقط، مثال: <code>450</code>):",
            parse_mode: "HTML",
          });
          return;
        }

        session.data.price = cleanPrice;
        session.step = "AWAITING_OLD_PRICE";

        await tgApi("sendMessage", {
          chat_id: chatId,
          text: `💰 تم حفظ السعر: <b>${cleanPrice} ر.س</b>\n\n<b>الخطوة 5 من 7: السعر قبل الخصم (اختياري)</b>\nهل يوجد سعر قديم لشطبه؟ أرسل الرقم أو اضغط تخطي:`,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [[{ text: "تخطي ⏭️", callback_data: "skip_old_price" }]],
          },
        });
        return;
      }

      // Handle Step: AWAITING_OLD_PRICE
      if (session.step === "AWAITING_OLD_PRICE") {
        const cleanOld = text.replace(/[^\d.]/g, "");
        const oldNum = parseFloat(cleanOld);
        if (!isNaN(oldNum) && oldNum > 0) {
          session.data.oldPrice = cleanOld;
        } else {
          session.data.oldPrice = null;
        }

        await promptTitle(chatId, session);
        return;
      }

      // Handle Step: AWAITING_TITLE
      if (session.step === "AWAITING_TITLE") {
        session.data.title = text;
        await promptDescription(chatId, session);
        return;
      }

      // Handle Step: AWAITING_DESCRIPTION
      if (session.step === "AWAITING_DESCRIPTION") {
        session.data.description = text;
        await promptPhotos(chatId, session);
        return;
      }

      // Handle Step: AWAITING_PHOTOS (receiving photos)
      if (session.step === "AWAITING_PHOTOS") {
        if (msg.photo && Array.isArray(msg.photo) && msg.photo.length > 0) {
          const highestPhoto = msg.photo[msg.photo.length - 1];
          await handleIncomingPhoto(chatId, session, highestPhoto.file_id);
          return;
        }

        if (text === "تم" || text === "خلاص" || text === "نشر") {
          // If user types text instead of clicking button
          if (session.data.images.length > 0) {
            session.step = "CONFIRMATION";
            await promptPhotosDone(chatId, session);
            return;
          }
        }

        await tgApi("sendMessage", {
          chat_id: chatId,
          text: "📸 الرجاء إرسال صورة أو عدة صور للحساب.\n(أو اضغط زر 'تم الانتهاء' إذا رفعت الصور بالفعل).",
          reply_markup: {
            inline_keyboard: [[{ text: "✅ تم الانتهاء من إرسال الصور", callback_data: "photos_done" }]],
          },
        });
        return;
      }

      // Default reply
      await sendMainMenu(chatId);
    }
  } catch (err) {
    logger.error({ err }, "Error handling Telegram update");
  }
}

// Prompt Title
async function promptTitle(chatId: number, session: UserSession) {
  session.step = "AWAITING_TITLE";
  let suggested = "";
  if (session.data.game === "clash-of-clans") {
    suggested = `حساب كلاش أوف كلانس تاون هول ${session.data.townHall || 16} ${session.data.statusType || "ماكس"}`;
  } else {
    suggested = `حساب كلاش رويال ${session.data.arena || "مميز"} ${session.data.statusType || "قوي"}`;
  }
  session.data.title = suggested;

  await tgApi("sendMessage", {
    chat_id: chatId,
    text:
      `🏷️ <b>الخطوة 6 من 7: عنوان الحساب</b>\n\n` +
      `العنوان المقترح:\n<code>${suggested}</code>\n\n` +
      `اضغط زر <b>اعتماد العنوان</b> أو أرسل عنوانك المخصص كتابة:`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [{ text: "✅ اعتماد هذا العنوان المقترح", callback_data: "confirm_title" }],
        [{ text: "❌ إلغاء", callback_data: "cancel_wizard" }],
      ],
    },
  });
}

// Prompt Description
async function promptDescription(chatId: number, session: UserSession) {
  session.step = "AWAITING_DESCRIPTION";
  await tgApi("sendMessage", {
    chat_id: chatId,
    text:
      `📝 <b>الخطوة 7 من 7: مواصفات ووصف الحساب</b>\n\n` +
      `أرسل تفاصيل ومميزات الحساب (الأبطال، الدفاعات، السكنات، نوع البريد، إلخ).\n\n` +
      `أو اضغط <b>تخطي / وصف تلقائي</b> لاستخدام وصف قياسي جذاب وموثوق:`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [{ text: "تخطي / وصف تلقائي ⏭️", callback_data: "skip_desc" }],
        [{ text: "❌ إلغاء", callback_data: "cancel_wizard" }],
      ],
    },
  });
}

// Generate Default Description
function generateDefaultDescription(data: AccountDraft): string {
  if (data.game === "clash-of-clans") {
    return (
      `حساب كلاش أوف كلانس تاون هول ${data.townHall || 16} ${data.statusType || "ماكس"} مميز وقوي جداً.\n` +
      `• دفاعات وجدران مطورة بالكامل وجاهزة للحروب ودوري الأساطير.\n` +
      `• أبطال ومعدات أبطال بمستويات متقدمة وسكنات حصرية.\n` +
      `• تسليم يدوي فوري مع نقل كامل لملكية السوبر سيل آيدي (Supercell ID) وتأمين الحساب 100% مع ضمان المتجر الذهبي.`
    );
  }
  return (
    `حساب كلاش رويال ${data.arena || "ساحة أساطير"} ${data.statusType || "قوي"} بمستوى بطاقات وتطويرات متقدمة.\n` +
    `• تشكيلات ماكس وايموتات نادرة.\n` +
    `• تسليم رسمي فوري ونقل آمن عبر الواتساب مع ضمان المتجر الشامل.`
  );
}

// Prompt Photos
async function promptPhotos(chatId: number, session: UserSession) {
  session.step = "AWAITING_PHOTOS";
  await tgApi("sendMessage", {
    chat_id: chatId,
    text:
      `📸 <b>مرحلة رفع الصور:</b>\n\n` +
      `أرسل الآن صور الحساب (يمكنك إرسال صورة أو عدة صور كألبوم دفعة واحدة).\n\n` +
      `⚡ <i>سيقوم البوت بضغط الصور ورفعها على Cloudinary فوراً.</i>\n\n` +
      `عند الانتهاء من إرسال الصور، اضغط على زر <b>[✅ تم الانتهاء من إرسال الصور]</b> بالأسفل.`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [{ text: "✅ تم الانتهاء من إرسال الصور", callback_data: "photos_done" }],
        [{ text: "❌ إلغاء", callback_data: "cancel_wizard" }],
      ],
    },
  });
}

// Handle Single Incoming Photo
async function handleIncomingPhoto(chatId: number, session: UserSession, fileId: string) {
  const currentCount = session.data.images.length + 1;

  // Send status
  const statusMsg = await tgApi("sendMessage", {
    chat_id: chatId,
    text: `⏳ جارٍ ضغط ورفع الصورة رقم (${currentCount}) على Cloudinary...`,
  });

  // 1. Get file path from Telegram
  const fileInfo = await tgApi("getFile", { file_id: fileId });
  if (!fileInfo.ok || !fileInfo.result?.file_path) {
    await tgApi("sendMessage", {
      chat_id: chatId,
      text: "❌ فشل في تحميل الصورة من خوادم تيليجرام. يرجى المحاولة مرة أخرى.",
    });
    return;
  }

  // 2. Download file buffer
  const buffer = await downloadTelegramFile(fileInfo.result.file_path);
  if (!buffer) {
    await tgApi("sendMessage", {
      chat_id: chatId,
      text: "❌ فشل في قراءة بيانات الصورة.",
    });
    return;
  }

  // 3. Upload to Cloudinary
  const cdnUrl = await uploadImageToCloudinary(buffer, `acc_${Date.now()}_${currentCount}.jpg`);
  if (!cdnUrl) {
    await tgApi("sendMessage", {
      chat_id: chatId,
      text: "❌ تعذر رفع الصورة إلى Cloudinary. يرجى التحقق وإعادة الإرسال.",
    });
    return;
  }

  // 4. Save to session
  session.data.images.push(cdnUrl);

  // 5. Update status
  if (statusMsg?.result?.message_id) {
    await tgApi("editMessageText", {
      chat_id: chatId,
      message_id: statusMsg.result.message_id,
      text: `✅ تم رفع الصورة رقم (${session.data.images.length}) بنجاح إلى Cloudinary!\n\nأرسل صورة أخرى أو اضغط الزر أدناه عند الانتهاء:`,
      reply_markup: {
        inline_keyboard: [
          [{ text: `✅ تم الانتهاء من إرسال الصور (${session.data.images.length})`, callback_data: "photos_done" }],
          [{ text: "❌ إلغاء", callback_data: "cancel_wizard" }],
        ],
      },
    });
  }
}

// Prompt Photos Done / Preview
async function promptPhotosDone(chatId: number, session: UserSession) {
  const gameLabel = session.data.game === "clash-of-clans" ? "كلاش أوف كلانس" : "كلاش رويال";
  const levelLabel = session.data.townHall ? `تاون هول ${session.data.townHall}` : (session.data.arena || "عام");

  const previewText =
    `📋 <b>مراجعة بيانات الحساب قبل النشر:</b>\n` +
    `──────────────────\n` +
    `🎮 <b>اللعبة:</b> ${gameLabel}\n` +
    `🏰 <b>المستوى:</b> ${levelLabel}\n` +
    `🏷️ <b>العنوان:</b> ${session.data.title}\n` +
    `💰 <b>السعر:</b> ${session.data.price} ر.س ${session.data.oldPrice ? `<i>(السابق: ${session.data.oldPrice} ر.س)</i>` : ""}\n` +
    `📸 <b>عدد الصور المرفوعة:</b> ${session.data.images.length} صور على Cloudinary\n` +
    `📝 <b>الوصف:</b> ${session.data.description?.slice(0, 100)}...\n` +
    `──────────────────\n` +
    `اضغط <b>نشر الحساب في الموقع الآن</b> لتأكيد النشر 🚀`;

  await tgApi("sendMessage", {
    chat_id: chatId,
    text: previewText,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [{ text: "🚀 نشر الحساب في الموقع الآن", callback_data: "publish_now" }],
        [{ text: "❌ إلغاء", callback_data: "cancel_wizard" }],
      ],
    },
  });
}

// Final Publish Action
async function publishAccount(chatId: number, session: UserSession) {
  try {
    const slug = generateSlug(session.data.game || "clash-of-clans", session.data.townHall, session.data.title);

    const [account] = await db
      .insert(accountsTable)
      .values({
        title: session.data.title || "حساب كلاش أوف كلانس",
        slug,
        game: session.data.game || "clash-of-clans",
        price: String(session.data.price || "0"),
        oldPrice: session.data.oldPrice ? String(session.data.oldPrice) : null,
        townHall: session.data.townHall || null,
        arena: session.data.arena || null,
        description: session.data.description || null,
        images: session.data.images,
        status: "available",
        featured: false,
        whatsappMessage: session.data.title || null,
      })
      .returning();

    const accountUrl = `${SITE_URL}/account/${account.slug}`;

    const successMsg =
      `🎉 <b>ألف مبروك! تم نشر الحساب بنجاح في المتجر</b> 🚀\n\n` +
      `🆔 <b>رقم الحساب:</b> #${account.id}\n` +
      `🏷️ <b>العنوان:</b> ${account.title}\n` +
      `💰 <b>السعر:</b> ${account.price} ر.س\n` +
      `📸 <b>عدد الصور:</b> ${account.images.length} صور\n` +
      `🟢 <b>الحالة:</b> متاح للبيع فوراً\n\n` +
      `🌐 <b>رابط الحساب الحي على الموقع:</b>\n` +
      `<a href="${accountUrl}">${accountUrl}</a>`;

    await tgApi("sendMessage", {
      chat_id: chatId,
      text: successMsg,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "👁️ فتح الحساب على الموقع", url: accountUrl }],
          [{ text: "➕ إضافة حساب آخر", callback_data: "game_coc" }],
        ],
      },
    });

    // Reset session back to idle
    resetSession(chatId);
  } catch (err) {
    logger.error({ err }, "Failed to publish account from bot");
    await tgApi("sendMessage", {
      chat_id: chatId,
      text: "❌ حدث خطأ أثناء حفظ الحساب في قاعدة البيانات. يرجى المحاولة مرة أخرى.",
      reply_markup: MAIN_KEYBOARD,
    });
  }
}

// Show Store Stats
async function showStoreStats(chatId: number) {
  try {
    const all = await db.select().from(accountsTable);
    const total = all.length;
    const available = all.filter((a) => a.status === "available").length;
    const sold = all.filter((a) => a.status === "sold").length;
    const coc = all.filter((a) => a.game === "clash-of-clans").length;
    const cr = all.filter((a) => a.game === "clash-royale").length;

    const statsText =
      `📊 <b>إحصائيات متجر كلاش ماركت:</b>\n` +
      `──────────────────\n` +
      `📦 <b>إجمالي الحسابات:</b> ${total}\n` +
      `🟢 <b>الحسابات المتاحة:</b> ${available}\n` +
      `🔴 <b>الحسابات المباعة:</b> ${sold}\n` +
      `⚔️ <b>كلاش أوف كلانس:</b> ${coc}\n` +
      `👑 <b>كلاش رويال:</b> ${cr}\n` +
      `──────────────────`;

    await tgApi("sendMessage", {
      chat_id: chatId,
      text: statsText,
      parse_mode: "HTML",
      reply_markup: MAIN_KEYBOARD,
    });
  } catch (err) {
    logger.error({ err }, "Failed to fetch stats in bot");
  }
}

// Show Manage Accounts
async function showManageAccounts(chatId: number) {
  try {
    const recent = await db
      .select({
        id: accountsTable.id,
        title: accountsTable.title,
        status: accountsTable.status,
        price: accountsTable.price,
      })
      .from(accountsTable)
      .orderBy(desc(accountsTable.createdAt))
      .limit(6);

    if (recent.length === 0) {
      await tgApi("sendMessage", {
        chat_id: chatId,
        text: "📦 لا توجد حسابات حالياً في المتجر.",
        reply_markup: MAIN_KEYBOARD,
      });
      return;
    }

    const inlineKeyboard = recent.map((acc) => [
      {
        text: `#${acc.id} ${acc.title.slice(0, 24)} (${acc.status === "available" ? "🟢 متاح" : "🔴 مباع"})`,
        callback_data: `manage_acc_${acc.id}`,
      },
    ]);

    await tgApi("sendMessage", {
      chat_id: chatId,
      text: "📦 <b>أحدث الحسابات في المتجر:</b>\nاضغط على أي حساب لتعديل حالته إلى (تم البيع) أو حذفه:",
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: inlineKeyboard,
      },
    });
  } catch (err) {
    logger.error({ err }, "Failed to fetch accounts for management in bot");
  }
}

// Long-polling worker
let isPolling = false;

export async function startTelegramBot() {
  if (isPolling) return;
  isPolling = true;

  logger.info("🤖 Starting Telegram Bot polling service...");

  let offset = 0;

  // Background loop
  (async () => {
    while (isPolling) {
      try {
        const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${offset}&timeout=25`, {
          signal: AbortSignal.timeout(35000),
        });

        if (!res.ok) {
          await new Promise((r) => setTimeout(r, 4000));
          continue;
        }

        const data = (await res.json()) as { ok: boolean; result?: any[] };
        if (data.ok && Array.isArray(data.result)) {
          for (const update of data.result) {
            offset = update.update_id + 1;
            await handleTelegramUpdate(update);
          }
        }
      } catch (err: any) {
        // Sleep on error before retrying
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  })().catch((err) => {
    logger.error({ err }, "Telegram bot loop encountered fatal error");
  });
}

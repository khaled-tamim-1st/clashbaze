import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * تحويل وتحسين روابط Cloudinary تلقائياً (تحويل HEIC إلى JPG/WebP وضبط الجودة)
 */
export function formatImageUrl(url: string | undefined | null): string {
  if (!url) return "";
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    // 1. استبدال امتداد .heic / .heif بـ .jpg
    let formatted = url.replace(/\.(heic|heif)$/i, ".jpg");
    // 2. إضافة f_auto,q_auto لتحويل وضغط الصورة تلقائياً حسب نوع المتصفح
    if (!formatted.includes("/f_auto") && !formatted.includes("/q_auto")) {
      formatted = formatted.replace("/upload/", "/upload/f_auto,q_auto/");
    }
    return formatted;
  }
  return url;
}


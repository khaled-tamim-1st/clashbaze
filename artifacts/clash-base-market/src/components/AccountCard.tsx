import { Account, AccountStatus } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

import { formatImageUrl } from "@/lib/utils";
import { TrackedWhatsAppLink } from "@/components/TrackedWhatsAppLink";
import { useCurrency } from "@/contexts/CurrencyContext";

export function AccountCard({ account }: { account: Account }) {
  const { formatPrice } = useCurrency();
  const priceFormatted = formatPrice(account.price);
  const message = `أريد شراء حساب ${account.whatsappMessage || account.title} (${priceFormatted})`;
  const isRoyale = account.game === "clash-royale";

  return (
    <Card className={`overflow-hidden bg-card border-border hover:border-primary transition-all duration-300 group ${account.status === "sold" ? "opacity-90 hover:opacity-100" : ""}`}>
      <div className={`relative overflow-hidden ${isRoyale ? "aspect-[3/4] bg-slate-950" : "aspect-video bg-muted"}`}>
        {account.images && account.images.length > 0 ? (
          <>
            {isRoyale && (
              <img
                aria-hidden="true"
                src={formatImageUrl(account.images[0])}
                alt=""
                className="absolute inset-0 w-full h-full object-cover blur-md scale-110 opacity-30 pointer-events-none"
              />
            )}
            <img 
              loading="lazy"
              src={formatImageUrl(account.images[0])} 
              alt={account.title} 
              className={`relative w-full h-full ${isRoyale ? "object-contain" : "object-cover"} group-hover:scale-105 transition-transform duration-500`}
            />
          </>
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">لا توجد صورة</div>
        )}
        {account.status === "sold" && (
          <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
            <span className="bg-red-600 text-white font-extrabold text-sm px-4 py-1.5 rounded-lg shadow-xl border border-red-400/50 transform -rotate-6 tracking-wide">
              تم البيع
            </span>
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-2">
  {account.status === "available" && (
    <Badge
      className="
        bg-gradient-to-r from-violet-600 to-purple-500
        text-white
        border border-violet-300/30
        shadow-[0_0_15px_rgba(139,92,246,0.55)]
        hover:shadow-[0_0_22px_rgba(139,92,246,0.75)]
        transition-all duration-300
      "
    >
      متاح
    </Badge>
  )}

  {account.status === "reserved" && (
    <Badge
      className="
        bg-gradient-to-r from-fuchsia-600 to-purple-600
        text-white
        border border-fuchsia-300/30
        shadow-[0_0_15px_rgba(217,70,239,0.5)]
        hover:shadow-[0_0_22px_rgba(217,70,239,0.7)]
        transition-all duration-300
      "
    >
      محجوز
    </Badge>
  )}

  {account.status === "sold" && (
    <Badge
      className="
        bg-red-600 hover:bg-red-700
        text-white font-bold
        border border-red-400/50
        shadow-[0_0_12px_rgba(239,68,68,0.5)]
        transition-all duration-300
      "
    >
      تم البيع
    </Badge>
  )}
</div>
        {account.oldPrice && (
  <div className="absolute top-2 left-2">
    <Badge
      className="
        bg-gradient-to-r from-violet-600 to-purple-500
        text-white
        border border-pink-300/30
        shadow-[0_0_12px_rgba(244,63,94,0.45)]
        font-semibold
      "
    >
      خصم {Math.round(((account.oldPrice - account.price) / account.oldPrice) * 100)}%
    </Badge>
  </div>
)}
        
        <div className="absolute bottom-2 right-2">
  <Badge
    className={
      account.game === "clash-of-clans"
        ? `
          bg-blue-600/30
          backdrop-blur-md
          text-blue-200
          border border-blue-400/40
          shadow-[0_0_12px_rgba(59,130,246,0.35)]
          hover:bg-blue-600/40
          transition-all duration-300
          font-semibold
        `
        : `
          bg-purple-600/30
          backdrop-blur-md
          text-purple-200
          border border-purple-400/40
          shadow-[0_0_12px_rgba(168,85,247,0.4)]
          hover:bg-purple-600/40
          transition-all duration-300
          font-semibold
        `
    }
  >
    {account.game === "clash-of-clans"
      ? "كلاش أوف كلانس"
      : "كلاش رويال"}
  </Badge>
  </div>
</div>
      <CardContent className="p-4">
        <Link href={`/account/${account.slug}`}>
          <h3 className="font-bold text-lg text-foreground hover:text-primary transition-colors line-clamp-1">{account.title}</h3>
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-primary">{formatPrice(account.price)}</span>
            {account.oldPrice && (
              <span className="text-sm text-muted-foreground line-through">{formatPrice(account.oldPrice)}</span>
            )}
          </div>
          {account.game === "clash-of-clans" && account.townHall && (
            <div className="flex items-center justify-center bg-secondary rounded-md px-3 py-1">
              <span className="text-sm font-medium text-secondary-foreground">TH {account.townHall}</span>
            </div>
          )}
          {account.game === "clash-royale" && account.arena && (
            <div className="flex items-center justify-center bg-secondary rounded-md px-3 py-1">
              <span className="text-sm font-medium text-secondary-foreground">{account.arena}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button asChild variant={account.status === "sold" ? "secondary" : "default"} className={`w-full ${account.status === "sold" ? "bg-muted text-foreground hover:bg-muted/80" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}>
          <TrackedWhatsAppLink
            cta="product_card"
            accountId={account.id}
            accountSlug={account.slug}
            text={account.status === "sold" ? `مرحباً، أستفسر عن توفر حساب مشابه لـ ${account.whatsappMessage || account.title} (${priceFormatted})` : message}
            target="_blank"
            rel="noopener noreferrer"
          >
            {account.status === "sold" ? "طلب حساب مشابه" : "تواصل واتساب"}
          </TrackedWhatsAppLink>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href={`/account/${account.slug}`}>التفاصيل</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
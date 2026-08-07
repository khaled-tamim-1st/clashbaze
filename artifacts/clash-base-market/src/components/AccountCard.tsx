import { Account, AccountStatus } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function AccountCard({ account }: { account: Account }) {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "";
  const message = `أريد شراء حساب ${account.whatsappMessage || account.title}`;
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <Card className="overflow-hidden bg-card border-border hover:border-primary transition-colors duration-300 group">
      <div className="relative aspect-video overflow-hidden">
        {account.images && account.images.length > 0 ? (
          <img 
            loading="lazy"
            src={account.images[0]} 
            alt={account.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">لا توجد صورة</div>
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
        bg-gradient-to-r from-purple-950 to-violet-900
        text-white
        border border-violet-400/30
        shadow-[0_0_12px_rgba(109,40,217,0.45)]
        hover:shadow-[0_0_18px_rgba(109,40,217,0.65)]
        transition-all duration-300
      "
    >
      مباع
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
          bg-blue-500/15
          backdrop-blur-md
          text-black
          border border-blue-400/40
          shadow-[0_0_12px_rgba(59,130,246,0.35)]
          hover:bg-blue-500/25
          transition-all duration-300
        `
        : `
          bg-purple-500/15
          backdrop-blur-md
          text-gray-800
          border border-purple-400/40
          shadow-[0_0_12px_rgba(168,85,247,0.4)]
          hover:bg-purple-500/25
          transition-all duration-300
        `
    }
  >
    {account.game === "clash-of-clans"
      ? "كلاش أوف كلانز"
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
            <span className="text-xl font-bold text-primary">{account.price.toLocaleString("ar-SA")} ر.س</span>
            {account.oldPrice && (
              <span className="text-sm text-muted-foreground line-through">{account.oldPrice.toLocaleString("ar-SA")} ر.س</span>
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
        <Button asChild variant="default" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer">تواصل واتساب</a>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href={`/account/${account.slug}`}>التفاصيل</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
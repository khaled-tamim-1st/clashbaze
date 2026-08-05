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
          {account.status === "available" && <Badge className="bg-green-500 hover:bg-green-600 text-white">متاح</Badge>}
          {account.status === "reserved" && <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">محجوز</Badge>}
          {account.status === "sold" && <Badge className="bg-red-500 hover:bg-red-600 text-white">مباع</Badge>}
        </div>
        {account.oldPrice && (
          <div className="absolute top-2 left-2">
            <Badge variant="destructive">
              خصم {Math.round(((account.oldPrice - account.price) / account.oldPrice) * 100)}%
            </Badge>
          </div>
        )}
        <div className="absolute bottom-2 right-2">
          <Badge variant="secondary" className={account.game === "clash-of-clans" ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}>
            {account.game === "clash-of-clans" ? "كلاش أوف كلانز" : "كلاش رويال"}
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
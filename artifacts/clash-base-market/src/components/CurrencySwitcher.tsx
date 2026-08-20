import { useCurrency } from "@/contexts/CurrencyContext";
import { Button } from "@/components/ui/button";
import { DollarSign, Coins } from "lucide-react";

export function CurrencySwitcher({ className = "" }: { className?: string }) {
  const { currency, toggleCurrency } = useCurrency();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleCurrency}
      className={`h-9 px-3 gap-2 border-border/80 bg-background/80 hover:bg-accent hover:text-accent-foreground rounded-full transition-all duration-200 shadow-sm cursor-pointer ${className}`}
      title={currency === "SAR" ? "التبديل إلى الدولار الأمريكي ($ USD)" : "التبديل إلى الريال السعودي (ر.س SAR)"}
      aria-label="تبديل العملة"
    >
      {currency === "SAR" ? (
        <>
          <span className="flex items-center gap-1.5 font-bold text-xs text-emerald-500">
            <Coins className="w-3.5 h-3.5" />
            <span>ر.س</span>
          </span>
          <span className="text-[10px] text-muted-foreground font-normal">| $ USD</span>
        </>
      ) : (
        <>
          <span className="flex items-center gap-1.5 font-bold text-xs text-amber-500">
            <DollarSign className="w-3.5 h-3.5" />
            <span>USD $</span>
          </span>
          <span className="text-[10px] text-muted-foreground font-normal">| ر.س</span>
        </>
      )}
    </Button>
  );
}

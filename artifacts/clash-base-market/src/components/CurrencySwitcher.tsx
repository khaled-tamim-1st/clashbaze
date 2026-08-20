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
      className={`h-9 px-3.5 gap-2 rounded-xl font-bold text-xs transition-all duration-300 cursor-pointer shadow-sm active:scale-95 bg-primary/15 border-primary/35 text-primary hover:bg-primary/25 hover:border-primary/60 hover:text-primary ${className}`}
      title={
        currency === "SAR"
          ? "العملة الحالية: ريال سعودي (اضغط للتبديل إلى الدولار)"
          : "العملة الحالية: دولار أمريكي (اضغط للتبديل إلى الريال)"
      }
      aria-label="تبديل العملة"
    >
      {currency === "SAR" ? (
        <span className="flex items-center gap-1.5">
          <Coins className="w-4 h-4 text-primary" />
          <span>ريال سعودي (SAR)</span>
        </span>
      ) : (
        <span className="flex items-center gap-1.5">
          <DollarSign className="w-4 h-4 text-primary" />
          <span>USD ($)</span>
        </span>
      )}
    </Button>
  );
}

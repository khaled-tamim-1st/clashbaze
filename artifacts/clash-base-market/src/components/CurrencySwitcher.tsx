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
      className={`h-9 px-3.5 gap-2 rounded-xl font-bold text-xs transition-all duration-300 cursor-pointer shadow-sm active:scale-95 bg-purple-950/40 border-purple-500/40 text-white hover:bg-purple-900/50 hover:border-purple-400/60 shadow-[0_0_12px_rgba(168,85,247,0.2)] ${className}`}
      title={
        currency === "SAR"
          ? "العملة الحالية: ريال سعودي (اضغط للتبديل إلى الدولار)"
          : "العملة الحالية: دولار أمريكي (اضغط للتبديل إلى الريال)"
      }
      aria-label="تبديل العملة"
    >
      {currency === "SAR" ? (
        <span className="flex items-center gap-1.5">
          <Coins className="w-4 h-4 text-purple-400" />
          <span className="text-white font-bold">ريال سعودي (SAR)</span>
        </span>
      ) : (
        <span className="flex items-center gap-1.5">
          <DollarSign className="w-4 h-4 text-purple-400" />
          <span className="text-white font-bold">USD ($)</span>
        </span>
      )}
    </Button>
  );
}

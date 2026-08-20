import React, { createContext, useContext, useState, useEffect } from "react";

export type Currency = "SAR" | "USD";

// سعر صرف الريال السعودي مقابل الدولار (سعر الصرف الرسمي الثابت 1 USD = 3.75 SAR)
export const SAR_TO_USD_RATE = 3.75;

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  toggleCurrency: () => void;
  formatPrice: (priceInSAR: number | string | null | undefined) => string;
  getRawPrice: (priceInSAR: number | string | null | undefined) => { amount: number; symbol: string; currency: Currency };
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    try {
      const saved = localStorage.getItem("clashmarket_currency");
      if (saved === "USD" || saved === "SAR") {
        return saved;
      }
    } catch {
      // fallback
    }
    return "SAR";
  });

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem("clashmarket_currency", c);
    } catch {
      // ignore
    }
  };

  const toggleCurrency = () => {
    setCurrency(currency === "SAR" ? "USD" : "SAR");
  };

  /**
   * تحويل وتنسيق السعر بناءً على العملة المختارة مع رفع الكسور والفكة لأقرب رقم صحيح للأعلى (Math.ceil)
   */
  const formatPrice = (priceInSAR: number | string | null | undefined): string => {
    if (priceInSAR === null || priceInSAR === undefined || priceInSAR === "") return "";
    const num = Number(priceInSAR);
    if (isNaN(num)) return String(priceInSAR);

    if (currency === "USD") {
      // رفع الفكة والكسور لأعلى رقم صحيح (Ceil)
      const usdAmount = Math.ceil(num / SAR_TO_USD_RATE);
      return `$${usdAmount} USD`;
    }

    return `${num.toLocaleString("ar-SA")} ر.س`;
  };

  const getRawPrice = (priceInSAR: number | string | null | undefined) => {
    const num = Number(priceInSAR || 0);
    if (currency === "USD") {
      return {
        amount: Math.ceil(num / SAR_TO_USD_RATE),
        symbol: "$",
        currency: "USD" as Currency,
      };
    }
    return {
      amount: num,
      symbol: "ر.س",
      currency: "SAR" as Currency,
    };
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        toggleCurrency,
        formatPrice,
        getRawPrice,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}

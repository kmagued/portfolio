"use client";

import { createContext, useContext, useState, useEffect } from "react";
import type { Currency } from "@/types/database";

const currencies: Currency[] = ["EGP", "USD", "EUR"];

interface CurrencyCtx {
  baseCurrency: Currency;
  setBaseCurrency: (c: Currency) => void;
  rates: Record<string, number> | null;
  toBase: (amount: number, from: Currency) => number;
}

const CurrencyContext = createContext<CurrencyCtx>({
  baseCurrency: "EGP",
  setBaseCurrency: () => {},
  rates: null,
  toBase: (a) => a,
});

export const useCurrency = () => useContext(CurrencyContext);
export { currencies };

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [baseCurrency, setBaseCurrency] = useState<Currency>("EGP");
  const [rates, setRates] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/USD")
      .then((r) => r.json())
      .then((d) => { if (d.rates) setRates(d.rates); })
      .catch(() => {});
  }, []);

  const toBase = (amount: number, from: Currency): number => {
    if (!rates || from === baseCurrency) return amount;
    const fromRate = rates[from] || 1;
    const toRate = rates[baseCurrency] || 1;
    return (amount / fromRate) * toRate;
  };

  return (
    <CurrencyContext.Provider value={{ baseCurrency, setBaseCurrency, rates, toBase }}>
      {children}
    </CurrencyContext.Provider>
  );
}

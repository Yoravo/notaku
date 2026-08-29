export type SupportedCurrency = "IDR" | "USD" | "SGD" | "EUR";

export interface CurrencyConfig {
  code: SupportedCurrency;
  symbol: string;
  name: string;
  prefix: string;
  decimalPlaces: number;
}

export const CURRENCY_MAP: Record<SupportedCurrency, CurrencyConfig> = {
  IDR: {
    code: "IDR",
    symbol: "Rp",
    name: "Rupiah (IDR)",
    prefix: "Rp",
    decimalPlaces: 0,
  },
  USD: {
    code: "USD",
    symbol: "$",
    name: "US Dollar (USD)",
    prefix: "$",
    decimalPlaces: 2,
  },
  SGD: {
    code: "SGD",
    symbol: "S$",
    name: "Singapore Dollar (SGD)",
    prefix: "S$",
    decimalPlaces: 2,
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    name: "Euro (EUR)",
    prefix: "€",
    decimalPlaces: 2,
  },
};

export const SUPPORTED_CURRENCIES: SupportedCurrency[] = ["IDR", "USD", "SGD", "EUR"];

/**
 * Format currency value with symbol based on currency code
 */
export function formatMoney(amount: number, currency: SupportedCurrency | string = "IDR"): string {
  const code = (currency?.toUpperCase() as SupportedCurrency) || "IDR";
  const conf = CURRENCY_MAP[code] || CURRENCY_MAP.IDR;

  const num = Number(amount) || 0;

  if (code === "IDR") {
    const parts = Math.round(num).toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `Rp${parts[0]}`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: code,
    minimumFractionDigits: conf.decimalPlaces,
    maximumFractionDigits: conf.decimalPlaces,
  }).format(num);
}

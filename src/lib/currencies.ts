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

/** Format currency value using the selected UI locale. */
export function formatMoney(
  amount: number,
  currency: SupportedCurrency | string = "IDR",
  locale: "id" | "en" = "id",
): string {
  const requestedCode = currency?.toUpperCase() as SupportedCurrency;
  if (!CURRENCY_MAP[requestedCode]) {
    console.warn(`[formatMoney] Unsupported currency ${JSON.stringify(currency)}; using IDR`);
  }
  const code = CURRENCY_MAP[requestedCode] ? requestedCode : "IDR";
  const conf = CURRENCY_MAP[code];
  const num = Number.isFinite(Number(amount)) ? Number(amount) : 0;

  return new Intl.NumberFormat(locale === "en" ? "en-US" : "id-ID", {
    style: "currency",
    currency: code,
    minimumFractionDigits: conf.decimalPlaces,
    maximumFractionDigits: conf.decimalPlaces,
  }).format(num);
}

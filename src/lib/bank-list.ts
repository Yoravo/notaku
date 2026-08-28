export interface BankOption {
  code: string;
  name: string;
  category: "BANK" | "EWALLET";
}

export const INDONESIA_BANKS_AND_EWALLETS: BankOption[] = [
  // Bank Populer
  { code: "BCA", name: "Bank Central Asia (BCA)", category: "BANK" },
  { code: "MANDIRI", name: "Bank Mandiri", category: "BANK" },
  { code: "BRI", name: "Bank Rakyat Indonesia (BRI)", category: "BANK" },
  { code: "BNI", name: "Bank Negara Indonesia (BNI)", category: "BANK" },
  { code: "BSI", name: "Bank Syariah Indonesia (BSI)", category: "BANK" },
  { code: "CIMB", name: "CIMB Niaga", category: "BANK" },
  { code: "PERMATA", name: "Bank Permata", category: "BANK" },
  { code: "DANAMON", name: "Bank Danamon", category: "BANK" },
  { code: "BTPN_JENIUS", name: "Bank BTPN / Jenius", category: "BANK" },
  { code: "JAGO", name: "Bank Jago", category: "BANK" },
  { code: "SEABANK", name: "SeaBank Indonesia", category: "BANK" },
  { code: "NEO", name: "Bank Neo Commerce (BNC)", category: "BANK" },
  { code: "OCBC", name: "OCBC NISP", category: "BANK" },
  { code: "PANIN", name: "Panin Bank", category: "BANK" },

  // E-Wallet
  { code: "GOPAY", name: "GoPay", category: "EWALLET" },
  { code: "OVO", name: "OVO", category: "EWALLET" },
  { code: "DANA", name: "DANA", category: "EWALLET" },
  { code: "SHOPEEPAY", name: "ShopeePay", category: "EWALLET" },
  { code: "LINKAJA", name: "LinkAja", category: "EWALLET" },
];

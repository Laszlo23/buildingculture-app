/** Default club Binance referral (USDC earn campaign); override with VITE_BINANCE_REFERRAL_URL. */
const DEFAULT_BINANCE_REFERRAL =
  "https://www.binance.com/referral/earn-together/refer2earn-usdc/claim?hl=en&ref=GRO_28502_V0A7R&utm_source=referral_entrance";

export function getBinanceReferralUrl(): string {
  const fromEnv = (import.meta.env.VITE_BINANCE_REFERRAL_URL as string | undefined)?.trim();
  if (fromEnv) return fromEnv;
  return DEFAULT_BINANCE_REFERRAL;
}

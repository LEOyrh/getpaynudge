import { plans } from "@/config/brand";

/**
 * Stripe product ↔ price mapping for PayNudge plans.
 *
 * Live products: PayNudge Solo ($9) and PayNudge Studio ($29).
 * Legacy products (starter $8, pro $22, business $48, old solo $9) are mapped
 * forward so any existing subscribers keep correct access until migrated.
 */
export const stripePlans = {
  solo: {
    productId: "prod_UMKTujHPntf68n",
    priceId: "price_1TNboLAJV5JIDaSeXraEH73v",
  },
  studio: {
    productId: "prod_UMKTAkSvp6iNLd",
    priceId: "price_1TNbokAJV5JIDaSegGPDQmcP",
  },
} as const;

export type StripePlanKey = keyof typeof stripePlans;

/** Legacy product IDs that should still resolve to a current plan. */
const legacyProductMap: Record<string, StripePlanKey> = {
  prod_ULkKOb5YXF3omw: "solo",   // legacy Starter ($8) → solo
  prod_ULkKd211wLLBmP: "solo",   // legacy PayNudge Starter ($9) → solo
  prod_ULkKBYqnmDokUG: "studio", // legacy Pro ($22) → studio
  prod_ULkKetWVQnfmPl: "studio", // legacy Business ($48) → studio (unlimited)
};

/** Resolve plan key from Stripe product ID */
export function planKeyFromProductId(productId: string | null): StripePlanKey | "free" {
  if (!productId) return "free";
  for (const [key, plan] of Object.entries(stripePlans)) {
    if (plan.productId === productId) return key as StripePlanKey;
  }
  if (legacyProductMap[productId]) return legacyProductMap[productId];
  return "free";
}

/** Get the active invoice limit for a plan key */
export function getInvoiceLimit(planKey: StripePlanKey | "free"): number {
  const plan = plans.find((p) => p.id === planKey);
  return plan?.activeInvoices ?? 3;
}

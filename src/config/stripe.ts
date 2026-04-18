import { plans } from "@/config/brand";

/**
 * Stripe product ↔ price mapping for PayNudge plans.
 * Live products: PayNudge Solo ($9) and PayNudge Studio ($29).
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

/** Resolve plan key from Stripe product ID */
export function planKeyFromProductId(productId: string | null): StripePlanKey | "free" {
  if (!productId) return "free";
  for (const [key, plan] of Object.entries(stripePlans)) {
    if (plan.productId === productId) return key as StripePlanKey;
  }
  return "free";
}

/** Get the active invoice limit for a plan key */
export function getInvoiceLimit(planKey: StripePlanKey | "free"): number {
  const plan = plans.find((p) => p.id === planKey);
  return plan?.activeInvoices ?? 3;
}

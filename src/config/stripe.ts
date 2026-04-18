import { plans } from "@/config/brand";

/**
 * Stripe product ↔ price mapping for PayNudge plans.
 *
 * Note: legacy Stripe products (starter / pro / business) are reused for the
 * new 3-tier structure to avoid breaking active subscriptions:
 *   - "solo"   → legacy "starter" product
 *   - "studio" → legacy "pro" product
 * The legacy "business" product is mapped to "studio" so existing customers
 * continue to receive unlimited access.
 */
export const stripePlans = {
  solo: {
    productId: "prod_ULkKOb5YXF3omw",
    priceId: "price_1TN2qDAJV5JIDaSe4hvE8XuJ",
  },
  studio: {
    productId: "prod_ULkKBYqnmDokUG",
    priceId: "price_1TN2qFAJV5JIDaSeuU0pxIdc",
  },
} as const;

export type StripePlanKey = keyof typeof stripePlans;

/** Legacy product IDs that should still resolve to a current plan. */
const legacyProductMap: Record<string, StripePlanKey> = {
  prod_ULkKetWVQnfmPl: "studio", // old "business" → studio (unlimited)
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

import { plans } from "@/config/brand";

/** Stripe product ↔ price mapping for PayNudge plans */
export const stripePlans = {
  starter: {
    productId: "prod_ULkKOb5YXF3omw",
    priceId: "price_1TN2qDAJV5JIDaSe4hvE8XuJ",
  },
  pro: {
    productId: "prod_ULkKBYqnmDokUG",
    priceId: "price_1TN2qFAJV5JIDaSeuU0pxIdc",
  },
  business: {
    productId: "prod_ULkKetWVQnfmPl",
    priceId: "price_1TN2qDAJV5JIDaSekS9gQqa5",
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
  return plan?.activeInvoices ?? 1;
}

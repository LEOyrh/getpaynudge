import { plans } from "@/config/brand";

/** Stripe product ↔ price mapping for PayNudge plans */
export const stripePlans = {
  starter: {
    productId: "prod_UIMg3mg0NPPxGO",
    priceId: "price_1TJlxOAS51isIvERI2JjHabm",
  },
  pro: {
    productId: "prod_UIMhxzLKy1GOdq",
    priceId: "price_1TJlxoAS51isIvERrJSk7euy",
  },
  business: {
    productId: "prod_UIMhsRTnwiCwqK",
    priceId: "price_1TJlyMAS51isIvERS6AXSP7U",
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

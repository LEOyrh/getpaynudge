import { plans } from "@/config/brand";

/** Stripe product ↔ price mapping for PayNudge plans */
export const stripePlans = {
  starter: {
    productId: "prod_UKzUakyN8jk3RY",
    priceId: "price_1TMJVfAS51isIvERnqeNjslJ",
  },
  pro: {
    productId: "prod_UKzU4mKXA1elNj",
    priceId: "price_1TMJVyAS51isIvERYvKDjnoB",
  },
  business: {
    productId: "prod_UKzVpA4xqTNk5L",
    priceId: "price_1TMJWEAS51isIvERWzjqay5b",
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

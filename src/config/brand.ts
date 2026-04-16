export const brand = {
  name: "PayNudge",
  tagline: "Get paid without the awkward follow-up.",
  description:
    "Automated invoice reminder software for freelancers and small businesses. Send polite payment reminder emails and get paid faster.",
  domain: "getpaynudge.com",
  appDomain: "app.getpaynudge.com",
  url: "https://getpaynudge.com",
  appUrl: "https://app.getpaynudge.com",
  supportEmail: "support@getpaynudge.com",
  remindersEmail: "reminders@getpaynudge.com",
  social: {
    twitter: "@paynudge",
  },
  legal: {
    companyName: "PayNudge",
    jurisdiction: "United States",
  },
  turnstileSiteKey: "0x4AAAAAAC-KGvkqkpqkf6rb",
} as const;

// --- helpers for domain-aware routing ---

/** True when running on the app subdomain (app.getpaynudge.com) */
export function isAppDomain() {
  return window.location.hostname === brand.appDomain;
}

/** True when running on the marketing domain (getpaynudge.com) */
export function isMarketingDomain() {
  return window.location.hostname === brand.domain;
}

/** True when running locally (dev / preview) */
export function isLocalDev() {
  const h = window.location.hostname;
  return h === "localhost" || h.includes("lovable.app") || h.includes("lovableproject.com") || h === "127.0.0.1";
}

// --- pricing (unchanged) ---

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: "month";
  description: string;
  activeInvoices: number; // -1 = unlimited
  features: string[];
  cta: string;
  highlighted: boolean;
}

export const plans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    interval: "month",
    description: "Try it out with 3 invoices",
    activeInvoices: 3,
    features: [
      "3 active invoices",
      "Default reminder cadence",
      "Email reminders",
      "Pay link support",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    id: "starter",
    name: "Starter",
    price: 8,
    interval: "month",
    description: "For solo freelancers",
    activeInvoices: 20,
    features: [
      "Up to 20 active invoices",
      "Custom reminder schedule",
      "3 reminder tones",
      "Activity timeline",
      "Email support",
    ],
    cta: "Start 7-Day Free Trial",
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 22,
    interval: "month",
    description: "For growing businesses",
    activeInvoices: 60,
    features: [
      "Up to 60 active invoices",
      "Everything in Starter",
      "Open & click tracking",
      "Pay link in reminders",
      "Priority email support",
    ],
    cta: "Start 7-Day Free Trial",
    highlighted: true,
  },
  {
    id: "business",
    name: "Business",
    price: 48,
    interval: "month",
    description: "For larger operations",
    activeInvoices: -1,
    features: [
      "Unlimited active invoices",
      "Everything in Pro",
      "Dedicated email support",
    ],
    cta: "Start 7-Day Free Trial",
    highlighted: false,
  },
];

export const defaultCadence = [
  { dayOffset: -3, label: "3 days before due date" },
  { dayOffset: 0, label: "On due date" },
  { dayOffset: 3, label: "3 days overdue" },
  { dayOffset: 7, label: "7 days overdue" },
  { dayOffset: 14, label: "14 days overdue" },
];

export const reminderTones = ["friendly", "professional", "firm"] as const;
export type ReminderTone = (typeof reminderTones)[number];

export const invoiceStatuses = [
  "active",
  "paused",
  "paid",
  "disputed",
  "archived",
] as const;
export type InvoiceStatus = (typeof invoiceStatuses)[number];

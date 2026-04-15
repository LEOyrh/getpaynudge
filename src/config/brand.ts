export const brand = {
  name: "PayNudge",
  tagline: "Get paid without the awkward follow-up.",
  description:
    "Automated invoice reminders for freelancers and small businesses. Stop chasing payments manually.",
  domain: "paynudge.com",
  appDomain: "app.paynudge.com",
  url: "https://paynudge.com",
  appUrl: "https://app.paynudge.com",
  supportEmail: "support@getpaynudge.com",
  remindersEmail: "reminders@paynudge.com",
  social: {
    twitter: "@paynudge",
  },
  legal: {
    companyName: "PayNudge",
    jurisdiction: "United States",
  },
} as const;

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
    description: "Try it out with one invoice",
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
    price: 9,
    interval: "month",
    description: "For solo freelancers",
    activeInvoices: 10,
    features: [
      "Up to 10 active invoices",
      "Custom reminder schedule",
      "3 reminder tones",
      "Activity timeline",
      "Email support",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 19,
    interval: "month",
    description: "For growing businesses",
    activeInvoices: 50,
    features: [
      "Up to 50 active invoices",
      "Everything in Starter",
      "Open & click tracking",
      "Pay link in reminders",
      "Priority email support",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    id: "business",
    name: "Business",
    price: 49,
    interval: "month",
    description: "For larger operations",
    activeInvoices: -1,
    features: [
      "Unlimited active invoices",
      "Everything in Pro",
      "Dedicated email support",
    ],
    cta: "Contact Sales",
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

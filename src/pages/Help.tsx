import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePageMeta } from "@/hooks/usePageMeta";
import { brand } from "@/config/brand";

const sections = [
  {
    title: "Getting Started",
    items: [
      {
        heading: "Create your account",
        body: "Sign up with your email address. You'll start on the Free plan with 1 active invoice — no credit card required.",
      },
      {
        heading: "Add your first invoice",
        body: `Go to Invoices → New Invoice. Enter your client's name, email, invoice number, amount, due date, and optionally a payment link (Stripe, QuickBooks, Xero, or any URL). Click Create and your reminder cadence is set automatically.`,
      },
      {
        heading: "Understand the default reminder cadence",
        body: "By default, reminders go out 3 days before the due date, on the due date, then 3, 7, and 14 days after. You can customize this on paid plans.",
      },
    ],
  },
  {
    title: "Managing Invoices",
    items: [
      {
        heading: "Invoice statuses explained",
        body: "Draft — not yet active. Sent — reminders are running. Paid — you marked it paid, reminders stop. Overdue — past due date, reminders continue. Cancelled — no more reminders.",
      },
      {
        heading: "Mark an invoice as paid",
        body: "Open the invoice detail page and click 'Mark Paid'. All future reminders are cancelled immediately.",
      },
      {
        heading: "Pause and resume reminders",
        body: "You can pause reminders for any invoice from the detail page. Resume when you're ready — the cadence picks up where it left off.",
      },
      {
        heading: "Add a payment link",
        body: "When creating or editing an invoice, paste your payment URL (Stripe payment link, QuickBooks invoice URL, etc.). This link is included in every reminder email so clients can pay with one click.",
      },
      {
        heading: "Edit or duplicate an invoice",
        body: "Open an invoice and click Edit to update details. Use Duplicate to create a copy for a repeat client — saves time on data entry.",
      },
    ],
  },
  {
    title: "Reminders & Tones",
    items: [
      {
        heading: "Choose your reminder tone",
        body: "Pick from Friendly, Professional, or Firm. Early reminders are typically gentler; later ones escalate. The tone adjusts the language automatically.",
      },
      {
        heading: "Custom reminder cadence",
        body: "On Starter and above, you can customize when reminders go out. Set specific day offsets relative to the due date.",
      },
      {
        heading: "When do reminders stop?",
        body: "Reminders stop automatically when you mark an invoice as Paid, Disputed, or Cancelled. You can also pause reminders manually.",
      },
    ],
  },
  {
    title: "Billing & Plans",
    items: [
      {
        heading: "Upgrade your plan",
        body: "Go to Settings → Billing and choose a plan. You'll be redirected to a secure checkout. Changes take effect immediately.",
      },
      {
        heading: "What counts as an active invoice?",
        body: "Any invoice not marked as Paid, Cancelled, or Archived. Paused invoices still count toward your limit.",
      },
      {
        heading: "Cancel your subscription",
        body: "Go to Billing → Manage Subscription. You can cancel anytime — your plan stays active until the end of the billing period.",
      },
    ],
  },
  {
    title: "Account & Settings",
    items: [
      {
        heading: "Update your business name",
        body: "Go to Settings and update your business name. This is used in reminder emails so clients know who the reminder is from.",
      },
      {
        heading: "Change your email",
        body: "Go to Settings to update your account email. You'll need to verify the new address.",
      },
      {
        heading: "Delete your account",
        body: "Go to Settings → Delete Account. This permanently removes all your data including invoices, reminders, and profile information.",
      },
    ],
  },
];

export default function Help() {
  usePageMeta({
    title: "Help & Quick Start",
    description: `Learn how to use ${brand.name}. Quick start guide, managing invoices, reminders, billing, and account settings.`,
  });

  return (
    <>
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Help & Quick Start
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to get up and running with {brand.name}.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-border pb-20">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            {sections.map((section) => (
              <div key={section.title} className="mt-12">
                <h2 className="mb-6 font-heading text-2xl font-bold text-foreground">
                  {section.title}
                </h2>
                <div className="space-y-4">
                  {section.items.map((item) => (
                    <Card key={item.heading} className="border-border">
                      <CardContent className="pt-5 pb-5">
                        <h3 className="font-heading text-base font-semibold text-foreground">
                          {item.heading}
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                          {item.body}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-secondary/30 py-16">
        <div className="container text-center">
          <h2 className="font-heading text-2xl font-bold text-foreground">Still need help?</h2>
          <p className="mt-3 text-muted-foreground">
            Reach out to us at{" "}
            <a href={`mailto:${brand.supportEmail}`} className="text-primary hover:underline">
              {brand.supportEmail}
            </a>{" "}
            — we usually respond within 24 hours.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild>
              <Link to="/contact">
                Contact Us <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/faq">View FAQ</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

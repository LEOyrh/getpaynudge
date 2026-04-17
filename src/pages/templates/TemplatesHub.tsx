import { Link } from "react-router-dom";
import { ArrowRight, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePageMeta } from "@/hooks/usePageMeta";
import { brand } from "@/config/brand";

const templates = [
  {
    slug: "past-due-invoice-email-template",
    title: "Past Due Invoice Email Template",
    description:
      "A ready-to-use email template for following up on invoices that are past their due date. Professional tone, clear ask, and payment link included.",
  },
  {
    slug: "polite-payment-reminder-email",
    title: "Polite Payment Reminder Email",
    description:
      "A friendly, professional email template to remind clients about upcoming or recent invoices without being pushy.",
  },
  {
    slug: "final-invoice-reminder-template",
    title: "Final Invoice Reminder Template",
    description:
      "A firm but professional last-reminder email for invoices that are significantly overdue. Clear consequences, respectful tone.",
  },
  {
    slug: "how-to-follow-up-on-unpaid-invoice",
    title: "How to Follow Up on an Unpaid Invoice",
    description:
      "A complete guide to following up on unpaid invoices — when to send, what to say, and how to escalate without burning bridges.",
  },
  {
    slug: "late-payment-policy-template",
    title: "Late Payment Policy Template",
    description:
      "A template for creating a clear late payment policy to include in your contracts and invoices. Prevents disputes before they start.",
  },
  {
    slug: "reminder-schedule-for-overdue-invoices",
    title: "Reminder Schedule for Overdue Invoices",
    description:
      "The optimal timing for invoice reminder emails. Learn when to send each follow-up for maximum effectiveness.",
  },
  {
    slug: "invoice-follow-up-tips-for-freelancers",
    title: "Invoice Follow-Up Tips for Freelancers",
    description:
      "Practical tips for freelancers on how to follow up on invoices professionally, maintain relationships, and get paid faster.",
  },
  {
    slug: "small-business-late-payment-workflow",
    title: "Small Business Late Payment Workflow",
    description:
      "A step-by-step workflow for small businesses to handle late payments — from first reminder to final escalation.",
  },
];

export default function TemplatesHub() {
  usePageMeta({
    title: "Templates & Resources",
    description: `Free invoice reminder templates, payment follow-up guides, and late payment resources from ${brand.name}.`,
  });

  return (
    <>
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-display text-5xl text-foreground md:text-6xl">
              Templates & Resources
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Free email templates, guides, and workflows to help you get paid faster.
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2">
            {templates.map((t) => (
              <Link key={t.slug} to={`/templates/${t.slug}`}>
                <Card className="h-full border-border ">
                  <CardContent className="pt-6 pb-6">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                      <FileText className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <h2 className="font-heading text-lg font-semibold text-foreground">{t.title}</h2>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{t.description}</p>
                    <span className="mt-3 inline-flex items-center text-sm font-medium text-primary">
                      Read more <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border py-16">
        <div className="container text-center">
          <h2 className="font-heading text-2xl font-bold text-foreground">
            Want to automate the follow-up?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Stop copying templates. Let {brand.name} send the reminders for you.
          </p>
          <Button size="lg" className="mt-6" asChild>
            <Link to="/signup">
              Start Free <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}

import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { usePageMeta } from "@/hooks/usePageMeta";
import { brand } from "@/config/brand";

const faqCategories = [
  {
    title: "General",
    items: [
      {
        q: `What is ${brand.name}?`,
        a: `${brand.name} is an automated invoice reminder service for freelancers and small businesses. You add your invoices, set a reminder cadence, and we send polite, escalating email reminders to your clients until they pay.`,
      },
      {
        q: "Who is this for?",
        a: "Solo freelancers, agencies, consultants, designers, developers, photographers, coaches, and any small business that sends invoices and follows up manually.",
      },
      {
        q: "Is this a debt collection service?",
        a: `No. ${brand.name} is strictly for first-party invoice follow-up. You're contacting your own customers about invoices you issued. We are not a debt collection agency and do not purchase or manage third-party debt.`,
      },
      {
        q: `Does ${brand.name} handle payments?`,
        a: "No. We never process, hold, or touch your clients' money. You provide your own payment link (Stripe, QuickBooks, Xero, bank transfer, etc.) and we include it in the reminders. Your clients pay you directly.",
      },
    ],
  },
  {
    title: "Getting Started",
    items: [
      {
        q: "How do I create my first invoice?",
        a: `Sign up, go to Invoices → New Invoice, and enter the client name, email, amount, due date, and optionally a payment link. Click Create and the default reminder cadence is set automatically.`,
      },
      {
        q: "How do I set up reminders?",
        a: "Reminders are set automatically when you create an invoice. The default cadence sends reminders at 3 days before the due date, on the due date, and then 3, 7, and 14 days after. On paid plans, you can customize this schedule.",
      },
      {
        q: "What happens after I sign up?",
        a: "You start on the Free plan with 1 active invoice. You can immediately create an invoice and reminders will be sent on schedule. Upgrade anytime to add more invoices.",
      },
      {
        q: "Do I need a credit card to start?",
        a: "No. The Free plan requires no credit card. You only need payment details when you upgrade to a paid plan.",
      },
    ],
  },
  {
    title: "Using the App",
    items: [
      {
        q: "How do I pause reminders for an invoice?",
        a: "Open the invoice detail page and click Pause. Reminders will stop until you resume them. Paused invoices still count toward your active invoice limit.",
      },
      {
        q: "How do I mark an invoice as paid?",
        a: "Open the invoice and click 'Mark Paid'. All future reminders for that invoice are cancelled immediately and the invoice no longer counts toward your limit.",
      },
      {
        q: "How do I add a payment link?",
        a: "When creating or editing an invoice, paste your payment URL into the Payment Link field. This can be a Stripe payment link, QuickBooks invoice URL, Xero link, or any URL where your client can pay.",
      },
      {
        q: "Can I edit an invoice after creating it?",
        a: "Yes. Open the invoice detail page to edit any field. Changes take effect immediately for future reminders.",
      },
      {
        q: "What do invoice statuses mean?",
        a: "Draft — not yet active, no reminders sent. Sent — active, reminders running. Overdue — past due date, reminders continue. Paid — you marked it paid, reminders stopped. Cancelled — no more reminders.",
      },
      {
        q: "Can I duplicate an invoice for a repeat client?",
        a: "Yes. Open an existing invoice and use the Duplicate option to create a copy with the same client details — just update the amount and due date.",
      },
    ],
  },
  {
    title: "Reminders",
    items: [
      {
        q: "What does the default reminder schedule look like?",
        a: "The default cadence sends reminders 3 days before the due date, on the due date, and then 3, 7, and 14 days after the due date. You can customize this to any schedule you prefer.",
      },
      {
        q: "Can I customize the reminder emails?",
        a: "You can choose from three tones — friendly, professional, and firm. Each tone adjusts the language of the reminder. Full template customization is coming soon.",
      },
      {
        q: "What happens when my client pays?",
        a: "Mark the invoice as paid and all future reminders are cancelled immediately. You can also pause or dispute an invoice to stop reminders.",
      },
      {
        q: "Can my clients reply to reminder emails?",
        a: "Yes. Reminders include a reply-to address that goes directly to your business email. Clients can reply to you naturally.",
      },
      {
        q: "Is there a limit to how many reminders are sent?",
        a: "Yes. We enforce frequency caps to prevent over-contacting. The default cadence has 5 touchpoints. Custom cadences can include more, but guardrails prevent excessive emailing.",
      },
    ],
  },
  {
    title: "Troubleshooting",
    items: [
      {
        q: "My client says they didn't receive the reminder email.",
        a: "Check the Activity Timeline on the invoice detail page to confirm the reminder was sent. Ask your client to check their spam/junk folder. If the email was sent but not received, it may have been filtered by their email provider.",
      },
      {
        q: "A reminder didn't send on time.",
        a: "Reminders are processed in batches and may have a small delay (usually under a few minutes). Check the Activity Timeline to see the exact send time. If the reminder is missing entirely, make sure the invoice status is 'Sent' or 'Overdue' and reminders aren't paused.",
      },
      {
        q: "I've reached my invoice limit. What do I do?",
        a: "You can either upgrade your plan for more active invoices, or mark existing invoices as Paid or Cancelled to free up slots.",
      },
      {
        q: "How do I change the reminder schedule for an existing invoice?",
        a: "Open the invoice detail page where you can adjust the reminder schedule. Note that custom cadences require a Starter plan or above.",
      },
      {
        q: "I accidentally marked an invoice as paid. Can I undo it?",
        a: "Yes. Open the invoice and change the status back to Sent or Draft. Reminders will resume based on the current schedule.",
      },
    ],
  },
  {
    title: "Billing & Plans",
    items: [
      {
        q: "How much does it cost?",
        a: "Free for 1 active invoice. Starter is $9/month for up to 10 invoices. Pro is $19/month for up to 50. Business is $49/month for unlimited invoices.",
      },
      {
        q: "What counts as an active invoice?",
        a: "Any invoice not marked as paid, archived, or disputed. Paused invoices still count as active.",
      },
      {
        q: "Can I cancel anytime?",
        a: "Yes. All plans are month-to-month with no contracts. Cancel anytime and your subscription ends at the end of the billing period.",
      },
      {
        q: "How do I upgrade or downgrade?",
        a: "Go to your billing settings and choose a new plan. Changes take effect on your next billing cycle.",
      },
    ],
  },
  {
    title: "Account & Privacy",
    items: [
      {
        q: "How do I change my email address?",
        a: "Go to Settings in the app and update your email. You'll need to verify the new address.",
      },
      {
        q: "How do I update my business name?",
        a: "Go to Settings and edit your business name. This name is used in the reminder emails your clients receive.",
      },
      {
        q: "Can I delete my account and data?",
        a: "Yes. You can delete your account from the settings page. This removes all your data permanently.",
      },
      {
        q: "What data do you collect?",
        a: "We collect the minimum needed to operate: your account details, invoice information, and email delivery events. We don't sell your data or share it with third parties for marketing.",
      },
      {
        q: "Where is my data stored?",
        a: "Your data is stored securely in our cloud infrastructure. We use encryption in transit and at rest.",
      },
    ],
  },
];

export default function FAQ() {
  usePageMeta({
    title: "FAQ",
    description: `Frequently asked questions about ${brand.name}. Learn about automated invoice reminders, pricing, security, and how it works.`,
  });

  return (
    <>
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Frequently Asked Questions
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to know about {brand.name}.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-border pb-20">
        <div className="container">
          <div className="mx-auto max-w-2xl">
            {faqCategories.map((category) => (
              <div key={category.title} className="mt-12">
                <h2 className="mb-4 font-heading text-xl font-bold text-foreground">
                  {category.title}
                </h2>
                <Accordion type="multiple" className="w-full">
                  {category.items.map((faq, idx) => (
                    <AccordionItem key={idx} value={`${category.title}-${idx}`}>
                      <AccordionTrigger className="text-left font-heading text-base font-semibold text-foreground">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-secondary/30 py-16">
        <div className="container text-center">
          <h2 className="font-heading text-2xl font-bold text-foreground">Still have questions?</h2>
          <p className="mt-3 text-muted-foreground">
            Reach out and we'll get back to you quickly.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild>
              <Link to="/contact">
                Contact Us <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/signup">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

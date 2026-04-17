import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageMeta } from "@/hooks/usePageMeta";
import { brand } from "@/config/brand";

const faqCategories = [
  {
    title: "General",
    items: [
      {
        q: `What is ${brand.name}?`,
        a: `${brand.name} is automated invoice reminder software for freelancers and small businesses. You add your invoices, set a reminder cadence, and we send polite, escalating email reminders until the invoice is paid or you stop the sequence.`,
      },
      {
        q: "Who is this for?",
        a: "Freelancers, agencies, consultants, coaches, designers, developers, and small service businesses that send invoices and want to stop chasing late payments manually.",
      },
      {
        q: "Is this a debt collection service?",
        a: `${brand.name} is not a debt collection agency. It is for first-party invoice follow-up only — meaning you're contacting your own customers about invoices you issued yourself.`,
      },
      {
        q: `Does ${brand.name} handle payments?`,
        a: "No. We do not process, hold, or move money. You provide your own payment link and your clients pay you directly through your existing payment method or invoicing system.",
      },
    ],
  },
  {
    title: "Getting Started",
    items: [
      {
        q: "How do I create my first invoice?",
        a: "Sign up, go to Invoices → New Invoice, and enter the client name, email, invoice number, amount, due date, and optionally a payment link. After you create it, the default reminder cadence is applied automatically.",
      },
      {
        q: "How do I set up reminders?",
        a: "Reminders are created automatically when you add an invoice. The default cadence sends reminders 3 days before the due date, on the due date, and then 3, 7, and 14 days after. Paid plans can customize that schedule.",
      },
      {
        q: "What happens after I sign up?",
        a: "You start on the Free plan with 3 active invoices. You can create invoices immediately, test the workflow, and upgrade later if you need more capacity or custom reminder settings.",
      },
      {
        q: "Do I need a credit card to start?",
        a: "No. The Free plan does not require a credit card. You only enter payment details when you start a paid plan trial or subscription.",
      },
    ],
  },
  {
    title: "Using the App",
    items: [
      {
        q: "How do I pause reminders for an invoice?",
        a: "Open the invoice detail page and pause reminders there. Reminders stay paused until you resume them.",
      },
      {
        q: "How do I mark an invoice as paid?",
        a: "Open the invoice and click Mark Paid. That immediately stops all future reminders for that invoice.",
      },
      {
        q: "How do I add a payment link?",
        a: "When creating or editing an invoice, paste your payment URL into the payment link field. That can be a Stripe payment link, QuickBooks invoice URL, bank transfer instructions page, or another valid payment URL.",
      },
      {
        q: "Can I edit an invoice after creating it?",
        a: "Yes. You can update invoice details after creation and those changes apply to future reminders.",
      },
      {
        q: "What do invoice statuses mean?",
        a: "Draft means not yet active. Sent means reminders are active. Overdue means the due date has passed and reminders continue. Paid means the invoice is settled and reminders stop. Cancelled means the reminder flow has been ended manually.",
      },
      {
        q: "Can I duplicate an invoice for a repeat client?",
        a: "Yes. You can duplicate an existing invoice and then change the amount, dates, or notes as needed.",
      },
    ],
  },
  {
    title: "Reminders",
    items: [
      {
        q: "What does the default reminder schedule look like?",
        a: "The default reminder cadence is 3 days before the due date, on the due date, then 3, 7, and 14 days overdue.",
      },
      {
        q: "Can I customize the reminder emails?",
        a: "You can choose from friendly, professional, and firm reminder tones. Paid plans can also customize the cadence timing.",
      },
      {
        q: "What happens when my client pays?",
        a: "As soon as you mark the invoice as paid, all future reminders for that invoice stop immediately.",
      },
      {
        q: "Can my clients reply to reminder emails?",
        a: "Yes. Reminder emails are designed so clients can reply back to you directly like a normal business email conversation.",
      },
      {
        q: "Is there a limit to how many reminders are sent?",
        a: "Yes. The product is designed for professional follow-up, not harassment. Default and custom cadences are constrained to reasonable reminder spacing.",
      },
    ],
  },
  {
    title: "Troubleshooting",
    items: [
      {
        q: "My client says they didn't receive the reminder email.",
        a: "Check the invoice activity timeline first. Then ask them to check spam or junk folders and confirm the client email address is correct.",
      },
      {
        q: "A reminder didn't send on time.",
        a: "Reminder processing can occasionally be delayed by a few minutes. If a reminder is missing entirely, check that the invoice is active and not paused or paid.",
      },
      {
        q: "I've reached my invoice limit. What do I do?",
        a: "Upgrade your plan for more active invoices, or free up space by marking completed invoices as paid or cancelling ones that no longer need follow-up.",
      },
      {
        q: "How do I change the reminder schedule for an existing invoice?",
        a: "Open the invoice detail page and update the reminder schedule there. Custom cadence controls are available on Starter and above.",
      },
      {
        q: "I accidentally marked an invoice as paid. Can I undo it?",
        a: "Yes. Update the invoice status again and resume the reminder flow if needed.",
      },
    ],
  },
  {
    title: "Billing & Plans",
    items: [
      {
        q: "How much does it cost?",
        a: "The Free plan includes 3 active invoices. Starter is $8/month for up to 20 active invoices. Pro is $22/month for up to 60 active invoices. Business is $48/month for unlimited active invoices.",
      },
      {
        q: "What counts as an active invoice?",
        a: "An active invoice is one that still needs follow-up. Paid and cancelled invoices stop counting toward your plan limit.",
      },
      {
        q: "Do you offer a free trial?",
        a: "Yes. Paid plans include a 7-day free trial so you can test the workflow before the first charge.",
      },
      {
        q: "Can I cancel anytime?",
        a: "Yes. Plans are month-to-month with no long-term contract.",
      },
      {
        q: "How do I upgrade or downgrade?",
        a: "Use the Billing page to start a paid plan or manage your subscription. If you're already subscribed, use Manage Subscription to switch plans safely.",
      },
    ],
  },
  {
    title: "Account & Privacy",
    items: [
      {
        q: "How do I change my email address?",
        a: "Go to Settings in the app and update your email address there. You may need to verify the new address before it becomes active.",
      },
      {
        q: "How do I update my business name?",
        a: "Go to Settings and update your business name. That name is used in reminder emails sent to your clients.",
      },
      {
        q: "Can I delete my account and data?",
        a: "Yes. You can delete your account from the settings area, which permanently removes your account data subject to any required retention obligations.",
      },
      {
        q: "What data do you collect?",
        a: "We collect the minimum needed to operate the service, including account details, invoice information, and email delivery events.",
      },
      {
        q: "Where is my data stored?",
        a: "Your data is stored in managed cloud infrastructure with encryption in transit and at rest.",
      },
    ],
  },
];

export default function FAQ() {
  usePageMeta({
    title: "Invoice Reminder FAQ",
    description: `Answers to common questions about ${brand.name}, automated invoice reminders, pricing, reminders, billing, and account setup.`,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqCategories.flatMap((category) =>
        category.items.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.a,
          },
        }))
      ),
    },
  });

  return (
    <>
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Frequently Asked Questions
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Straight answers about pricing, reminders, billing, and how {brand.name} works.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-border pb-20">
        <div className="container">
          <div className="mx-auto max-w-4xl space-y-12">
            {faqCategories.map((category) => (
              <section key={category.title} className="pt-12 first:pt-0">
                <h2 className="mb-6 font-heading text-2xl font-bold text-foreground">
                  {category.title}
                </h2>
                <div className="space-y-4">
                  {category.items.map((faq) => (
                    <article key={faq.q} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                      <h3 className="font-heading text-lg font-semibold text-foreground">{faq.q}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border py-16">
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

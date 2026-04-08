import TemplateLayout from "@/components/templates/TemplateLayout";
import { brand } from "@/config/brand";

export default function LatePaymentPolicy() {
  return (
    <TemplateLayout
      title="Late Payment Policy Template"
      description="A clear, professional late payment policy template to include in your contracts and invoices. Prevents disputes and sets expectations upfront."
      relatedLinks={[
        { title: "How to Follow Up on an Unpaid Invoice", slug: "how-to-follow-up-on-unpaid-invoice" },
        { title: "Small Business Late Payment Workflow", slug: "small-business-late-payment-workflow" },
        { title: "Past Due Invoice Email Template", slug: "past-due-invoice-email-template" },
      ]}
    >
      <section>
        <h2 className="font-heading text-xl font-semibold text-foreground">Why You Need a Late Payment Policy</h2>
        <p>
          A late payment policy isn't about being harsh — it's about setting clear expectations.
          When clients know the terms upfront, they're more likely to pay on time and less likely to
          dispute charges if you need to follow up.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Establishes professionalism and boundaries.</li>
          <li>Gives you a clear basis for follow-up.</li>
          <li>Reduces uncomfortable conversations — the policy speaks for itself.</li>
          <li>Protects you legally if disputes arise.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold text-foreground">Late Payment Policy Template</h2>
        <div className="rounded-lg border border-border bg-card p-6 text-sm">
          <h3 className="font-semibold text-foreground">Payment Terms</h3>
          <br />
          <p>All invoices are due within [NET_DAYS] days of the invoice date unless otherwise agreed in writing.</p>
          <br />
          <p>
            <strong>Late payment fees:</strong> Invoices not paid within [NET_DAYS] days of the invoice date
            will be subject to a late fee of [PERCENTAGE]% per month on the outstanding balance, calculated
            from the original due date.
          </p>
          <br />
          <p>
            <strong>Reminder communications:</strong> We send automated reminders for invoices approaching
            or past their due date. These reminders are sent in good faith to help ensure timely payment.
          </p>
          <br />
          <p>
            <strong>Suspension of services:</strong> We reserve the right to suspend ongoing work or services
            if payment is more than [DAYS] days overdue, until the outstanding balance is resolved.
          </p>
          <br />
          <p>
            <strong>Collection costs:</strong> In the event that we need to engage third-party assistance to
            collect overdue payments, the client agrees to be responsible for all reasonable collection costs,
            including legal fees.
          </p>
          <br />
          <p>
            <strong>Disputes:</strong> If you believe an invoice is incorrect, please notify us in writing
            within [DAYS] days of the invoice date. We will review and resolve the dispute promptly.
          </p>
        </div>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold text-foreground">How to Implement This Policy</h2>
        <ol className="list-decimal space-y-2 pl-5">
          <li><strong>Include it in your contracts.</strong> The policy should be part of your standard agreement before work begins.</li>
          <li><strong>Reference it on your invoices.</strong> Add a brief note: "Payment terms: Net 30. See contract for late payment policy."</li>
          <li><strong>Discuss it during onboarding.</strong> Mention payment terms when starting a new client relationship. This normalizes the policy.</li>
          <li><strong>Enforce it consistently.</strong> A policy that's never enforced is worse than no policy at all.</li>
        </ol>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold text-foreground">Common Net Terms</h2>
        <div className="mt-3 space-y-2">
          {[
            { term: "Net 15", desc: "Payment due within 15 days. Common for small projects and ongoing relationships." },
            { term: "Net 30", desc: "Payment due within 30 days. The most common standard term for professional services." },
            { term: "Net 45 / Net 60", desc: "Common with larger companies and enterprise clients. Consider charging a premium for extended terms." },
            { term: "Due on receipt", desc: "Payment expected immediately upon receiving the invoice. Common for small or one-time services." },
          ].map((t) => (
            <div key={t.term} className="rounded-lg border border-border p-3">
              <p className="font-semibold text-foreground">{t.term}</p>
              <p className="mt-1">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold text-foreground">Pair Your Policy with Automated Reminders</h2>
        <p>
          A late payment policy sets expectations. {brand.name} enforces them automatically by sending
          polite, escalating reminders when invoices approach or pass their due date. Together, they create
          a system that gets you paid consistently without awkward conversations.
        </p>
      </section>
    </TemplateLayout>
  );
}

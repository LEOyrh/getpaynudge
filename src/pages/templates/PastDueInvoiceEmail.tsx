import TemplateLayout from "@/components/templates/TemplateLayout";
import { brand } from "@/config/brand";

export default function PastDueInvoiceEmail() {
  return (
    <TemplateLayout
      title="Past Due Invoice Email Template"
      description="A professional, ready-to-use email template for following up on invoices that are past their due date. Copy, customize, and send — or let PayNudge automate it."
      relatedLinks={[
        { title: "Polite Payment Reminder Email", slug: "polite-payment-reminder-email" },
        { title: "Final Invoice Reminder Template", slug: "final-invoice-reminder-template" },
        { title: "How to Follow Up on an Unpaid Invoice", slug: "how-to-follow-up-on-unpaid-invoice" },
      ]}
    >
      <section>
        <h2 className="font-heading text-xl font-semibold text-foreground">When to Use This Template</h2>
        <p>
          Use this template when an invoice has passed its due date and you haven't received payment.
          Ideally, send this 1–3 days after the due date. The tone is professional and assumes goodwill —
          most late payments are simply oversights.
        </p>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold text-foreground">Email Template</h2>
        <div className="rounded-lg border border-border bg-card p-6 font-mono text-sm">
          <p className="font-semibold text-foreground">Subject: Invoice [#INVOICE_NUMBER] — Payment Reminder</p>
          <br />
          <p>Hi [CLIENT_NAME],</p>
          <br />
          <p>
            I hope you're doing well. I'm writing to let you know that Invoice #[INVOICE_NUMBER]
            for [AMOUNT] was due on [DUE_DATE] and appears to still be outstanding.
          </p>
          <br />
          <p>
            I understand things get busy. If you've already sent payment, please disregard this message.
            Otherwise, you can view and pay the invoice here:
          </p>
          <br />
          <p className="text-primary">[PAYMENT_LINK]</p>
          <br />
          <p>If you have any questions about this invoice, please don't hesitate to reach out.</p>
          <br />
          <p>Thank you,</p>
          <p>[YOUR_NAME]</p>
          <p>[YOUR_BUSINESS_NAME]</p>
        </div>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold text-foreground">Tips for This Email</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Keep the tone neutral and professional. Assume the late payment is unintentional.</li>
          <li>Always include the invoice number, amount, and due date for clarity.</li>
          <li>Include a direct payment link — don't make the client search for it.</li>
          <li>Send within 1–3 days of the due date. Prompt follow-up gets faster results.</li>
          <li>Don't apologize for following up. You earned the payment; this is normal business communication.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold text-foreground">What Comes Next?</h2>
        <p>
          If this initial reminder doesn't get a response within 3–5 days, send a slightly firmer follow-up.
          Check our <a href="/templates/final-invoice-reminder-template" className="text-primary hover:underline">final invoice reminder template</a> for
          the next step, or read our guide on <a href="/templates/reminder-schedule-for-overdue-invoices" className="text-primary hover:underline">optimal reminder scheduling</a>.
        </p>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold text-foreground">Automate This With {brand.name}</h2>
        <p>
          Instead of manually copying templates and tracking due dates, let {brand.name} handle the entire
          follow-up sequence. Add your invoice once, choose your cadence, and we'll send polite, escalating
          reminders until you're paid — with your payment link included in every email.
        </p>
      </section>
    </TemplateLayout>
  );
}

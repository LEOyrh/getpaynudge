import TemplateLayout from "@/components/templates/TemplateLayout";
import { brand } from "@/config/brand";

export default function PolitePaymentReminder() {
  return (
    <TemplateLayout
      title="Polite Payment Reminder Email"
      description="A friendly, professional email template for reminding clients about upcoming or recently due invoices — without being pushy or awkward."
      relatedLinks={[
        { title: "Past Due Invoice Email Template", slug: "past-due-invoice-email-template" },
        { title: "Invoice Follow-Up Tips for Freelancers", slug: "invoice-follow-up-tips-for-freelancers" },
        { title: "Reminder Schedule for Overdue Invoices", slug: "reminder-schedule-for-overdue-invoices" },
      ]}
    >
      <section>
        <h2 className="font-heading text-xl font-semibold text-foreground">When to Use This Template</h2>
        <p>
          Send this email 1–3 days before an invoice is due, or on the due date itself. This is a pre-emptive
          or day-of reminder — the gentlest nudge in your follow-up sequence.
        </p>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold text-foreground">Email Template</h2>
        <div className="rounded-lg border border-border bg-card p-6 font-mono text-sm">
          <p className="font-semibold text-foreground">Subject: Friendly reminder — Invoice [#INVOICE_NUMBER]</p>
          <br />
          <p>Hi [CLIENT_NAME],</p>
          <br />
          <p>
            Just a quick heads-up that Invoice #[INVOICE_NUMBER] for [AMOUNT] is coming due on [DUE_DATE].
          </p>
          <br />
          <p>You can view and pay the invoice here:</p>
          <br />
          <p className="text-primary">[PAYMENT_LINK]</p>
          <br />
          <p>No rush — just wanted to make sure it's on your radar. Let me know if you have any questions.</p>
          <br />
          <p>Thanks,</p>
          <p>[YOUR_NAME]</p>
        </div>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold text-foreground">Why Polite Reminders Work</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li><strong>Most late payments aren't intentional.</strong> A gentle reminder is often all it takes.</li>
          <li><strong>You maintain the relationship.</strong> Clients appreciate a professional nudge over silence followed by frustration.</li>
          <li><strong>Consistency matters more than intensity.</strong> A polite reminder sent on time outperforms an angry email sent weeks late.</li>
          <li><strong>Including a pay link reduces friction.</strong> Make it easy to pay and clients will pay faster.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold text-foreground">Tone Tips</h2>
        <p>
          The key to a good payment reminder is treating it like normal business communication — because it is.
          You provided a service, you sent an invoice, and now you're following up. There's nothing awkward about that.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Use "friendly reminder" or "quick heads-up" rather than "URGENT" or "OVERDUE."</li>
          <li>Keep it short. One paragraph, one link, one ask.</li>
          <li>Don't over-explain or apologize. You're not bothering them — you're being professional.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold text-foreground">Automate Your Reminders</h2>
        <p>
          With {brand.name}, you never have to write or schedule these emails yourself. Add your invoice,
          set your preferred tone, and the system sends polite reminders on your schedule — starting before
          the due date and escalating if needed.
        </p>
      </section>
    </TemplateLayout>
  );
}

import TemplateLayout from "@/components/templates/TemplateLayout";
import { brand } from "@/config/brand";

export default function FinalInvoiceReminder() {
  return (
    <TemplateLayout
      title="Final Invoice Reminder Template"
      description="A firm but respectful last-chance email template for invoices that are significantly overdue. Professional escalation without burning bridges."
      relatedLinks={[
        { title: "Past Due Invoice Email Template", slug: "past-due-invoice-email-template" },
        { title: "Small Business Late Payment Workflow", slug: "small-business-late-payment-workflow" },
        { title: "Late Payment Policy Template", slug: "late-payment-policy-template" },
      ]}
    >
      <section>
        <h2 className="font-heading text-xl font-semibold text-foreground">When to Use This Template</h2>
        <p>
          Use this after you've sent 2–3 earlier reminders without a response or payment. Typically, this is
          sent 14–21 days after the due date. The tone is firm and direct, but still professional.
        </p>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold text-foreground">Email Template</h2>
        <div className="rounded-lg border border-border bg-card p-6 font-mono text-sm">
          <p className="font-semibold text-foreground">Subject: Final reminder — Invoice [#INVOICE_NUMBER] overdue</p>
          <br />
          <p>Hi [CLIENT_NAME],</p>
          <br />
          <p>
            I've sent a few reminders about Invoice #[INVOICE_NUMBER] for [AMOUNT], which was due on [DUE_DATE].
            As of today, payment is [X] days overdue.
          </p>
          <br />
          <p>
            I'd like to resolve this promptly. Please arrange payment at your earliest convenience:
          </p>
          <br />
          <p className="text-primary">[PAYMENT_LINK]</p>
          <br />
          <p>
            If there's an issue with the invoice or if you need to discuss payment arrangements,
            please reply to this email directly. I'm happy to work something out.
          </p>
          <br />
          <p>
            If I don't hear back within [X] business days, I'll need to explore other options for resolving this.
          </p>
          <br />
          <p>Thank you for your attention to this matter.</p>
          <br />
          <p>[YOUR_NAME]</p>
          <p>[YOUR_BUSINESS_NAME]</p>
        </div>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold text-foreground">Key Principles for Final Reminders</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li><strong>Be direct, not aggressive.</strong> State the facts: invoice number, amount, due date, days overdue.</li>
          <li><strong>Offer a path forward.</strong> Invite them to reply if there's an issue. Some clients are avoiding you because they can't pay in full.</li>
          <li><strong>Set a clear deadline.</strong> "Within 5 business days" is specific and reasonable.</li>
          <li><strong>Mention consequences without threats.</strong> "Explore other options" signals seriousness without being hostile.</li>
          <li><strong>Keep it brief.</strong> By the final reminder, the client knows the situation. Don't over-explain.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold text-foreground">What to Do After the Final Reminder</h2>
        <p>
          If you still don't receive payment or a response after the final reminder, your options include:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>A phone call to the client to discuss directly.</li>
          <li>Formal demand letter (especially for larger amounts).</li>
          <li>Small claims court (for amounts within the threshold, usually $5,000–$10,000 depending on jurisdiction).</li>
          <li>Write-off and client blacklist (for small amounts not worth pursuing further).</li>
        </ul>
        <p className="mt-3">
          For a complete workflow, see our <a href="/templates/small-business-late-payment-workflow" className="text-primary hover:underline">small business late payment workflow guide</a>.
        </p>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold text-foreground">Let {brand.name} Handle Escalation</h2>
        <p>
          With {brand.name}, the escalation happens automatically. You set the cadence, choose your tone,
          and the system progressively firms up the language as invoices become more overdue. If the client
          pays or you mark the invoice as disputed, reminders stop instantly.
        </p>
      </section>
    </TemplateLayout>
  );
}

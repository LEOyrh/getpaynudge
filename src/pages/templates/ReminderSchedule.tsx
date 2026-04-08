import TemplateLayout from "@/components/templates/TemplateLayout";
import { brand } from "@/config/brand";

export default function ReminderSchedule() {
  return (
    <TemplateLayout
      title="Reminder Schedule for Overdue Invoices"
      description="The optimal timing for invoice reminder emails. Learn when to send each follow-up for maximum effectiveness without annoying your clients."
      relatedLinks={[
        { title: "How to Follow Up on an Unpaid Invoice", slug: "how-to-follow-up-on-unpaid-invoice" },
        { title: "Polite Payment Reminder Email", slug: "polite-payment-reminder-email" },
        { title: "Final Invoice Reminder Template", slug: "final-invoice-reminder-template" },
      ]}
    >
      <section>
        <h2 className="font-heading text-xl font-semibold text-foreground">The Optimal Reminder Schedule</h2>
        <p>
          Based on best practices from accounts receivable management, here's the most effective
          reminder schedule for invoice follow-up:
        </p>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold text-foreground">Recommended Timeline</h2>
        <div className="space-y-4">
          {[
            {
              timing: "3 days before due date",
              tone: "Friendly",
              purpose: "Preemptive reminder",
              details: "A casual heads-up that the invoice is coming due. This catches clients who might forget and lets them plan payment. Studies show pre-due reminders reduce late payments by 20–30%.",
            },
            {
              timing: "On the due date",
              tone: "Professional",
              purpose: "Due date reminder",
              details: "A polite notification that payment is due today. Short, clear, with a direct payment link. This is not a collections email — it's a standard business communication.",
            },
            {
              timing: "3 days after due date",
              tone: "Professional",
              purpose: "Gentle follow-up",
              details: "A brief follow-up noting the invoice is now past due. Still assumes good intent — most late payments at this stage are oversights. Include the payment link again.",
            },
            {
              timing: "7 days after due date",
              tone: "Firm",
              purpose: "Escalated reminder",
              details: "A more direct message requesting prompt payment. Ask for confirmation of receipt and an expected payment date. This is where you shift from 'reminder' to 'request.'",
            },
            {
              timing: "14 days after due date",
              tone: "Firm",
              purpose: "Final notice",
              details: "A final reminder with clear language about the overdue status and next steps. Professional but unambiguous. This is typically the last automated touchpoint before personal outreach.",
            },
          ].map((step) => (
            <div key={step.timing} className="rounded-lg border border-border p-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-semibold text-foreground">{step.timing}</span>
                <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">{step.tone}</span>
                <span className="text-xs text-muted-foreground">• {step.purpose}</span>
              </div>
              <p className="mt-2">{step.details}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold text-foreground">Why This Schedule Works</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li><strong>Pre-due reminder reduces late payments.</strong> Most clients want to pay on time — they just need a nudge.</li>
          <li><strong>Gradual escalation maintains relationships.</strong> Starting friendly and getting firmer feels natural and fair.</li>
          <li><strong>Consistent timing shows professionalism.</strong> Predictable follow-up signals that you run a serious business.</li>
          <li><strong>5 touchpoints is enough.</strong> Research shows diminishing returns after 5 reminders. Beyond that, switch to personal outreach.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold text-foreground">When to Customize the Schedule</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li><strong>Enterprise clients with Net 45/60 terms:</strong> Adjust the pre-due reminder to 5–7 days before and space post-due reminders further apart.</li>
          <li><strong>Small one-time projects:</strong> A tighter schedule (due date, +2, +5, +10) may be appropriate for smaller amounts.</li>
          <li><strong>Repeat clients:</strong> If you work with the same client regularly, a gentler schedule preserves the relationship.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold text-foreground">Automate Your Reminder Schedule</h2>
        <p>
          {brand.name} implements this exact schedule by default — and lets you customize it per invoice.
          Set your cadence once and every new invoice follows the same proven timeline automatically.
        </p>
      </section>
    </TemplateLayout>
  );
}

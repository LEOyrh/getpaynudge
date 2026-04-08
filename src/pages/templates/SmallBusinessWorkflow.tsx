import TemplateLayout from "@/components/templates/TemplateLayout";
import { brand } from "@/config/brand";

export default function SmallBusinessWorkflow() {
  return (
    <TemplateLayout
      title="Small Business Late Payment Workflow"
      description="A step-by-step workflow for small businesses to handle late payments consistently — from first reminder to final resolution."
      relatedLinks={[
        { title: "Reminder Schedule for Overdue Invoices", slug: "reminder-schedule-for-overdue-invoices" },
        { title: "Late Payment Policy Template", slug: "late-payment-policy-template" },
        { title: "Final Invoice Reminder Template", slug: "final-invoice-reminder-template" },
      ]}
    >
      <section>
        <h2 className="font-heading text-xl font-semibold text-foreground">Why You Need a Workflow</h2>
        <p>
          Without a defined workflow, late payment handling is reactive and inconsistent. Some invoices get
          followed up immediately, others fall through the cracks. A clear workflow ensures every overdue
          invoice gets the same professional treatment — and you recover more revenue with less stress.
        </p>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold text-foreground">The Complete Late Payment Workflow</h2>

        <div className="mt-4 space-y-6">
          <div className="rounded-lg border border-border p-5">
            <h3 className="font-heading text-lg font-semibold text-foreground">Phase 1: Prevention (Before Due Date)</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Include clear payment terms in every contract and invoice.</li>
              <li>Send invoices promptly after delivering work or services.</li>
              <li>Include a direct payment link on every invoice.</li>
              <li>Send an automated pre-due reminder 3 days before the due date.</li>
              <li>Send an automated due-date reminder on the day payment is expected.</li>
            </ul>
          </div>

          <div className="rounded-lg border border-border p-5">
            <h3 className="font-heading text-lg font-semibold text-foreground">Phase 2: Early Follow-Up (1–7 Days Overdue)</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Day 1–3: Send an automated gentle follow-up assuming the late payment is an oversight.</li>
              <li>Day 3–7: Send a firmer automated reminder requesting prompt payment and confirmation.</li>
              <li>Log all communication and delivery status.</li>
              <li>Check for client responses — reply promptly to any questions or disputes.</li>
            </ul>
          </div>

          <div className="rounded-lg border border-border p-5">
            <h3 className="font-heading text-lg font-semibold text-foreground">Phase 3: Escalation (7–30 Days Overdue)</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Day 14: Send final automated reminder with clear next-steps language.</li>
              <li>Day 14–21: If no response to automated emails, try a personal phone call or direct message.</li>
              <li>Offer payment plans if the client is having cash flow issues.</li>
              <li>Pause any ongoing work if applicable and contractually permitted.</li>
              <li>Document all communication attempts.</li>
            </ul>
          </div>

          <div className="rounded-lg border border-border p-5">
            <h3 className="font-heading text-lg font-semibold text-foreground">Phase 4: Resolution (30+ Days Overdue)</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Send a formal demand letter (email and/or mail) with a specific deadline.</li>
              <li>Assess whether the amount justifies further pursuit.</li>
              <li>For smaller amounts: consider writing off and blacklisting the client.</li>
              <li>For larger amounts: consult with a lawyer or consider small claims court.</li>
              <li>Update your records and mark the invoice as disputed or written off.</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold text-foreground">Key Metrics to Track</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li><strong>Days Sales Outstanding (DSO):</strong> Average number of days to collect payment. Lower is better.</li>
          <li><strong>Collection rate:</strong> Percentage of invoiced revenue actually collected.</li>
          <li><strong>Overdue rate:</strong> Percentage of invoices that go past the due date.</li>
          <li><strong>Response rate:</strong> How often clients respond to reminders vs. ignore them.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold text-foreground">Implementing This Workflow</h2>
        <p>
          Phases 1–3 of this workflow can be fully automated with {brand.name}. Add your invoices,
          set your reminder cadence, and the system handles pre-due reminders, due-date notifications,
          and escalating follow-ups — all with your payment link and business branding.
        </p>
        <p className="mt-3">
          You only need to step in personally for Phase 4 (resolution), and even then, you'll have a
          complete activity log of every reminder sent and every client interaction.
        </p>
      </section>
    </TemplateLayout>
  );
}

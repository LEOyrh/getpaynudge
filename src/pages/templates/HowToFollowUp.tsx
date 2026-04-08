import TemplateLayout from "@/components/templates/TemplateLayout";
import { brand } from "@/config/brand";

export default function HowToFollowUp() {
  return (
    <TemplateLayout
      title="How to Follow Up on an Unpaid Invoice"
      description="A complete guide to following up on unpaid invoices — when to send each reminder, what to say, how to escalate, and how to maintain client relationships."
      relatedLinks={[
        { title: "Reminder Schedule for Overdue Invoices", slug: "reminder-schedule-for-overdue-invoices" },
        { title: "Polite Payment Reminder Email", slug: "polite-payment-reminder-email" },
        { title: "Invoice Follow-Up Tips for Freelancers", slug: "invoice-follow-up-tips-for-freelancers" },
      ]}
    >
      <section>
        <h2 className="font-heading text-xl font-semibold text-foreground">Why Most People Handle Invoice Follow-Up Badly</h2>
        <p>
          The typical pattern: you send an invoice, it goes unpaid, you feel awkward about following up,
          you wait too long, and then you send a frustrated email that damages the relationship. Or you never
          follow up at all and lose money.
        </p>
        <p className="mt-3">
          The fix isn't being pushier — it's being more consistent. Regular, professional follow-up gets results
          without awkwardness.
        </p>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold text-foreground">The Right Follow-Up Timeline</h2>
        <p>Here's a proven timeline that balances persistence with professionalism:</p>
        <div className="mt-4 space-y-3">
          {[
            { timing: "3 days before due date", action: "Send a friendly heads-up that the invoice is coming due. Include the payment link." },
            { timing: "On the due date", action: "Send a polite reminder that payment is due today. Keep it short and include the link." },
            { timing: "3 days after due date", action: "Send a gentle follow-up noting the invoice is now overdue. Assume it's an oversight." },
            { timing: "7 days after due date", action: "Send a firmer reminder. Request confirmation of receipt and expected payment date." },
            { timing: "14 days after due date", action: "Send a final notice. Be direct about the overdue status and next steps." },
          ].map((step) => (
            <div key={step.timing} className="rounded-lg border border-border p-4">
              <p className="font-semibold text-foreground">{step.timing}</p>
              <p className="mt-1">{step.action}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold text-foreground">Common Mistakes to Avoid</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li><strong>Waiting too long to follow up.</strong> The sooner you follow up, the more likely you are to get paid. Waiting 30+ days signals that you're not serious about being paid on time.</li>
          <li><strong>Being too apologetic.</strong> You provided a service and issued an invoice. Following up is normal. Don't say "sorry to bother you."</li>
          <li><strong>Being too aggressive too early.</strong> Escalate gradually. A threatening email on day 1 damages the relationship permanently.</li>
          <li><strong>Not including a payment link.</strong> Every reminder should make it as easy as possible to pay. One click.</li>
          <li><strong>Sending inconsistently.</strong> One follow-up email followed by silence for three weeks tells the client they can keep delaying. Be consistent.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold text-foreground">What to Do When a Client Doesn't Respond</h2>
        <p>
          If you've sent your full reminder sequence and received no response or payment:
        </p>
        <ol className="list-decimal space-y-2 pl-5">
          <li><strong>Try a different channel.</strong> Call the client directly. Some people respond better to calls than emails.</li>
          <li><strong>Send a formal demand letter.</strong> A written letter via email and/or mail establishes a paper trail.</li>
          <li><strong>Assess the ROI of pursuit.</strong> For small amounts, write-off may be more cost-effective than legal action.</li>
          <li><strong>For larger amounts, consider small claims court.</strong> The threshold varies by jurisdiction but is typically $5,000–$10,000.</li>
        </ol>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold text-foreground">Prevention Is Better Than Collection</h2>
        <p>The best way to handle unpaid invoices is to reduce the chance they happen:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Require deposits for large projects (25–50% upfront).</li>
          <li>Set clear payment terms in your contracts.</li>
          <li>Include a late payment policy (see our <a href="/templates/late-payment-policy-template" className="text-primary hover:underline">template</a>).</li>
          <li>Invoice promptly after delivering work.</li>
          <li>Use automated reminders so follow-up never falls through the cracks.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold text-foreground">Automate the Entire Process</h2>
        <p>
          {brand.name} automates the follow-up timeline above. Add your invoice, choose a cadence, and
          let the system send professional reminders on schedule. Reminders stop automatically when you're
          paid or mark the invoice as disputed.
        </p>
      </section>
    </TemplateLayout>
  );
}

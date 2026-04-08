import TemplateLayout from "@/components/templates/TemplateLayout";
import { brand } from "@/config/brand";

export default function InvoiceFollowUpTips() {
  return (
    <TemplateLayout
      title="Invoice Follow-Up Tips for Freelancers"
      description="Practical tips for freelancers on how to follow up on invoices professionally, maintain client relationships, and get paid faster."
      relatedLinks={[
        { title: "Polite Payment Reminder Email", slug: "polite-payment-reminder-email" },
        { title: "How to Follow Up on an Unpaid Invoice", slug: "how-to-follow-up-on-unpaid-invoice" },
        { title: "Late Payment Policy Template", slug: "late-payment-policy-template" },
      ]}
    >
      <section>
        <h2 className="font-heading text-xl font-semibold text-foreground">The Freelancer's Follow-Up Problem</h2>
        <p>
          As a freelancer, chasing payments feels personal. You worked directly with the client, you built
          the relationship, and now asking for money feels awkward. But here's the truth: following up on
          invoices is a normal part of business, and doing it well actually strengthens relationships.
        </p>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold text-foreground">10 Tips for Better Invoice Follow-Up</h2>
        <ol className="list-decimal space-y-4 pl-5">
          <li>
            <strong>Invoice immediately after delivering work.</strong>
            <p className="mt-1">The longer you wait to invoice, the longer you wait to get paid. Send the invoice the same day you deliver.</p>
          </li>
          <li>
            <strong>Set clear payment terms upfront.</strong>
            <p className="mt-1">Discuss payment terms before starting work. Net 15 or Net 30 are standard. Put it in your contract.</p>
          </li>
          <li>
            <strong>Include a direct payment link.</strong>
            <p className="mt-1">Make it as easy as possible to pay. A Stripe payment link, PayPal button, or direct invoice URL reduces friction dramatically.</p>
          </li>
          <li>
            <strong>Send a pre-due reminder.</strong>
            <p className="mt-1">A friendly heads-up 2–3 days before the due date catches clients before they forget. It's proactive, not pushy.</p>
          </li>
          <li>
            <strong>Follow up promptly after the due date.</strong>
            <p className="mt-1">Don't wait weeks. Send a gentle reminder 1–3 days after the due date. Quick follow-up signals professionalism.</p>
          </li>
          <li>
            <strong>Be professional, not apologetic.</strong>
            <p className="mt-1">Don't say "sorry to bother you." You earned the payment. A simple "I wanted to follow up on Invoice #X" is perfect.</p>
          </li>
          <li>
            <strong>Escalate tone gradually.</strong>
            <p className="mt-1">Start friendly, get firmer over time. Never start aggressive — it damages relationships and rarely works.</p>
          </li>
          <li>
            <strong>Keep records of all communication.</strong>
            <p className="mt-1">Log every email sent, response received, and status change. This protects you if disputes arise.</p>
          </li>
          <li>
            <strong>Consider deposits for new clients.</strong>
            <p className="mt-1">Requiring 25–50% upfront for new clients reduces your risk and filters out clients who won't pay.</p>
          </li>
          <li>
            <strong>Automate the follow-up process.</strong>
            <p className="mt-1">Manual follow-up is inconsistent. You forget, you delay, you lose money. Automation ensures every invoice gets the same professional treatment.</p>
          </li>
        </ol>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold text-foreground">The Emotional Side of Follow-Up</h2>
        <p>
          Let's be honest: the hardest part of invoice follow-up for freelancers is emotional, not logistical.
          You worry about seeming greedy, damaging the relationship, or looking unprofessional. Here's the reframe:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Consistent follow-up is a sign of a well-run business, not desperation.</li>
          <li>Clients respect professionals who manage their finances clearly.</li>
          <li>Most late payments are unintentional. Your reminder is helpful, not annoying.</li>
          <li>The longer you avoid following up, the harder it gets — and the less likely you are to get paid.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold text-foreground">Stop Doing It Manually</h2>
        <p>
          {brand.name} was built for freelancers exactly like you. Add your invoice, set your cadence,
          and let the system handle the follow-up. You focus on your craft — we handle the awkward part.
        </p>
      </section>
    </TemplateLayout>
  );
}

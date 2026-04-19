import TemplateLayout from "@/components/templates/TemplateLayout";

export default function ConnectStripe() {
  return (
    <TemplateLayout
      title="How to Sync Your Stripe Invoices Automatically"
      description="Stop re-typing invoices into your reminder tool. Connect Stripe to PayNudge with a read-only restricted key and pull every open and overdue invoice in seconds."
      relatedLinks={[
        { title: "How to Follow Up on an Unpaid Invoice", slug: "how-to-follow-up-on-unpaid-invoice" },
        { title: "Reminder Schedule for Overdue Invoices", slug: "reminder-schedule-for-overdue-invoices" },
        { title: "Small Business Late Payment Workflow", slug: "small-business-late-payment-workflow" },
      ]}
    >
      <h2 className="font-heading text-2xl font-bold text-foreground">Why connect Stripe?</h2>
      <p>
        If you bill clients through Stripe, your invoices, due dates, customer emails, and hosted
        payment URLs already live there. Re-typing all of that into another tool is busywork that
        gets skipped — which means reminders never go out, and money sits uncollected.
      </p>
      <p>
        PayNudge's Stripe sync pulls your <strong>open and overdue invoices</strong> directly from
        your Stripe account so the reminder engine has everything it needs the moment you connect.
        No CSV imports. No double entry. Read-only access — we never touch payments.
      </p>

      <h2 className="font-heading text-2xl font-bold text-foreground">What you'll need</h2>
      <ul className="ml-5 list-disc space-y-1.5">
        <li>A Stripe account that already issues invoices</li>
        <li>2 minutes</li>
        <li>A PayNudge account (Free plan works — your active-invoice cap still applies)</li>
      </ul>

      <h2 className="font-heading text-2xl font-bold text-foreground">Step 1 — Create a restricted key in Stripe</h2>
      <p>
        A <strong>restricted key</strong> is Stripe's read-only credential. It can view invoices
        and customers but cannot move money, refund payments, or change settings. This is the
        safest way to share data with a third-party tool.
      </p>
      <ol className="ml-5 list-decimal space-y-1.5">
        <li>Open <a className="text-primary underline" href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer">Stripe Dashboard → Developers → API keys</a>.</li>
        <li>Scroll down to <strong>Restricted keys</strong> and click <strong>Create restricted key</strong>.</li>
        <li>Name it <code className="font-mono">PayNudge Sync</code>.</li>
        <li>Set <strong>Invoices: Read</strong> and <strong>Customers: Read</strong>. Leave every other permission as <em>None</em>.</li>
        <li>Click <strong>Create key</strong> and copy the key (it starts with <code className="font-mono">rk_live_</code> or <code className="font-mono">rk_test_</code>).</li>
      </ol>
      <p className="rounded-md border border-border bg-muted/30 p-4 text-sm">
        💡 <strong>Tip:</strong> we provide a one-click pre-filled link inside the app's Settings
        page that opens the Stripe key creator with the right permissions already selected.
      </p>

      <h2 className="font-heading text-2xl font-bold text-foreground">Step 2 — Paste it into PayNudge</h2>
      <ol className="ml-5 list-decimal space-y-1.5">
        <li>In PayNudge, open <strong>Settings</strong>.</li>
        <li>Scroll to <strong>Stripe Sync</strong>.</li>
        <li>Paste the key into the <em>Restricted API key</em> field.</li>
        <li>Click <strong>Connect Stripe</strong>.</li>
      </ol>
      <p>
        We immediately validate the key against Stripe's <code className="font-mono">/v1/account</code>{" "}
        endpoint, encrypt it with a server-side secret, and store it. Only your account can use it,
        and even our admins cannot read the plaintext key.
      </p>

      <h2 className="font-heading text-2xl font-bold text-foreground">Step 3 — Run your first sync</h2>
      <p>
        Click <strong>Sync now</strong>. PayNudge will:
      </p>
      <ul className="ml-5 list-disc space-y-1.5">
        <li>Fetch every Stripe invoice with status <code className="font-mono">open</code> (paid invoices are skipped — there's nothing to chase).</li>
        <li>Determine status: invoices past their due date are imported as <strong>overdue</strong>; the rest are <strong>sent</strong>.</li>
        <li>Pull the customer name, email, and Stripe-hosted payment URL so reminders include a one-click pay link.</li>
        <li>Write a <strong>Stripe</strong> source tag on each imported invoice so you can tell them apart from manually-entered ones.</li>
      </ul>
      <p>
        Click sync again any time. We use a stable mapping so the same Stripe invoice never gets
        imported twice — re-syncing just refreshes amounts, due dates, and statuses.
      </p>

      <h2 className="font-heading text-2xl font-bold text-foreground">What happens to my plan limit?</h2>
      <p>
        Your active-invoice cap still applies. On the Free plan you can have 3 active invoices at
        a time (Stripe + manual combined). If a sync would exceed your cap, the extra invoices are
        skipped and we show a "X skipped (plan limit)" notice in the toast. Upgrade to Solo or
        Studio to import more.
      </p>

      <h2 className="font-heading text-2xl font-bold text-foreground">Security</h2>
      <ul className="ml-5 list-disc space-y-1.5">
        <li><strong>Read-only:</strong> the restricted key cannot move money, issue refunds, create charges, or modify your Stripe settings.</li>
        <li><strong>Encrypted at rest:</strong> your key is encrypted with a server-side secret using PostgreSQL's pgcrypto. The encrypted bytes are stored separately from the metadata view used by the app.</li>
        <li><strong>Per-user isolation:</strong> Row-Level Security policies guarantee one user can never read another user's connection or imported invoices.</li>
        <li><strong>Revoke any time:</strong> click <em>Disconnect</em> in PayNudge, or roll the key in the Stripe dashboard. Both work instantly.</li>
      </ul>

      <h2 className="font-heading text-2xl font-bold text-foreground">FAQ</h2>
      <h3 className="font-heading text-lg font-semibold text-foreground">Do you support Stripe test mode?</h3>
      <p>
        Yes. Use a key starting with <code className="font-mono">rk_test_</code> to sync test
        invoices. Helpful for trying out the workflow without touching production data.
      </p>

      <h3 className="font-heading text-lg font-semibold text-foreground">What if my client pays in Stripe after import?</h3>
      <p>
        Click <strong>Sync now</strong> again — the invoice will no longer be returned by Stripe
        (its status becomes <code className="font-mono">paid</code>) and PayNudge stops chasing it.
        Real-time webhooks are on our roadmap to make this instant.
      </p>

      <h3 className="font-heading text-lg font-semibold text-foreground">Can I edit a Stripe-synced invoice?</h3>
      <p>
        No — Stripe is the source of truth. Amounts, due dates, and client info are locked on
        Stripe-imported invoices to prevent drift. You can still send manual reminders, mark them
        paid, pause the cadence, or change the reminder tone.
      </p>

      <h3 className="font-heading text-lg font-semibold text-foreground">What's coming next?</h3>
      <ul className="ml-5 list-disc space-y-1.5">
        <li>Real-time webhooks (paid/voided updates without clicking sync)</li>
        <li>Hourly auto-sync option</li>
        <li>QuickBooks and Xero connectors with the same pattern</li>
      </ul>
    </TemplateLayout>
  );
}

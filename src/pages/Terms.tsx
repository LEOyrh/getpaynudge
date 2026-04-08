import { usePageMeta } from "@/hooks/usePageMeta";
import { brand } from "@/config/brand";

export default function Terms() {
  usePageMeta({
    title: "Terms of Service",
    description: `${brand.name} Terms of Service. Read our terms for using the automated invoice reminder platform.`,
  });

  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <article className="prose prose-sm prose-gray mx-auto max-w-3xl">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

          <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
              <p>
                By using {brand.name} ("the Service"), you agree to be bound by these Terms of Service.
                If you do not agree, do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">2. Description of Service</h2>
              <p>
                {brand.name} is an automated invoice reminder platform. You add invoices you have issued to your
                own customers, configure a reminder schedule, and the Service sends email reminders on your behalf.
                The Service includes a link to your provided payment URL in each reminder.
              </p>
              <p>
                <strong>{brand.name} does not process, hold, or custody any funds.</strong> All payments between you
                and your clients happen outside of {brand.name} through your own payment provider.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">3. Permitted Use</h2>
              <p>You may only use {brand.name} for first-party invoice follow-up. This means:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>You issued the invoice yourself or through your business.</li>
                <li>You have a legitimate business relationship with the recipient.</li>
                <li>The recipient has an obligation to pay you for goods or services rendered.</li>
              </ul>
              <p>You may <strong>not</strong> use {brand.name} to:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Collect debts purchased from third parties.</li>
                <li>Harass, threaten, or intimidate anyone.</li>
                <li>Send reminders for fraudulent or fabricated invoices.</li>
                <li>Violate any applicable law, including consumer protection and anti-harassment laws.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">4. Your Responsibilities</h2>
              <ul className="list-disc space-y-1 pl-5">
                <li>You are responsible for the accuracy of the invoice information you enter.</li>
                <li>You are responsible for promptly marking invoices as paid when payment is received.</li>
                <li>You must comply with all applicable laws regarding communication with your clients.</li>
                <li>You must not send reminders to recipients who have asked not to be contacted.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">5. Accounts and Security</h2>
              <p>
                You are responsible for maintaining the security of your account. You must use a strong password
                and notify us immediately if you suspect unauthorized access. We are not liable for losses caused
                by unauthorized use of your account.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">6. Billing and Subscriptions</h2>
              <p>
                Paid plans are billed monthly via Stripe. You authorize us to charge your payment method on file.
                All fees are non-refundable except where required by law. You may cancel your subscription at any time;
                access continues until the end of the billing period.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">7. Limitation of Liability</h2>
              <p>
                {brand.name} is provided "as is" without warranties of any kind. We do not guarantee that reminders
                will result in payment, that emails will always be delivered, or that the Service will be uninterrupted.
                Our total liability is limited to the amount you paid us in the 12 months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">8. Termination</h2>
              <p>
                We may suspend or terminate your account if you violate these terms, engage in prohibited use,
                or if we are required to do so by law. You may delete your account at any time from the settings page.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">9. Changes to Terms</h2>
              <p>
                We may update these terms from time to time. We will notify you of material changes. Continued use
                of {brand.name} after changes constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">10. Contact</h2>
              <p>
                For questions about these terms, contact us at{" "}
                <a href={`mailto:${brand.supportEmail}`} className="text-primary hover:underline">
                  {brand.supportEmail}
                </a>.
              </p>
            </section>
          </div>
        </article>
      </div>
    </section>
  );
}

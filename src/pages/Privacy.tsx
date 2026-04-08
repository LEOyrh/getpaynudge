import { usePageMeta } from "@/hooks/usePageMeta";
import { brand } from "@/config/brand";

export default function Privacy() {
  usePageMeta({
    title: "Privacy Policy",
    description: `${brand.name} Privacy Policy. Learn how we collect, use, and protect your data.`,
  });

  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <article className="prose prose-sm prose-gray mx-auto max-w-3xl">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

          <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">1. What We Collect</h2>
              <p>{brand.name} collects the minimum data necessary to provide our service:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li><strong>Account information:</strong> Name, email address, business name.</li>
                <li><strong>Invoice data:</strong> Client names, email addresses, invoice amounts, due dates, payment URLs, and notes you enter.</li>
                <li><strong>Email delivery data:</strong> Send timestamps, delivery status, open and click events.</li>
                <li><strong>Usage data:</strong> Pages visited, features used, and basic analytics to improve the product.</li>
                <li><strong>Payment data:</strong> Billing information is processed securely by Stripe. We do not store your full credit card number.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">2. How We Use Your Data</h2>
              <ul className="list-disc space-y-1 pl-5">
                <li>To send invoice reminders on your behalf.</li>
                <li>To provide and improve the {brand.name} service.</li>
                <li>To process billing for your subscription.</li>
                <li>To communicate with you about your account, updates, and support requests.</li>
                <li>To detect and prevent fraud or abuse.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">3. What We Don't Do</h2>
              <ul className="list-disc space-y-1 pl-5">
                <li>We do not sell your data to third parties.</li>
                <li>We do not share your data with third parties for marketing purposes.</li>
                <li>We do not process, hold, or custody your clients' payments.</li>
                <li>We do not use your data for purposes unrelated to providing the service.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">4. Data Sharing</h2>
              <p>We share data only with service providers necessary to operate {brand.name}:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li><strong>Email delivery:</strong> To send reminders on your behalf.</li>
                <li><strong>Payment processing:</strong> Stripe processes subscription payments.</li>
                <li><strong>Infrastructure:</strong> Cloud hosting and database providers.</li>
              </ul>
              <p>We may also disclose data if required by law or to protect our rights.</p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">5. Data Security</h2>
              <p>
                We use industry-standard security measures including encryption in transit (TLS) and at rest.
                Access to data is restricted to authorized personnel and systems. However, no method of electronic
                transmission or storage is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">6. Data Retention</h2>
              <p>
                We retain your data for as long as your account is active or as needed to provide the service.
                When you delete your account, we remove your data permanently within 30 days, except where
                retention is required by law.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">7. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Access, update, or correct your personal data.</li>
                <li>Delete your account and all associated data.</li>
                <li>Export your data.</li>
                <li>Object to certain processing activities.</li>
              </ul>
              <p>To exercise these rights, contact us at <a href={`mailto:${brand.supportEmail}`} className="text-primary hover:underline">{brand.supportEmail}</a>.</p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">8. Cookies</h2>
              <p>
                We use essential cookies to keep you logged in and maintain your session. We may use basic
                analytics cookies to understand how the product is used. We do not use third-party advertising cookies.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">9. Changes to This Policy</h2>
              <p>
                We may update this policy from time to time. We will notify you of significant changes via email
                or an in-app notice. Continued use of {brand.name} after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">10. Contact</h2>
              <p>
                For questions about this policy, contact us at{" "}
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

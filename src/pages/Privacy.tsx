import { usePageMeta } from "@/hooks/usePageMeta";
import { brand } from "@/config/brand";

export default function Privacy() {
  usePageMeta({
    title: "Privacy Policy",
    description: `${brand.name} Privacy Policy — how we collect, use, store, and protect your data under GDPR, CCPA, and CAN-SPAM.`,
  });

  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <article className="prose prose-sm prose-gray mx-auto max-w-3xl">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">Effective date: April 16, 2026</p>

          <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
            {/* 1 */}
            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">1. Who We Are</h2>
              <p>
                {brand.name} is operated by {brand.legal.companyName} ("{brand.name}," "we," "us," "our"). We provide automated invoice reminder software for freelancers and small businesses. For GDPR purposes, we act as the <strong>data controller</strong> for account and billing data, and as a <strong>data processor</strong> for the invoice/client data you enter into the Service.
              </p>
            </section>

            {/* 2 */}
            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">2. Data We Collect</h2>
              <p>{brand.name} collects the minimum data necessary to provide the Service:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li><strong>Account information:</strong> Full name, email address, business name (provided at sign-up or in settings).</li>
                <li><strong>Invoice data you enter:</strong> Client names, client email addresses, invoice amounts, currencies, due dates, payment URLs, and notes. <em>You control this data; we process it only to send reminders on your behalf.</em></li>
                <li><strong>Email delivery metadata:</strong> Send timestamps, delivery status (sent, bounced, suppressed), and aggregate open/click rates used to improve deliverability.</li>
                <li><strong>Usage data:</strong> Pages visited, features used, browser type, and IP address — collected to improve the product and detect abuse. We do not use third-party advertising trackers.</li>
                <li><strong>Payment data:</strong> Subscription billing is processed by <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Stripe</a>. We never see or store your full credit-card number. Stripe acts as an independent data controller for payment information.</li>
              </ul>
            </section>

            {/* 3 */}
            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">3. How We Use Your Data</h2>
              <ul className="list-disc space-y-1 pl-5">
                <li>To send invoice payment reminders on your behalf.</li>
                <li>To operate, maintain, and improve the {brand.name} service.</li>
                <li>To process subscription billing.</li>
                <li>To communicate with you about your account, support requests, and material product changes.</li>
                <li>To detect, prevent, and respond to fraud, abuse, and security incidents.</li>
                <li>To comply with legal obligations.</li>
              </ul>
            </section>

            {/* 4 */}
            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">4. Lawful Basis for Processing (GDPR)</h2>
              <p>If you are in the EU/EEA or UK, our lawful bases under GDPR are:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li><strong>Contract performance (Art. 6(1)(b)):</strong> Processing your account and invoice data to deliver the Service you signed up for.</li>
                <li><strong>Legitimate interest (Art. 6(1)(f)):</strong> Usage analytics, fraud prevention, and product improvement — balanced against your privacy rights.</li>
                <li><strong>Legal obligation (Art. 6(1)(c)):</strong> Retaining billing records as required by tax and accounting laws.</li>
                <li><strong>Consent (Art. 6(1)(a)):</strong> Where we rely on consent (e.g., optional marketing emails from us to you), you may withdraw consent at any time.</li>
              </ul>
            </section>

            {/* 5 */}
            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">5. What We Don't Do</h2>
              <ul className="list-disc space-y-1 pl-5">
                <li>We do <strong>not</strong> sell, rent, or trade your personal data or your clients' data to any third party.</li>
                <li>We do <strong>not</strong> share data with third parties for their own marketing purposes.</li>
                <li>We do <strong>not</strong> process, hold, or custody any funds.</li>
                <li>We do <strong>not</strong> use your data for purposes unrelated to providing the Service.</li>
                <li>We do <strong>not</strong> use third-party advertising cookies or trackers.</li>
              </ul>
            </section>

            {/* 6 */}
            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">6. Data Sharing and Sub-Processors</h2>
              <p>We share data only with the following categories of service providers, each bound by data-processing agreements:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li><strong>Cloud infrastructure &amp; database:</strong> Hosting, storage, and database services to run the platform.</li>
                <li><strong>Email delivery:</strong> Sending reminder emails on your behalf.</li>
                <li><strong>Payment processing:</strong> Stripe — for subscription billing only.</li>
                <li><strong>Security:</strong> Cloudflare — for bot protection (Turnstile), CDN, and DDoS mitigation.</li>
              </ul>
              <p>We may also disclose data if required by law, regulation, subpoena, or court order, or to protect the rights, property, or safety of {brand.name}, its users, or the public.</p>
            </section>

            {/* 7 */}
            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">7. International Data Transfers</h2>
              <p>
                Our servers are located in the United States. If you access the Service from the EU/EEA, UK, or other jurisdictions with data-transfer restrictions, your personal data may be transferred to and processed in the U.S. We rely on Standard Contractual Clauses (SCCs) and/or adequacy decisions where applicable to ensure an adequate level of data protection.
              </p>
            </section>

            {/* 8 */}
            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">8. Data Security</h2>
              <p>
                We use industry-standard security measures including encryption in transit (TLS 1.2+) and at rest. Access to data is restricted to authorized systems and personnel on a need-to-know basis. While we strive to protect your data, no method of electronic transmission or storage is 100% secure.
              </p>
            </section>

            {/* 9 */}
            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">9. Data Retention</h2>
              <p>
                We retain your data for as long as your account is active or as needed to provide the Service. If you delete your account, we permanently remove your personal data and invoice data within 30 days, except where retention is required by tax, accounting, or other legal obligations (typically up to 7 years for billing records).
              </p>
            </section>

            {/* 10 */}
            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">10. Your Rights</h2>
              <p>Depending on your jurisdiction, you may have the right to:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li><strong>Access</strong> the personal data we hold about you.</li>
                <li><strong>Rectify</strong> inaccurate or incomplete data.</li>
                <li><strong>Erase</strong> your data ("right to be forgotten").</li>
                <li><strong>Restrict</strong> or <strong>object to</strong> certain processing activities.</li>
                <li><strong>Data portability</strong> — receive your data in a structured, machine-readable format.</li>
                <li><strong>Withdraw consent</strong> at any time where processing is based on consent.</li>
                <li><strong>Lodge a complaint</strong> with a supervisory authority (EU/EEA/UK residents).</li>
              </ul>
              <p className="mt-2"><strong>CCPA/CPRA (California residents):</strong> You have the right to know what personal information we collect, request its deletion, and opt out of the sale of personal information. We do not sell personal information. To exercise any right, contact us at <a href={`mailto:${brand.supportEmail}`} className="text-primary hover:underline">{brand.supportEmail}</a>. We will respond within the timeframe required by applicable law (typically 30 days for GDPR, 45 days for CCPA).</p>
            </section>

            {/* 11 */}
            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">11. Cookies and Tracking</h2>
              <p>
                We use <strong>essential cookies</strong> only — to maintain your authentication session and CSRF protection. We do not use third-party advertising cookies, cross-site tracking pixels, or retargeting technologies.
              </p>
              <p>
                We use Cloudflare Turnstile for bot protection, which may set a cookie. See <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Cloudflare's Privacy Policy</a> for details.
              </p>
            </section>

            {/* 12 */}
            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">12. Children's Privacy</h2>
              <p>
                {brand.name} is not intended for individuals under 18 years of age. We do not knowingly collect personal data from children. If we learn that we have collected data from a child, we will delete it promptly.
              </p>
            </section>

            {/* 13 */}
            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">13. Email Communications (CAN-SPAM Compliance)</h2>
              <p>
                Reminder emails sent by {brand.name} on your behalf are transactional messages relating to an existing business obligation between you and your client. They are not commercial or marketing emails. Each reminder includes an unsubscribe link so recipients can opt out of future reminders for that invoice.
              </p>
              <p>
                We may send you account-related emails (e.g., billing receipts, security alerts, material product changes). These are transactional and do not require consent. We will not send you marketing or promotional emails unless you have explicitly opted in, and you may unsubscribe at any time.
              </p>
            </section>

            {/* 14 */}
            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">14. Data Breach Notification</h2>
              <p>
                In the event of a data breach that affects your personal data, we will notify you and any applicable supervisory authority within the timeframes required by law (72 hours under GDPR where feasible).
              </p>
            </section>

            {/* 15 */}
            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">15. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of material changes via email or an in-app notice at least 30 days before they take effect. Continued use of {brand.name} after the effective date constitutes acceptance of the updated policy.
              </p>
            </section>

            {/* 16 */}
            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">16. Contact</h2>
              <p>
                For privacy inquiries, data-subject requests, or questions about this policy, contact us at{" "}
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

import { usePageMeta } from "@/hooks/usePageMeta";
import { brand } from "@/config/brand";

export default function Terms() {
  usePageMeta({
    title: "Terms of Service",
    description: `${brand.name} Terms of Service — rules for using the automated invoice reminder platform.`,
  });

  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <article className="prose prose-sm prose-gray mx-auto max-w-3xl">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground">Effective date: April 16, 2026</p>

          <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
              <p>
                By creating an account on or otherwise using {brand.name} ("the Service"), operated by {brand.legal.companyName} ("we," "us," "our"), you ("you," "your," "User") agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">2. Description of Service</h2>
              <p>
                {brand.name} is a software-as-a-service (SaaS) platform that lets freelancers and small businesses track invoices they have already issued and send automated email payment reminders to their own clients. The Service may include a link to a payment URL you provide in each reminder email.
              </p>
              <p>
                <strong>{brand.name} is not a payment processor, debt collection agency, or financial institution.</strong> We do not process, hold, transmit, or custody any funds. All payments between you and your clients happen entirely outside {brand.name} through your own payment provider (e.g., Stripe, PayPal, bank transfer). We do not purchase, own, or service debts and are not subject to the Fair Debt Collection Practices Act (FDCPA) or any equivalent state or international debt-collection statute.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">3. Eligibility</h2>
              <p>You must be at least 18 years old and capable of forming a binding contract to use {brand.name}. By using the Service you represent that you meet these requirements.</p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">4. Permitted Use</h2>
              <p>You may only use {brand.name} for <strong>first-party invoice follow-up</strong>. This means:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>You (or your business) issued the invoice.</li>
                <li>You have a legitimate, existing business relationship with the recipient.</li>
                <li>The recipient owes payment for goods or services you actually delivered.</li>
              </ul>
              <p>You may <strong>not</strong> use {brand.name} to:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Collect debts purchased or acquired from third parties.</li>
                <li>Harass, threaten, or intimidate any person.</li>
                <li>Send reminders for fraudulent, fabricated, or disputed invoices where no genuine obligation exists.</li>
                <li>Send marketing, promotional, or advertising messages disguised as invoice reminders.</li>
                <li>Violate any applicable law, including consumer-protection, anti-harassment, anti-spam (CAN-SPAM, CASL), and data-protection laws (GDPR, CCPA/CPRA).</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">5. Your Responsibilities</h2>
              <ul className="list-disc space-y-1 pl-5">
                <li>You are solely responsible for the accuracy of all invoice information you enter, including amounts, due dates, and recipient email addresses.</li>
                <li>You must promptly mark invoices as paid once payment is received to stop further reminders.</li>
                <li>You must comply with all applicable laws governing email communications with your clients, including CAN-SPAM (U.S.), CASL (Canada), GDPR (EU/EEA), and any other relevant jurisdiction-specific legislation.</li>
                <li>You must not send reminders to recipients who have asked you — through any channel — to stop receiving them.</li>
                <li>You acknowledge that <strong>you</strong> — not {brand.name} — are the sender of each reminder email for the purposes of CAN-SPAM and other email legislation, and you are responsible for ensuring each communication is lawful.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">6. Accounts and Security</h2>
              <p>
                You must provide accurate information when creating an account. You are responsible for safeguarding your credentials and for all activity under your account. Notify us immediately at <a href={`mailto:${brand.supportEmail}`} className="text-primary hover:underline">{brand.supportEmail}</a> if you suspect unauthorized access. We are not liable for losses arising from unauthorized use of your account that was not caused by our negligence.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">7. Free Plan, Trials, and Paid Subscriptions</h2>
              <p>
                {brand.name} offers a free tier with limited features. Paid plans are billed monthly in advance via Stripe. By subscribing, you authorize us to charge your selected payment method at the start of each billing cycle.
              </p>
              <p>
                Paid plans may include a free trial period. At the end of the trial your card will be charged unless you cancel before the trial expires. You may cancel your subscription at any time from the Billing page; access to paid features continues until the end of the current billing period.
              </p>
              <p>
                All fees are stated in USD and are non-refundable except where required by applicable law. We may change prices with at least 30 days' prior notice.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">8. Intellectual Property</h2>
              <p>
                All rights, title, and interest in the Service — including its code, design, trademarks, and documentation — belong to {brand.legal.companyName}. These Terms grant you a limited, non-exclusive, non-transferable, revocable license to use the Service for its intended purpose.
              </p>
              <p>
                You retain ownership of the data you submit to {brand.name} (invoices, client information, notes). By using the Service you grant us a limited license to store, process, and transmit that data solely to provide the Service to you.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">9. Disclaimer of Warranties</h2>
              <p>
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT GUARANTEE THAT REMINDERS WILL RESULT IN PAYMENT, THAT EMAILS WILL ALWAYS BE DELIVERED, OR THAT THE SERVICE WILL BE UNINTERRUPTED OR ERROR-FREE.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">10. Limitation of Liability</h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, {brand.legal.companyName.toUpperCase()}'S AGGREGATE LIABILITY FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE TOTAL AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO THE CLAIM. IN NO EVENT SHALL WE BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">11. Indemnification</h2>
              <p>
                You agree to indemnify, defend, and hold harmless {brand.legal.companyName} and its officers, directors, employees, and agents from any claims, damages, losses, or expenses (including reasonable attorneys' fees) arising out of: (a) your use of the Service; (b) your violation of these Terms; (c) content you submit through the Service; or (d) your violation of any law or the rights of a third party.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">12. Termination</h2>
              <p>
                We may suspend or terminate your account if you violate these Terms, engage in prohibited use, or if required by law. You may delete your account at any time from the Settings page. Upon termination, your right to use the Service ceases immediately. Sections 8 – 11 and 13 – 14 survive termination.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">13. Governing Law and Disputes</h2>
              <p>
                These Terms are governed by the laws of the State of Delaware, United States, without regard to conflict-of-law principles. Any dispute arising under these Terms shall first be submitted to good-faith mediation. If mediation fails, the dispute shall be resolved exclusively in the state or federal courts located in Delaware. You waive any objection to jurisdiction or venue in those courts.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">14. Changes to Terms</h2>
              <p>
                We may update these Terms from time to time. We will notify you of material changes via email or an in-app banner at least 30 days before they take effect. Continued use of {brand.name} after the effective date constitutes your acceptance of the revised Terms.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">15. Contact</h2>
              <p>
                For questions about these Terms, contact us at{" "}
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

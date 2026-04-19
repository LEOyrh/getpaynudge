import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, HelpCircle, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePageMeta } from "@/hooks/usePageMeta";
import { brand, plans } from "@/config/brand";
import { cn } from "@/lib/utils";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const comparisonFeatures = [
  { name: "Active invoices", values: ["3", "25", "Unlimited"] },
  { name: "Stripe sync (read-only key)", values: [true, true, true] },
  { name: "Open & click tracking", values: [true, true, true] },
  { name: "Pay link in reminders", values: [true, true, true] },
  { name: "Activity timeline", values: [true, true, true] },
  { name: "Automatic reminder cadence", values: [false, true, true] },
  { name: "Custom cadence + tone", values: [false, true, true] },
  { name: "AI-personalized in your voice", values: [false, true, true] },
  { name: "QuickBooks / Xero sync (coming)", values: [false, false, true] },
  { name: "Predicted pay dates", values: [false, false, true] },
  { name: "Pay-Behavior Score per client", values: [false, false, true] },
  { name: "Weekly Receivables Health report", values: [false, false, true] },
  { name: "Priority email support", values: [false, false, true] },
];

const competitorRows: Array<{ feature: string; values: (boolean | string)[] }> = [
  { feature: "Honest free tier (real limits, no trial-only)", values: [true, true, true, false, true] },
  { feature: "Real automation (not copy/paste)", values: [true, true, true, true, false] },
  { feature: "Stripe / QuickBooks / Xero sync", values: [true, false, false, true, false] },
  { feature: "AI written in your voice", values: [true, false, false, false, "generic"] },
  { feature: "Predicted pay date per client", values: [true, false, false, false, false] },
  { feature: "Open & click tracking", values: [true, false, true, true, false] },
  { feature: "English-first, professional UX", values: [true, true, false, true, false] },
];

const competitorColumns = ["PayNudge", "paynudges.com", "paynudge.app", "paynudge.xyz", "paynudge.eu"];

export default function Pricing() {
  usePageMeta({
    title: "Pricing",
    description: `Simple, transparent pricing for ${brand.name}. Start free with one invoice. Upgrade as you grow.`,
  });

  return (
    <>
      <section className="py-20 md:py-28">
        <div className="container">
          <motion.div
            className="mx-auto max-w-2xl text-center"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.h1
              variants={fadeIn}
              className="text-display text-5xl text-foreground md:text-6xl"
            >
              Simple pricing. No surprises.
            </motion.h1>
            <motion.p variants={fadeIn} className="mt-4 text-lg text-muted-foreground">
              Start free. Upgrade when you need more invoices. Cancel anytime.
            </motion.p>
          </motion.div>

          <motion.div
            className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            {plans.map((plan) => (
              <motion.div key={plan.id} variants={fadeIn}>
                <Card
                  className={cn(
                    "relative h-full",
                    plan.highlighted
                      ? "border-primary ring-1 ring-primary"
                      : "border-border"
                  )}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                      Most Popular
                    </div>
                  )}
                  <CardContent className="pt-8 pb-6">
                    <h3 className="font-heading text-lg font-bold text-foreground">{plan.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                    <div className="mt-4">
                      <span className="font-heading text-4xl font-bold text-foreground">
                        ${plan.price}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-sm text-muted-foreground">/month</span>
                      )}
                    </div>
                    <ul className="mt-6 space-y-2">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="mt-6 w-full"
                      variant={plan.highlighted ? "default" : "outline"}
                      asChild
                    >
                      <Link to={plan.cta === "Contact Sales" ? "/contact" : "/signup"}>{plan.cta}</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="border-t border-border py-20 md:py-28">
        <div className="container">
          <h2 className="mb-12 text-center font-heading text-3xl font-bold text-foreground">
            Feature comparison
          </h2>
          <div className="mx-auto max-w-4xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 pr-4 text-left font-medium text-muted-foreground">Feature</th>
                  {plans.map((p) => (
                    <th
                      key={p.id}
                      className={cn(
                        "py-3 px-4 text-center font-semibold",
                        p.highlighted ? "text-primary" : "text-foreground"
                      )}
                    >
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row) => (
                  <tr key={row.name} className="border-b border-border">
                    <td className="py-3 pr-4 text-muted-foreground">{row.name}</td>
                    {row.values.map((val, i) => (
                      <td key={i} className="py-3 px-4 text-center">
                        {typeof val === "boolean" ? (
                          val ? (
                            <CheckCircle2 className="mx-auto h-4 w-4 text-primary" />
                          ) : (
                            <Minus className="mx-auto h-4 w-4 text-muted-foreground/40" />
                          )
                        ) : (
                          <span className="font-medium text-foreground">{val}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="border-t border-border py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-eyebrow text-muted-foreground">vs. the field</span>
            <h2 className="mt-4 font-heading text-3xl font-bold text-foreground md:text-4xl">
              Why teams pick PayNudge over the other "paynudges"
            </h2>
            <p className="mt-4 text-muted-foreground">
              We're the only one combining real automation, integrations, AI in your voice,
              and predicted pay dates — at an honest price, with an honest free tier.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-5xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 pr-4 text-left text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
                    Feature
                  </th>
                  {competitorColumns.map((col, i) => (
                    <th
                      key={col}
                      className={cn(
                        "py-3 px-3 text-center text-xs font-bold uppercase tracking-[0.15em]",
                        i === 0 ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {competitorRows.map((row) => (
                  <tr key={row.feature} className="border-b border-border">
                    <td className="py-3 pr-4 text-foreground">{row.feature}</td>
                    {row.values.map((val, i) => (
                      <td
                        key={i}
                        className={cn(
                          "py-3 px-3 text-center",
                          i === 0 && "bg-primary/5"
                        )}
                      >
                        {typeof val === "boolean" ? (
                          val ? (
                            <CheckCircle2 className="mx-auto h-4 w-4 text-primary" />
                          ) : (
                            <Minus className="mx-auto h-4 w-4 text-muted-foreground/40" />
                          )
                        ) : (
                          <span className="text-xs font-medium text-muted-foreground">{val}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Comparison based on public marketing pages as of {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}.{" "}
              <Link to="/compare" className="text-primary hover:underline">
                See full breakdown →
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container">
          <h2 className="mb-10 text-center font-heading text-3xl font-bold text-foreground">
            Pricing FAQ
          </h2>
          <div className="mx-auto max-w-2xl space-y-6">
            {[
              {
                q: "Do I have to use Stripe?",
                a: "No. Most users add invoices manually — it takes about 30 seconds per invoice. Stripe sync is an optional shortcut if you already bill in Stripe. QuickBooks and Xero connectors are on the roadmap.",
              },
              {
                q: "How does Stripe sync work (if I want it)?",
                a: "Paste a read-only Stripe restricted key in Settings. We pull every open and overdue invoice — with the customer, due date, amount, and Stripe-hosted pay link — so reminders go out automatically. Read-only means we can never move your money. Available on every plan, including Free.",
              },
              {
                q: "Can I switch plans anytime?",
                a: "Yes. Upgrade or downgrade at any time. Changes apply to your next billing cycle.",
              },
              {
                q: "What counts as an active invoice?",
                a: "An active invoice is any invoice that is not marked as paid, archived, or disputed. Paused invoices still count as active. Stripe-imported and manually-entered invoices both count toward your plan limit.",
              },
              {
                q: "Do you offer a free trial?",
                a: "Yes! All paid plans include a 7-day free trial. You won't be charged until the trial ends. Cancel anytime during the trial at no cost.",
              },
              {
                q: "Is there a contract or commitment?",
                a: "No. All plans are month-to-month. Cancel anytime with no penalties.",
              },
              {
                q: "Do you offer annual billing?",
                a: "Not yet, but it's on our roadmap. Monthly billing keeps things simple for now.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit and debit cards via Stripe.",
              },
            ].map((faq) => (
              <div key={faq.q} className="border-b border-border pb-6">
                <h3 className="flex items-start gap-2 font-heading text-base font-semibold text-foreground">
                  <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {faq.q}
                </h3>
                <p className="mt-2 pl-6 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border py-16">
        <div className="container text-center">
          <h2 className="font-heading text-2xl font-bold text-foreground">Ready to get started?</h2>
          <p className="mt-3 text-muted-foreground">
            Start with the free plan. No credit card required.
          </p>
          <Button size="lg" className="mt-6" asChild>
            <Link to="/signup">
              Start Free <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageMeta } from "@/hooks/usePageMeta";
import { brand } from "@/config/brand";
import { cn } from "@/lib/utils";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const competitors = [
  {
    name: "paynudges.com",
    angle: "Single $6.99 plan, minimalist",
    weakness:
      "No tracking, no integrations, no segmentation. Cheap, but you outgrow it the moment you have more than a handful of clients.",
  },
  {
    name: "paynudge.app",
    angle: "Heavy feature set, EU-Romania flavor, WhatsApp via Whapi",
    weakness:
      "Pricing is steep (€29.90 → €49.90), the UI is cluttered, and WhatsApp requires you to bring your own Whapi account.",
  },
  {
    name: "paynudge.xyz",
    angle: "Trades-niche (cleaners, landscapers), $29 flat",
    weakness:
      "No free tier. Single $29 plan. Coded for US trades — feels off if you sell services, design, or consulting.",
  },
  {
    name: "paynudge.eu",
    angle: "AI-rewritten reminders + EU late-fee calculator, €19 lifetime",
    weakness:
      "Manual flow — you copy the AI's draft into your own email client. Not real automation. EU-only legal flavor.",
  },
];

const matrix: Array<{ feature: string; values: (boolean | string)[] }> = [
  { feature: "Real automated sending", values: [true, true, true, true, false] },
  { feature: "Honest free tier (forever)", values: [true, true, true, false, true] },
  { feature: "Stripe sync (read-only key)", values: [true, false, false, true, false] },
  { feature: "AI written in your voice", values: [true, false, false, false, "generic"] },
  { feature: "Predicted pay date per client", values: [true, false, false, false, false] },
  { feature: "Pay-Behavior Score", values: [true, false, false, false, false] },
  { feature: "Open & click tracking", values: [true, false, true, true, false] },
  { feature: "Activity timeline per invoice", values: [true, false, true, true, false] },
  { feature: "Weekly Receivables Health email", values: [true, false, false, false, false] },
  { feature: "Starts at", values: ["$0", "$6.99", "€0", "$29", "€0"] },
];

const cols = ["PayNudge", "paynudges.com", "paynudge.app", "paynudge.xyz", "paynudge.eu"];

export default function Compare() {
  usePageMeta({
    title: `${brand.name} vs. paynudge.app, paynudge.xyz, paynudge.eu`,
    description: `How ${brand.name} compares to paynudges.com, paynudge.app, paynudge.xyz, and paynudge.eu. Real automation, integrations, AI in your voice, and predicted pay dates.`,
  });

  return (
    <>
      <section className="py-20 md:py-28">
        <div className="container">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.span variants={fadeIn} className="text-eyebrow text-muted-foreground">
              Compare
            </motion.span>
            <motion.h1
              variants={fadeIn}
              className="text-display mt-6 text-4xl text-foreground md:text-6xl"
            >
              {brand.name} vs. the other <span className="lime-underline">"paynudges"</span>
            </motion.h1>
            <motion.p variants={fadeIn} className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Six tools share the name. Only one is built as the accounts-receivable autopilot
              for solo operators and studios who actually want to get paid on time.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="border-t border-border py-16">
        <div className="container">
          <div className="mx-auto max-w-6xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-4 pr-4 text-left text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
                    Feature
                  </th>
                  {cols.map((c, i) => (
                    <th
                      key={c}
                      className={cn(
                        "py-4 px-3 text-center text-xs font-bold uppercase tracking-[0.15em]",
                        i === 0 ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((row) => (
                  <tr key={row.feature} className="border-b border-border">
                    <td className="py-4 pr-4 text-foreground">{row.feature}</td>
                    {row.values.map((val, i) => (
                      <td
                        key={i}
                        className={cn(
                          "py-4 px-3 text-center",
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
                          <span className="text-xs font-medium text-foreground">{val}</span>
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
          <h2 className="mx-auto max-w-2xl text-center font-heading text-3xl font-bold text-foreground md:text-4xl">
            Who each tool is actually for
          </h2>
          <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2">
            {competitors.map((c) => (
              <div key={c.name} className="border border-border bg-card p-6">
                <h3 className="font-heading text-lg font-bold text-foreground">{c.name}</h3>
                <p className="mt-2 text-sm font-medium text-muted-foreground">{c.angle}</p>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{c.weakness}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border py-16">
        <div className="container text-center">
          <h2 className="font-heading text-2xl font-bold text-foreground">
            Pick the one that grows with you.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Free forever for 3 invoices. Paid plans start at $9/mo. Cancel anytime.
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

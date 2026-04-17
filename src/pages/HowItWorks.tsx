import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock,
  FileText,
  Link2,
  Mail,
  PauseCircle,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePageMeta } from "@/hooks/usePageMeta";
import { brand } from "@/config/brand";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function HowItWorks() {
  usePageMeta({
    title: "How It Works",
    description: `Learn how ${brand.name} automates invoice reminders in three simple steps. Add an invoice, set your cadence, and get paid.`,
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
              How {brand.name} Works
            </motion.h1>
            <motion.p variants={fadeIn} className="mt-4 text-lg text-muted-foreground">
              From invoice to payment — in three steps, under 60 seconds to set up.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="border-t border-border py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-3xl space-y-16">
            {[
              {
                step: "1",
                icon: FileText,
                title: "Add your invoice details",
                description:
                  "Enter the basics: client name, email, invoice amount, due date, and your payment link (Stripe, QuickBooks, Xero, or any URL). Optional: add bank transfer instructions or notes.",
                details: [
                  "Supports any currency",
                  "Add your own payment URL — we never touch funds",
                  "Optional notes for context",
                  "Duplicate invoices for repeat clients",
                ],
              },
              {
                step: "2",
                icon: Clock,
                title: "Choose your reminder schedule",
                description:
                  "Pick a default cadence or create your own. Set the tone — friendly, professional, or firm. Preview the email before activating.",
                details: [
                  "Default: 3 days before, due date, +3, +7, +14 days",
                  "Custom cadence for any schedule",
                  "Three tone options with escalation",
                  "Preview emails before they go out",
                ],
              },
              {
              step: "3",
              icon: CheckCircle2,
              title: "Sit back and get paid",
              description:
                "Reminders go out automatically on schedule. Track activity per invoice. When you're paid, mark it done — reminders stop instantly.",
              details: [
                "Automatic sending on schedule",
                "Open and click tracking",
                "Activity timeline per invoice",
                "Auto-stop on payment or dispute",
              ],
              },
            ].map((item) => (
              <motion.div
                key={item.step}
                className="flex flex-col gap-6 md:flex-row md:gap-10"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={stagger}
              >
                <motion.div variants={fadeIn} className="shrink-0">
                  <div className="flex h-14 w-14 items-center justify-center rounded-sm bg-primary text-2xl font-bold text-primary-foreground">
                    {item.step}
                  </div>
                </motion.div>
                <motion.div variants={fadeIn}>
                  <div className="mb-2 flex items-center gap-2">
                    <item.icon className="h-5 w-5 text-primary" />
                    <h2 className="font-heading text-2xl font-bold text-foreground">
                      {item.title}
                    </h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                  <ul className="mt-4 space-y-2">
                    {item.details.map((d) => (
                      <li key={d} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container">
          <h2 className="mb-12 text-center font-heading text-3xl font-bold text-foreground">
            What happens behind the scenes
          </h2>
          <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
            {[
              {
                icon: Mail,
                title: "Smart email delivery",
                description:
                  "Reminders are sent from our infrastructure with your business name and reply-to address. Clients reply directly to you.",
              },
              {
                icon: TrendingUp,
                title: "Escalating tone",
                description:
                  "Early reminders are gentle. Later ones get more direct. The tone matches what you'd write yourself, just consistently.",
              },
              {
                icon: PauseCircle,
                title: "Automatic guardrails",
                description:
                  "Reminders stop when an invoice is paid, disputed, or paused. Frequency caps prevent over-contacting.",
              },
              {
                icon: Bell,
                title: "Activity tracking",
                description:
                  "See every reminder sent, opened, and clicked. Know exactly where each invoice stands without asking.",
              },
            ].map((item) => (
              <Card key={item.title} className="border-border">
                <CardContent className="pt-6 pb-6">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                    <item.icon className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border py-16">
        <div className="container text-center">
          <h2 className="font-heading text-2xl font-bold text-foreground">Ready to stop chasing payments?</h2>
          <p className="mt-3 text-muted-foreground">
            Create your free account and add your first invoice in under a minute.
          </p>
          <Button size="lg" className="mt-6" asChild>
            <Link to="/signup">
              Get Started Free <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}

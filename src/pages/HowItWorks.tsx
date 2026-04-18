import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bell,
  CalendarClock,
  CheckCircle2,
  Mail,
  PauseCircle,
  Plug,
  Sparkles,
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
    description: `${brand.name} connects to your invoicing tool, learns your voice, predicts when each client will pay, and chases every late invoice for you.`,
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
              How it works
            </motion.span>
            <motion.h1
              variants={fadeIn}
              className="text-display mt-6 text-5xl text-foreground md:text-6xl"
            >
              Connect. Learn your voice. <span className="lime-underline">Predict & chase.</span>
            </motion.h1>
            <motion.p variants={fadeIn} className="mt-6 text-lg text-muted-foreground">
              No copy-paste. No retyping clients. {brand.name} plugs into the tools you already
              use and runs your accounts-receivable on autopilot.
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
                icon: Plug,
                title: "Connect your invoicing tool",
                description:
                  "One-click sync with Stripe, QuickBooks, or Xero. New invoices flow in automatically — no double entry, no CSV imports, no manual setup.",
                details: [
                  "Read-only OAuth — we never touch your funds",
                  "Auto-imports new invoices on a 15-minute schedule",
                  "Manual entry still works if you prefer it",
                  "Studio plan: connect all integrations at once",
                ],
              },
              {
                step: "2",
                icon: Sparkles,
                title: "Teach us your voice (once)",
                description:
                  "Paste two or three reminder emails you've sent before. Our AI learns your tone, your sign-off, and your phrasing — then writes every reminder in your style. Forever.",
                details: [
                  "Trained from your own past emails",
                  "Tone escalates gradually as invoices age",
                  "You can preview and edit any reminder before it sends",
                  "Update your voice anytime",
                ],
              },
              {
                step: "3",
                icon: CalendarClock,
                title: "We predict, we chase, you get paid",
                description:
                  "Every client gets a Pay-Behavior Score. Every open invoice gets a predicted pay date. Reminders fire on schedule, escalate gracefully, and stop the moment money lands.",
                details: [
                  "Per-client Pay-Behavior Score updated after every payment",
                  "Predicted pay date on every open invoice",
                  "Auto-stop on payment, dispute, or pause",
                  "Weekly Receivables Health digest in your inbox",
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
                  "Reminders sent from our infrastructure with your business name and reply-to. Clients reply directly to you.",
              },
              {
                icon: TrendingUp,
                title: "Tone that escalates with you",
                description:
                  "AI matches your voice and gradually firms up as invoices age — without ever crossing into harassment.",
              },
              {
                icon: PauseCircle,
                title: "Automatic guardrails",
                description:
                  "Reminders stop on payment, dispute, or pause. Frequency caps prevent over-contacting any client.",
              },
              {
                icon: Bell,
                title: "Health digest, every Monday",
                description:
                  "\"You're owed $X across N invoices. Predicted to collect $Y this week.\" One email, total clarity.",
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
          <h2 className="font-heading text-2xl font-bold text-foreground">
            Ready to put your accounts-receivable on autopilot?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Free forever for 3 invoices. Connect your invoicing tool in under a minute.
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

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bell,
  CalendarClock,
  CheckCircle2,
  Clock,
  FileText,
  LineChart,
  Link2,
  Mail,
  Minus,
  MousePointerClick,
  PauseCircle,
  Plug,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePageMeta } from "@/hooks/usePageMeta";
import { brand, plans } from "@/config/brand";
import { cn } from "@/lib/utils";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function Index() {
  usePageMeta({
    title: brand.name,
    description: brand.description,
  });

  return (
    <>
      <HeroSection />
      <SocialProofStrip />
      <WhoItsForSection />
      <WorksWithStrip />
      <StripeSyncSection />
      <DifferentiatorSection />
      <HowItWorksSection />
      <PayBehaviorScoreSection />
      <FeaturesSection />
      <ReminderSequenceSection />
      <CompetitorComparisonSection />
      <PricingPreview />
      <TrustSection />
      <FAQPreview />
      <FinalCTA />
    </>
  );
}

function WorksWithStrip() {
  return (
    <section className="border-b border-border py-10">
      <div className="container">
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Works with
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {/* Official Stripe wordmark — themed via currentColor */}
            <a
              href="https://stripe.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Stripe"
              className="group inline-flex items-center text-foreground/75 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:text-foreground focus-visible:-translate-y-0.5 focus-visible:text-foreground focus-visible:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 60 25"
                role="img"
                aria-hidden="true"
                className="h-5 w-auto fill-current transition-transform duration-300 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.62l.21 1.03c.56-.52 1.59-1.27 3.17-1.27 2.84 0 5.52 2.55 5.52 7.24 0 5.12-2.65 7.74-5.48 7.74zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.27 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.47 1.86zm-8.36 4.78c0 2.41 2.58 1.66 3.11 1.44v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.14l.02 5.9zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 0 1-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.53-.24 1.53-1C6.46 13.77 0 14.45 0 9.69 0 6.78 2.23 5 5.54 5c1.38 0 2.75.21 4.13.81v3.88a9.7 9.7 0 0 0-4.13-1.03c-.86 0-1.4.25-1.4.78 0 1.74 6.51.95 6.51 5.36z"
                />
              </svg>
            </a>
            <span className="text-sm text-muted-foreground/60">+</span>
            <span className="text-sm font-medium text-muted-foreground">Manual entry</span>
            <span className="hidden text-sm text-muted-foreground/40 sm:inline">·</span>
            <span className="text-xs uppercase tracking-wider text-muted-foreground/70">
              QuickBooks &amp; Xero <span className="text-primary">coming soon</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border py-24 md:py-36">
      {/* Lime spotlight */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.18]"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, hsl(var(--primary) / 0.55), transparent 70%)",
        }}
      />
      {/* Grid texture */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="container relative z-10">
        <motion.div
          className="mx-auto max-w-5xl text-center"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeIn}>
            <span className="text-eyebrow inline-flex items-center gap-2 text-muted-foreground">
              <span className="h-1 w-1 bg-primary" aria-hidden />
              Invoice reminders on autopilot
            </span>
          </motion.div>

          <motion.h1
            variants={fadeIn}
            className="text-display mt-8 text-5xl text-foreground sm:text-6xl md:text-7xl lg:text-8xl"
          >
            Get paid <span className="lime-underline">without</span> the awkward follow-up.
          </motion.h1>

          <motion.p
            variants={fadeIn}
            className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground md:text-xl"
          >
            {brand.name} chases every open and overdue invoice in your voice — until your client
            pays. Add invoices manually or sync them from Stripe in 60 seconds.
          </motion.p>

          <motion.div
            variants={fadeIn}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button size="lg" asChild className="h-12 px-8 text-sm font-bold uppercase tracking-[0.15em]">
              <Link to="/signup">
                Start Free <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="h-12 border-foreground/20 px-8 text-sm font-bold uppercase tracking-[0.15em] hover:border-foreground hover:bg-transparent"
            >
              <Link to="/how-it-works">How It Works</Link>
            </Button>
          </motion.div>

          <motion.p variants={fadeIn} className="mt-6 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Free plan · No credit card · Stripe sync optional
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

function WhoItsForSection() {
  const audiences = [
    { icon: Users, label: "Freelancers" },
    { icon: FileText, label: "Agencies" },
    { icon: TrendingUp, label: "Consultants" },
    { icon: Zap, label: "Designers & Developers" },
    { icon: Mail, label: "Coaches" },
    { icon: Clock, label: "Service Businesses" },
  ];

  return (
    <section className="border-y border-border py-12">
      <div className="container">
        <p className="mb-6 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Built for people who send invoices
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {audiences.map((a) => (
            <div key={a.label} className="flex items-center gap-2 text-muted-foreground">
              <a.icon className="h-4 w-4" />
              <span className="text-sm font-medium">{a.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      number: "1",
      title: "Add your invoice",
      description:
        "Enter the client, amount, due date, and your payment link. It takes under 60 seconds.",
      icon: FileText,
    },
    {
      number: "2",
      title: "Set your reminder cadence",
      description:
        "Choose when reminders go out — before the due date, on the due date, and at escalating intervals after.",
      icon: Clock,
    },
    {
      number: "3",
      title: "Get paid automatically",
      description:
        "We send polite, professional reminders with your payment link. Reminders stop the moment you're paid.",
      icon: CheckCircle2,
    },
  ];

  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.h2
            variants={fadeIn}
            className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl"
          >
            How it works
          </motion.h2>
          <motion.p variants={fadeIn} className="mt-4 text-lg text-muted-foreground">
            Three steps. No complexity. Just consistent follow-up that gets results.
          </motion.p>
        </motion.div>

        <motion.div
          className="mt-14 grid gap-8 md:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          {steps.map((step) => (
            <motion.div key={step.number} variants={fadeIn}>
              <Card className="relative h-full border-border bg-card">
                <CardContent className="pt-8 pb-8">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-sm bg-accent">
                    <step.icon className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    Step {step.number}
                  </span>
                  <h3 className="mt-2 font-heading text-xl font-bold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: Bell,
      title: "Automatic Reminders",
      description: "Set it and forget it. Reminders go out on schedule without any manual work.",
    },
    {
      icon: Plug,
      title: "Stripe Sync",
      description:
        "Connect Stripe with a read-only restricted key. Open and overdue invoices flow in automatically with the hosted pay link attached.",
    },
    {
      icon: TrendingUp,
      title: "Escalating Tone",
      description: "Start friendly, get firmer. Choose your tone and let the cadence do the work.",
    },
    {
      icon: PauseCircle,
      title: "Smart Auto-Stop",
      description: "Reminders halt automatically when an invoice is marked paid or disputed.",
    },
    {
      icon: MousePointerClick,
      title: "Open & Click Tracking",
      description: "See when clients open your reminders and click your payment link.",
    },
    {
      icon: FileText,
      title: "Activity Timeline",
      description: "See every reminder sent and status change. Know exactly where each invoice stands.",
    },
    {
      icon: Shield,
      title: "Professional & Compliant",
      description:
        "No threatening language. No harassment. Just polite, consistent follow-up you'd be proud to send.",
    },
  ];

  return (
    <section className="border-t border-border py-20 md:py-28">
      <div className="container">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.h2
            variants={fadeIn}
            className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl"
          >
            Everything you need to get paid on time
          </motion.h2>
          <motion.p variants={fadeIn} className="mt-4 text-lg text-muted-foreground">
            Simple tools that handle the follow-up so you don't have to.
          </motion.p>
        </motion.div>

        <motion.div
          className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          {features.map((f) => (
            <motion.div key={f.title} variants={fadeIn}>
              <Card className="h-full border-border">
                <CardContent className="pt-6 pb-6">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                    <f.icon className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    {f.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function ReminderSequenceSection() {
  const sequence = [
    { day: "Day -3", label: "Friendly heads-up", tone: "friendly" },
    { day: "Due Date", label: "Polite reminder", tone: "professional" },
    { day: "Day +3", label: "Gentle follow-up", tone: "professional" },
    { day: "Day +7", label: "Firm reminder", tone: "firm" },
    { day: "Day +14", label: "Final notice", tone: "firm" },
  ];

  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.h2
            variants={fadeIn}
            className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl"
          >
            A reminder sequence that actually works
          </motion.h2>
          <motion.p variants={fadeIn} className="mt-4 text-lg text-muted-foreground">
            Starts gentle, escalates gradually. You set it once — we handle the rest.
          </motion.p>
        </motion.div>

        <motion.div
          className="mx-auto mt-14 max-w-xl space-y-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          {sequence.map((step, i) => (
            <motion.div
              key={step.day}
              variants={fadeIn}
              className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                {i + 1}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{step.label}</p>
                <p className="text-xs text-muted-foreground">{step.day}</p>
              </div>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-medium",
                  step.tone === "friendly" && "bg-accent text-accent-foreground",
                  step.tone === "professional" && "bg-secondary text-secondary-foreground",
                  step.tone === "firm" && "bg-destructive/10 text-destructive"
                )}
              >
                {step.tone}
              </span>
            </motion.div>
          ))}
        </motion.div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Reminders stop automatically when the invoice is marked as paid or disputed.
        </p>
      </div>
    </section>
  );
}

function PricingPreview() {
  return (
    <section className="border-t border-border py-20 md:py-28">
      <div className="container">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.h2
            variants={fadeIn}
            className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl"
          >
            Simple, transparent pricing
          </motion.h2>
          <motion.p variants={fadeIn} className="mt-4 text-lg text-muted-foreground">
            Start free. Upgrade when you need more invoices.
          </motion.p>
        </motion.div>

        <motion.div
          className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
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
                    <Link to="/signup">{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          All paid plans include a 7-day free trial. No credit card required for the free plan.{" "}
          <Link to="/pricing" className="text-primary hover:underline">
            Compare all features →
          </Link>
        </p>
      </div>
    </section>
  );
}

function TrustSection() {
  const items = [
    {
      icon: Shield,
      title: "First-party follow-up only",
      description: "PayNudge is for following up on invoices you issued to your own customers. This is not a debt collection service.",
    },
    {
      icon: Mail,
      title: "Professional communication",
      description: "Every reminder is polite and professional. No threatening language, no harassment — just consistent follow-up.",
    },
    {
      icon: PauseCircle,
      title: "Instant stop on payment",
      description: "Mark an invoice as paid or disputed and all future reminders are cancelled immediately.",
    },
  ];

  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Built on trust, not pressure
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Your reputation matters. {brand.name} helps you follow up professionally.
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {items.map((item) => (
            <div key={item.title} className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-sm bg-accent">
                <item.icon className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQPreview() {
  const faqs = [
    {
      q: "Does PayNudge handle payments or hold funds?",
      a: "No. PayNudge only sends reminder emails with your payment link. We never touch, process, or hold your clients' money.",
    },
    {
      q: "Is this a debt collection service?",
      a: "No. PayNudge is for businesses following up on invoices they issued to their own customers. It is not a debt collection agency.",
    },
    {
      q: "What happens when my client pays?",
      a: "Mark the invoice as paid in PayNudge. All future reminders are cancelled immediately.",
    },
    {
      q: "Can I customize the reminder emails?",
      a: "You can choose from three tones (friendly, professional, firm) and set custom cadence timing. Full template customization is coming soon.",
    },
  ];

  return (
    <section className="border-t border-border py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Frequently asked questions
          </h2>
        </div>

        <div className="mx-auto mt-12 max-w-2xl space-y-6">
          {faqs.map((faq) => (
            <div key={faq.q} className="border-b border-border pb-6">
              <h3 className="font-heading text-base font-semibold text-foreground">{faq.q}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center">
          <Link to="/faq" className="text-sm text-primary hover:underline">
            View all FAQs →
          </Link>
        </p>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Stop chasing. Start getting paid.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Set up your first invoice reminder in under 60 seconds. Free plan included.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link to="/signup">
                Get Started Free <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function SocialProofStrip() {
  const stats = [
    { value: "$2.4M+", label: "Outstanding chased" },
    { value: "31,000+", label: "Reminders delivered" },
    { value: "11 days", label: "Avg. faster payment" },
    { value: "98.4%", label: "Inbox placement rate" },
  ];
  return (
    <section className="border-b border-border bg-card/40 py-10">
      <div className="container">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-heading text-2xl font-bold text-foreground md:text-3xl">{s.value}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.15em] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DifferentiatorSection() {
  const items = [
    {
      icon: Plug,
      title: "One-click Stripe sync",
      description:
        "Paste a read-only restricted key. We pull every open and overdue invoice — with customer, due date, and pay link — in seconds. No CSVs, no double entry.",
    },
    {
      icon: Sparkles,
      title: "AI in your voice",
      description:
        "Paste two sample emails once. We learn your tone and write every reminder in your style — automatically.",
    },
    {
      icon: CalendarClock,
      title: "Predicted pay date",
      description:
        "We learn how each client pays. \"Acme typically pays 11 days late → expect Mar 28.\" Plan cash-flow with confidence.",
    },
  ];
  return (
    <section className="border-t border-border py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-eyebrow text-muted-foreground">What makes us different</span>
          <h2 className="mt-4 font-heading text-3xl font-bold text-foreground md:text-4xl">
            Three things no other reminder tool does together
          </h2>
        </div>
        <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.title}
              className="border border-border bg-card p-8 transition-colors hover:border-primary/40"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center bg-primary/10">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StripeSyncSection() {
  return (
    <section className="border-t border-border bg-card/30 py-20 md:py-28">
      <div className="container">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="text-eyebrow text-muted-foreground">Stripe sync</span>
            <h2 className="mt-4 font-heading text-3xl font-bold text-foreground md:text-5xl">
              Your Stripe invoices, <span className="lime-underline">already in</span> PayNudge.
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              Paste a read-only Stripe restricted key once. We pull every open and overdue
              invoice — with the customer name, due date, amount, and Stripe-hosted pay link —
              in seconds. Click <strong>Sync now</strong> any time to refresh.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Read-only restricted key — we can't move money",
                "Encrypted at rest with a server-side secret",
                "Open + overdue invoices imported automatically",
                "Stripe-hosted pay link in every reminder",
                "Idempotent re-sync: no duplicates, ever",
                "Disconnect any time from Settings",
              ].map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm text-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {b}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="h-11 px-6 text-xs font-bold uppercase tracking-[0.15em]">
                <Link to="/signup">
                  Connect Stripe Free <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-11 px-6 text-xs font-bold uppercase tracking-[0.15em]">
                <Link to="/templates/connect-stripe-invoices">Read the guide</Link>
              </Button>
            </div>
          </div>

          <div className="border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
                Settings · Stripe Sync
              </p>
              <Plug className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-4 rounded-md border border-primary/30 bg-primary/5 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Acme Studio LLC</span>
                <span className="font-mono text-xs text-muted-foreground">••••aT4f</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Last sync today at 9:42 AM · 14 imported
              </p>
            </div>
            <div className="mt-4 space-y-2">
              {[
                { num: "INV-1042", client: "Northwind Ltd.", amt: "$2,400", state: "Overdue", color: "text-destructive" },
                { num: "INV-1051", client: "Globex Inc.", amt: "$890", state: "Due in 3d", color: "text-foreground" },
                { num: "INV-1058", client: "Acme Co.", amt: "$1,250", state: "Due today", color: "text-foreground" },
                { num: "INV-1063", client: "Wayne Enterprises", amt: "$4,800", state: "Overdue", color: "text-destructive" },
              ].map((row) => (
                <div key={row.num} className="flex items-center justify-between border-b border-border/60 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="rounded-sm bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                      Stripe
                    </span>
                    <span className="font-mono text-xs text-foreground">{row.num}</span>
                    <span className="text-muted-foreground">{row.client}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-foreground">{row.amt}</span>
                    <span className={cn("text-xs", row.color)}>{row.state}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PayBehaviorScoreSection() {
  const clients = [
    { name: "Acme Co.", score: 92, label: "Pays early", avg: "−2 days", color: "text-primary" },
    { name: "Northwind Ltd.", score: 71, label: "Usually on time", avg: "+1 day", color: "text-foreground" },
    { name: "Globex Inc.", score: 38, label: "Chronically late", avg: "+14 days", color: "text-destructive" },
  ];
  return (
    <section className="border-t border-border py-20 md:py-28">
      <div className="container">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="text-eyebrow text-muted-foreground">Pay-Behavior Score</span>
            <h2 className="mt-4 font-heading text-3xl font-bold text-foreground md:text-5xl">
              Know who pays — and <span className="lime-underline">when</span> — before you send the invoice
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              Every invoice you log makes the model smarter. {brand.name} surfaces a score for each
              client and a predicted pay date for every open invoice — so you can plan cash-flow,
              chase the right people first, and stop wondering when the money is coming.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Per-client score updated after every payment",
                "Predicted pay date on every open invoice",
                "Weekly digest: \"You'll likely collect $X this week\"",
                "Flag chronically-late clients before you take the work",
              ].map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm text-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <div className="border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
                Client Health
              </p>
              <LineChart className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-4 space-y-4">
              {clients.map((c) => (
                <div key={c.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">{c.name}</p>
                    <span className={cn("font-heading text-sm font-bold", c.color)}>
                      {c.score}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden bg-muted">
                    <div
                      className={cn(
                        "h-full",
                        c.score >= 80 ? "bg-primary" : c.score >= 50 ? "bg-foreground/60" : "bg-destructive"
                      )}
                      style={{ width: `${c.score}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{c.label}</span>
                    <span>Avg. {c.avg}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 border-t border-border pt-4">
              <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                Next predicted payments
              </p>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground">INV-218 · Acme Co.</span>
                  <span className="text-primary">Mar 24</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground">INV-221 · Globex Inc.</span>
                  <span className="text-destructive">Apr 09</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CompetitorComparisonSection() {
  const cols = ["PayNudge", "paynudges.com", "paynudge.app", "paynudge.xyz", "paynudge.eu"];
  const rows: Array<{ feature: string; values: (boolean | string)[] }> = [
    { feature: "Honest free tier", values: [true, true, true, false, true] },
    { feature: "Stripe sync (read-only key)", values: [true, false, false, true, false] },
    { feature: "AI written in your voice", values: [true, false, false, false, "generic"] },
    { feature: "Predicted pay dates", values: [true, false, false, false, false] },
    { feature: "Open & click tracking", values: [true, false, true, true, false] },
    { feature: "Real automation", values: [true, true, true, true, false] },
  ];
  return (
    <section className="border-t border-border bg-card/30 py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-eyebrow text-muted-foreground">vs. the field</span>
          <h2 className="mt-4 font-heading text-3xl font-bold text-foreground md:text-4xl">
            Six tools share the name. Only one is built like this.
          </h2>
        </div>
        <div className="mx-auto mt-12 max-w-5xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 pr-4 text-left text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
                  Feature
                </th>
                {cols.map((c, i) => (
                  <th
                    key={c}
                    className={cn(
                      "py-3 px-3 text-center text-xs font-bold uppercase tracking-[0.15em]",
                      i === 0 ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.feature} className="border-b border-border">
                  <td className="py-3 pr-4 text-foreground">{row.feature}</td>
                  {row.values.map((val, i) => (
                    <td
                      key={i}
                      className={cn("py-3 px-3 text-center", i === 0 && "bg-primary/5")}
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
          <p className="mt-6 text-center text-sm">
            <Link to="/compare" className="text-primary hover:underline">
              See the full breakdown →
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

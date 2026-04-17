import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { brand } from "@/config/brand";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "How It Works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "Templates", href: "/templates" },
  { label: "FAQ", href: "/faq" },
];

function Wordmark({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("group flex items-baseline gap-0.5", className)}>
      <span className="font-heading text-2xl font-extrabold tracking-tightest text-foreground">
        {brand.name}
      </span>
      <span className="h-1.5 w-1.5 translate-y-[-1px] bg-primary" aria-hidden />
    </Link>
  );
}

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <div onClick={() => setMobileOpen(false)}>
          <Wordmark />
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] transition-colors",
                location.pathname === link.href
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="sm" asChild className="text-xs uppercase tracking-[0.15em]">
            <Link to="/login">Log in</Link>
          </Button>
          <Button size="sm" asChild className="text-xs font-bold uppercase tracking-[0.15em]">
            <Link to="/signup">Start Free →</Link>
          </Button>
        </div>

        <button
          className="inline-flex h-10 w-10 items-center justify-center md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 top-16 z-40 flex flex-col bg-background px-6 py-10 md:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="border-b border-border py-4 font-heading text-2xl font-bold tracking-tightest text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-8 flex flex-col gap-3">
            <Button variant="outline" size="lg" asChild className="uppercase tracking-[0.15em]">
              <Link to="/login" onClick={() => setMobileOpen(false)}>Log in</Link>
            </Button>
            <Button size="lg" asChild className="font-bold uppercase tracking-[0.15em]">
              <Link to="/signup" onClick={() => setMobileOpen(false)}>Start Free</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

const footerLinks = {
  Product: [
    { label: "How It Works", href: "/how-it-works" },
    { label: "Pricing", href: "/pricing" },
    { label: "Templates", href: "/templates" },
    { label: "FAQ", href: "/faq" },
    { label: "Help", href: "/help" },
  ],
  Resources: [
    { label: "Payment Reminder Templates", href: "/templates/polite-payment-reminder-email" },
    { label: "Invoice Follow-Up Tips", href: "/templates/invoice-follow-up-tips-for-freelancers" },
    { label: "Late Payment Policy", href: "/templates/late-payment-policy-template" },
    { label: "Overdue Invoice Schedule", href: "/templates/reminder-schedule-for-overdue-invoices" },
  ],
  Company: [
    { label: "Contact", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Wordmark />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              {brand.tagline}
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-foreground/80 transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-6 border-t border-border pt-8 md:flex-row md:items-center">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            © {new Date().getFullYear()} {brand.name}. All rights reserved.
          </p>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Get paid. Without asking twice.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function MarketingLayout() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main className="relative z-[2] flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

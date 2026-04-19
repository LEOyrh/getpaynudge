import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, FileText, Settings, CreditCard, LogOut, Menu, X, Shield, Users, BarChart3, HelpCircle, ScrollText, Mic } from "lucide-react";
import { useState } from "react";
import { brand, isLocalDev } from "@/config/brand";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const sidebarLinks = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Invoices", href: "/invoices", icon: FileText },
  { label: "AI Voice", href: "/voice", icon: Mic },
  { label: "Billing", href: "/billing", icon: CreditCard },
  { label: "Settings", href: "/settings", icon: Settings },
];

const externalLinks = [
  { label: "Help", href: `${brand.url}/help`, icon: HelpCircle },
];

const adminLinks = [
  { label: "Finance", href: "/admin/finance", icon: BarChart3 },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Invoices", href: "/admin/invoices", icon: Shield },
  { label: "Logs", href: "/admin/logs", icon: ScrollText },
];

function SidebarLink({
  link,
  active,
  onClick,
}: {
  link: { label: string; href: string; icon: React.ComponentType<{ className?: string }> };
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      to={link.href}
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-3 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] transition-colors",
        active
          ? "bg-sidebar-accent text-foreground"
          : "text-sidebar-foreground/60 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
      )}
    >
      {active && <span className="absolute left-0 top-0 h-full w-0.5 bg-primary" aria-hidden />}
      <link.icon className="h-4 w-4" />
      {link.label}
    </Link>
  );
}

function Wordmark() {
  return (
    <div className="flex items-baseline gap-0.5">
      <span className="font-heading text-xl font-extrabold tracking-tightest text-sidebar-foreground">
        {brand.name}
      </span>
      <span className="h-1 w-1 translate-y-[-1px] bg-primary" aria-hidden />
    </div>
  );
}

export default function AppLayout() {
  const { signOut, user } = useAuth();
  const { isAdmin } = useAdminRole();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    if (isLocalDev()) {
      navigate("/login");
    } else {
      window.location.href = brand.url;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-col border-r border-sidebar-border bg-sidebar-background lg:flex">
        <div className="flex h-16 items-center border-b border-sidebar-border px-5">
          <Wordmark />
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 py-3">
          {sidebarLinks.map((link) => (
            <SidebarLink key={link.href} link={link} active={location.pathname.startsWith(link.href)} />
          ))}
          {externalLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center gap-3 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
              <span className="ml-auto text-sidebar-foreground/30">↗</span>
            </a>
          ))}
          {isAdmin && (
            <>
              <Separator className="my-3" />
              <p className="mb-1 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-sidebar-foreground/40">
                Admin
              </p>
              {adminLinks.map((link) => (
                <SidebarLink key={link.href} link={link} active={location.pathname.startsWith(link.href)} />
              ))}
            </>
          )}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <p className="mb-3 truncate text-xs text-sidebar-foreground/50">{user?.email}</p>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-2 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-sidebar-foreground/60 transition-colors hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* Mobile header + content */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4 lg:hidden">
          <Wordmark />
          <button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        {mobileOpen && (
          <div className="border-b border-border bg-background py-2 lg:hidden">
            <nav className="flex flex-col">
              {sidebarLinks.map((link) => (
                <SidebarLink
                  key={link.href}
                  link={link}
                  active={location.pathname.startsWith(link.href)}
                  onClick={() => setMobileOpen(false)}
                />
              ))}
              {externalLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-sidebar-foreground/60 hover:text-sidebar-foreground"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                  <span className="ml-auto text-sidebar-foreground/30">↗</span>
                </a>
              ))}
              {isAdmin && (
                <>
                  <Separator className="my-2" />
                  <p className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    Admin
                  </p>
                  {adminLinks.map((link) => (
                    <SidebarLink
                      key={link.href}
                      link={link}
                      active={location.pathname.startsWith(link.href)}
                      onClick={() => setMobileOpen(false)}
                    />
                  ))}
                </>
              )}
              <button
                onClick={handleSignOut}
                className="mt-2 flex items-center gap-3 border-t border-border px-4 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </nav>
          </div>
        )}

        <main className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

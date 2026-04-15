import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, FileText, Settings, CreditCard, LogOut, Menu, X, Shield, Users, BarChart3, HelpCircle, ScrollText } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { brand } from "@/config/brand";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const sidebarLinks = [
  { label: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
  { label: "Invoices", href: "/app/invoices", icon: FileText },
  { label: "Billing", href: "/app/billing", icon: CreditCard },
  { label: "Settings", href: "/app/settings", icon: Settings },
  { label: "Help", href: "/help", icon: HelpCircle, external: true },
];

const adminLinks = [
  { label: "Finance", href: "/app/admin/finance", icon: BarChart3 },
  { label: "Users", href: "/app/admin/users", icon: Users },
  { label: "Invoices", href: "/app/admin/invoices", icon: Shield },
  { label: "Logs", href: "/app/admin/logs", icon: ScrollText },
];

export default function AppLayout() {
  const { signOut, user } = useAuth();
  const { isAdmin } = useAdminRole();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 flex-col border-r border-sidebar-border bg-sidebar-background lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <span className="text-sm font-bold text-sidebar-primary-foreground">P</span>
          </div>
          <span className="font-heading text-lg font-bold text-sidebar-foreground">{brand.name}</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                location.pathname.startsWith(link.href)
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <>
              <Separator className="my-2" />
              <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40">Admin</p>
              {adminLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    location.pathname.startsWith(link.href)
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
            </>
          )}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <p className="mb-2 truncate px-3 text-xs text-sidebar-foreground/50">{user?.email}</p>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* Mobile header + content */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <span className="text-xs font-bold text-primary-foreground">P</span>
            </div>
            <span className="font-heading font-bold text-foreground">{brand.name}</span>
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        {mobileOpen && (
          <div className="border-b border-border bg-background p-3 lg:hidden">
            <nav className="flex flex-col gap-1">
              {sidebarLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                    location.pathname.startsWith(link.href)
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <>
                  <Separator className="my-2" />
                  <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">Admin</p>
                  {adminLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                        location.pathname.startsWith(link.href)
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  ))}
                </>
              )}
              <button
                onClick={handleSignOut}
                className="mt-2 flex items-center gap-3 rounded-md border-t border-border px-3 py-2 pt-3 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </nav>
          </div>
        )}

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

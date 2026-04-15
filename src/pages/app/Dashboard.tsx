import { FileText, Clock, DollarSign, Bell, ArrowUpRight, Mail, MousePointerClick, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useInvoiceLimits } from "@/hooks/useInvoiceLimits";
import type { Tables } from "@/integrations/supabase/types";

type Invoice = Tables<"invoices">;

export default function Dashboard() {
  usePageMeta({ title: "Dashboard" });
  const { user, subscription } = useAuth();
  const { planKey, activeCount, limit, isUnlimited, atLimit } = useInvoiceLimits();

  const { data: invoices = [] } = useQuery({
    queryKey: ["dashboard-invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Invoice[];
    },
    enabled: !!user,
  });

  const { data: recentActivities = [] } = useQuery({
    queryKey: ["dashboard-activities"],
    queryFn: async () => {
      // Fetch latest activities across ALL user invoices
      const { data: userInvoices } = await supabase
        .from("invoices")
        .select("id");
      if (!userInvoices?.length) return [];
      const invoiceIds = userInvoices.map((i) => i.id);
      const { data, error } = await supabase
        .from("invoice_activities")
        .select("*, invoices!inner(invoice_number)")
        .in("invoice_id", invoiceIds)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: emailEvents = [] } = useQuery({
    queryKey: ["dashboard-email-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_events")
        .select("event_type, invoice_id");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Build a set of invoice IDs that have been opened
  const openedInvoiceIds = new Set(
    emailEvents.filter((e) => e.event_type === "open").map((e) => e.invoice_id)
  );
  const clickedInvoiceIds = new Set(
    emailEvents.filter((e) => e.event_type === "click").map((e) => e.invoice_id)
  );

  const activeInvoiceCount = invoices.filter((i) => i.status === "sent" || i.status === "overdue").length;
  const overdueCount = invoices.filter((i) => i.status === "overdue").length;

  const now = new Date();
  const monthStart = startOfMonth(now).toISOString();
  const monthEnd = endOfMonth(now).toISOString();
  const paidThisMonth = invoices
    .filter((i) => i.status === "paid" && i.updated_at >= monthStart && i.updated_at <= monthEnd)
    .reduce((sum, i) => sum + Number(i.amount), 0);

  const remindersSent = recentActivities.filter((a) => a.activity_type === "reminder_sent").length;

  const openCount = emailEvents.filter((e) => e.event_type === "open").length;
  const clickCount = emailEvents.filter((e) => e.event_type === "click").length;

  const stats = [
    { label: "Active Invoices", value: String(activeInvoiceCount), icon: FileText, color: "text-primary" },
    { label: "Overdue", value: String(overdueCount), icon: Clock, color: "text-destructive" },
    { label: "Paid This Month", value: `$${paidThisMonth.toLocaleString()}`, icon: DollarSign, color: "text-primary" },
    { label: "Reminders Sent", value: String(remindersSent), icon: Bell, color: "text-primary" },
    { label: "Email Opens", value: String(openCount), icon: Mail, color: "text-primary" },
    { label: "Link Clicks", value: String(clickCount), icon: MousePointerClick, color: "text-primary" },
  ];

  const recentInvoices = invoices.slice(0, 5);

  const statusColors: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    sent: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    overdue: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    cancelled: "bg-muted text-muted-foreground",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-foreground">Dashboard</h1>
        <Button asChild>
          <Link to="/app/invoices/new">New Invoice</Link>
        </Button>
      </div>

      {/* Upgrade banner for free users */}
      {planKey === "free" && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <p className="font-heading font-semibold text-foreground">
                You're on the Free plan ({activeCount}/{limit} invoice{limit !== 1 ? "s" : ""} used)
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Upgrade to unlock more invoices, custom reminder cadence, and activity tracking.
              </p>
            </div>
            <Button size="sm" asChild>
              <Link to="/app/billing">
                Upgrade <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* At-limit warning for paid plans */}
      {atLimit && planKey !== "free" && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center justify-between py-4">
            <p className="text-sm font-medium text-foreground">
              You've reached your {limit}-invoice limit. Upgrade to add more.
            </p>
            <Button size="sm" variant="outline" asChild>
              <Link to="/app/billing">Upgrade</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {invoices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 font-heading text-lg font-semibold">No invoices yet</h3>
            <p className="mb-4 max-w-sm text-sm text-muted-foreground">
              Add your first invoice and we'll start sending payment reminders automatically.
            </p>
            <Button asChild>
              <Link to="/app/invoices/new">Add Your First Invoice</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Invoices */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Invoices</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/app/invoices">View all</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentInvoices.map((inv) => (
                <Link
                  key={inv.id}
                  to={`/app/invoices/${inv.id}`}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div>
                    <p className="text-sm font-medium">{inv.client_name}</p>
                    <p className="text-xs text-muted-foreground">{inv.invoice_number}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">
                      {new Intl.NumberFormat("en-US", { style: "currency", currency: inv.currency }).format(inv.amount)}
                    </span>
                    <Badge variant="secondary" className={`text-xs ${statusColors[inv.status]}`}>
                      {inv.status}
                    </Badge>
                    {openedInvoiceIds.has(inv.id) && (
                      <Badge className="bg-violet-100 text-violet-800 hover:bg-violet-100 text-xs">
                        <Mail className="mr-0.5 h-3 w-3" />opened
                      </Badge>
                    )}
                    {clickedInvoiceIds.has(inv.id) && (
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs">
                        <MousePointerClick className="mr-0.5 h-3 w-3" />clicked
                      </Badge>
                    )}
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivities.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentActivities.map((act: any) => (
                    <div key={act.id} className="flex gap-3">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                        {act.activity_type === "reminder_sent" ? (
                          <Bell className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm">{act.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {act.invoices?.invoice_number} · {format(new Date(act.created_at), "MMM d, h:mm a")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, Clock, Mail, CheckCircle, XCircle, Send, Bell, Eye, MousePointerClick } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { Tables } from "@/integrations/supabase/types";
import type { Database } from "@/integrations/supabase/types";

type Invoice = Tables<"invoices">;
type InvoiceStatus = Database["public"]["Enums"]["invoice_status"];
type Activity = Tables<"invoice_activities">;
type Reminder = Tables<"invoice_reminders">;

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  overdue: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  cancelled: "bg-muted text-muted-foreground",
};

const activityIcons: Record<string, typeof Clock> = {
  status_change: Clock,
  reminder_sent: Mail,
  created: Send,
};

const DEFAULT_REMINDERS = [
  { reminder_type: "before_due", days_offset: 3, label: "3 days before due" },
  { reminder_type: "on_due", days_offset: 0, label: "On due date" },
  { reminder_type: "after_due", days_offset: 7, label: "7 days after due" },
];

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export default function InvoiceDetail() {
  usePageMeta({ title: "Invoice Details" });
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [sendingReminder, setSendingReminder] = useState(false);

  const { data: invoice, isLoading } = useQuery({
    queryKey: ["invoice", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("invoices").select("*").eq("id", id!).single();
      if (error) throw error;
      return data as Invoice;
    },
    enabled: !!id && !!user,
  });

  const { data: activities = [] } = useQuery({
    queryKey: ["invoice-activities", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoice_activities")
        .select("*")
        .eq("invoice_id", id!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Activity[];
    },
    enabled: !!id && !!user,
  });

  const { data: reminders = [] } = useQuery({
    queryKey: ["invoice-reminders", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoice_reminders")
        .select("*")
        .eq("invoice_id", id!);
      if (error) throw error;
      return data as Reminder[];
    },
    enabled: !!id && !!user,
  });

  const { data: emailEvents = [] } = useQuery({
    queryKey: ["invoice-email-events", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_events")
        .select("*")
        .eq("invoice_id", id!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user,
  });

  // Group email events by message_id (extracted from tracking_id: {invoice_id}_{message_id})
  const emailTrackingByMessage = useMemo(() => {
    const map = new Map<string, { opens: number; clicks: number; firstSeen: string }>();
    for (const ev of emailEvents) {
      const messageId = ev.tracking_id.length > 37 ? ev.tracking_id.slice(37) : ev.tracking_id;
      if (!map.has(messageId)) {
        map.set(messageId, { opens: 0, clicks: 0, firstSeen: ev.created_at });
      }
      const entry = map.get(messageId)!;
      if (ev.event_type === "open") entry.opens++;
      if (ev.event_type === "click") entry.clicks++;
    }
    return map;
  }, [emailEvents]);

  // Build a combined activity list: invoice_activities + email open/click events
  const combinedActivities = useMemo(() => {
    const items: { id: string; type: string; description: string; created_at: string }[] = [];
    for (const act of activities) {
      items.push({ id: act.id, type: act.activity_type, description: act.description, created_at: act.created_at });
    }
    for (const ev of emailEvents) {
      const label = ev.event_type === "open" ? "Email opened" : "Payment link clicked";
      items.push({ id: ev.id, type: `email_${ev.event_type}`, description: label, created_at: ev.created_at });
    }
    items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return items;
  }, [activities, emailEvents]);

  // Total tracking stats for this invoice
  const totalOpens = emailEvents.filter((e) => e.event_type === "open").length;
  const totalClicks = emailEvents.filter((e) => e.event_type === "click").length;
  const totalSent = activities.filter((a) => a.activity_type === "reminder_sent").length;

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("business_name, full_name")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const statusMutation = useMutation({
    mutationFn: async (newStatus: InvoiceStatus) => {
      const { error } = await supabase.from("invoices").update({ status: newStatus }).eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice", id] });
      queryClient.invalidateQueries({ queryKey: ["invoice-activities", id] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Status updated");
    },
    onError: () => toast.error("Failed to update status"),
  });

  const toggleReminder = useMutation({
    mutationFn: async ({ type, days, enabled }: { type: string; days: number; enabled: boolean }) => {
      const existing = reminders.find((r) => r.reminder_type === type && r.days_offset === days);
      if (existing) {
        const { error } = await supabase.from("invoice_reminders").update({ enabled }).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("invoice_reminders").insert({
          invoice_id: id!,
          reminder_type: type,
          days_offset: days,
          enabled,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice-reminders", id] });
    },
  });

  const handleSendReminder = async () => {
    if (!invoice?.client_email) {
      toast.error("No client email on file");
      return;
    }
    setSendingReminder(true);
    try {
      const businessName = profile?.business_name || profile?.full_name || "Your service provider";
      const amount = formatCurrency(invoice.amount, invoice.currency);
      const formattedDue = format(new Date(invoice.due_date), "MMMM d, yyyy");

      const isOverdue = new Date(invoice.due_date) < new Date();
      const tone = isOverdue ? "professional" : "friendly";

      const { error } = await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "payment-reminder",
          recipientEmail: invoice.client_email,
          idempotencyKey: `manual-reminder-${invoice.id}-${Date.now()}`,
          templateData: {
            invoiceId: invoice.id,
            clientName: invoice.client_name,
            invoiceNumber: invoice.invoice_number,
            amount,
            dueDate: formattedDue,
            businessName,
            tone,
            payLink: (invoice as any).payment_link || undefined,
          },
        },
      });

      if (error) throw error;

      // Log activity
      await supabase.from("invoice_activities").insert({
        invoice_id: invoice.id,
        activity_type: "reminder_sent",
        description: `Manual payment reminder sent to ${invoice.client_email}`,
      });

      queryClient.invalidateQueries({ queryKey: ["invoice-activities", id] });
      toast.success("Reminder sent!");
    } catch (err) {
      toast.error("Failed to send reminder");
    } finally {
      setSendingReminder(false);
    }
  };

  if (isLoading) {
    return <div className="py-16 text-center text-muted-foreground">Loading…</div>;
  }

  if (!invoice) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">Invoice not found.</p>
        <Button asChild className="mt-4"><Link to="/app/invoices">Back to Invoices</Link></Button>
      </div>
    );
  }

  const statusActions: { label: string; status: InvoiceStatus; icon: typeof CheckCircle }[] = [];
  if (invoice.status === "draft") statusActions.push({ label: "Mark Sent", status: "sent", icon: Send });
  if (invoice.status === "sent" || invoice.status === "overdue") {
    statusActions.push({ label: "Mark Paid", status: "paid", icon: CheckCircle });
  }
  if (invoice.status !== "cancelled" && invoice.status !== "paid") {
    statusActions.push({ label: "Cancel", status: "cancelled", icon: XCircle });
  }

  const canSendReminder = invoice.client_email && (invoice.status === "sent" || invoice.status === "overdue");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/app/invoices"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="font-heading text-2xl font-bold text-foreground">{invoice.invoice_number}</h1>
          <p className="text-sm text-muted-foreground">{invoice.client_name}</p>
        </div>
        <Badge variant="secondary" className={statusColors[invoice.status]}>
          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
        </Badge>
      </div>

      {/* Details */}
      <Card>
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
          <div><p className="text-sm text-muted-foreground">Amount</p><p className="text-lg font-semibold">{formatCurrency(invoice.amount, invoice.currency)}</p></div>
          <div><p className="text-sm text-muted-foreground">Due Date</p><p className="text-lg font-semibold">{format(new Date(invoice.due_date), "MMM d, yyyy")}</p></div>
          {invoice.client_email && <div><p className="text-sm text-muted-foreground">Client Email</p><p>{invoice.client_email}</p></div>}
          <div><p className="text-sm text-muted-foreground">Issue Date</p><p>{format(new Date(invoice.issue_date), "MMM d, yyyy")}</p></div>
          {(invoice as any).payment_link && <div className="sm:col-span-2"><p className="text-sm text-muted-foreground">Payment Link</p><a href={(invoice as any).payment_link} target="_blank" rel="noopener noreferrer" className="text-primary underline break-all">{(invoice as any).payment_link}</a></div>}
          {invoice.notes && <div className="sm:col-span-2"><p className="text-sm text-muted-foreground">Notes</p><p>{invoice.notes}</p></div>}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {statusActions.map((action) => (
          <Button
            key={action.status}
            variant={action.status === "cancelled" ? "outline" : "default"}
            size="sm"
            onClick={() => statusMutation.mutate(action.status)}
            disabled={statusMutation.isPending}
          >
            <action.icon className="mr-1.5 h-4 w-4" />
            {action.label}
          </Button>
        ))}
        {canSendReminder && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSendReminder}
            disabled={sendingReminder}
          >
            <Bell className="mr-1.5 h-4 w-4" />
            {sendingReminder ? "Sending…" : "Send Reminder Now"}
          </Button>
        )}
      </div>

      {/* Reminder Cadence */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Reminder Schedule</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {DEFAULT_REMINDERS.map((def) => {
            const existing = reminders.find(
              (r) => r.reminder_type === def.reminder_type && r.days_offset === def.days_offset
            );
            const isEnabled = existing?.enabled ?? false;
            return (
              <div key={def.reminder_type + def.days_offset} className="flex items-center justify-between">
                <Label>{def.label}</Label>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={(checked) =>
                    toggleReminder.mutate({ type: def.reminder_type, days: def.days_offset, enabled: checked })
                  }
                />
              </div>
            );
          })}
          <p className="text-xs text-muted-foreground">Reminders will be sent to the client email on file.</p>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Activity</CardTitle></CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <div className="space-y-4">
              {activities.map((act) => {
                const Icon = activityIcons[act.activity_type] || Clock;
                return (
                  <div key={act.id} className="flex gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm">{act.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(act.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

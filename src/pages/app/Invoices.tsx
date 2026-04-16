import { useState, useMemo } from "react";
import { FileText, Search, Filter, Eye, MousePointerClick } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePlanFeatures } from "@/hooks/usePlanFeatures";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Tables } from "@/integrations/supabase/types";

type Invoice = Tables<"invoices">;

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  overdue: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  cancelled: "bg-muted text-muted-foreground line-through",
};

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export default function Invoices() {
  usePageMeta({ title: "Invoices" });
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { emailTracking } = usePlanFeatures();

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices", user?.id],
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

  const { data: emailEvents = [] } = useQuery({
    queryKey: ["invoices-email-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_events")
        .select("event_type, invoice_id");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Build per-invoice open/click counts
  const trackingByInvoice = useMemo(() => {
    const map = new Map<string, { opens: number; clicks: number }>();
    for (const ev of emailEvents) {
      if (!map.has(ev.invoice_id)) map.set(ev.invoice_id, { opens: 0, clicks: 0 });
      const entry = map.get(ev.invoice_id)!;
      if (ev.event_type === "open") entry.opens++;
      if (ev.event_type === "click") entry.clicks++;
    }
    return map;
  }, [emailEvents]);

  const filtered = invoices.filter((inv) => {
    const matchesSearch =
      !search ||
      inv.client_name.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoice_number.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-foreground">Invoices</h1>
        <Button asChild>
          <Link to="/app/invoices/new">New Invoice</Link>
        </Button>
      </div>

      {invoices.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by client or invoice #"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {isLoading ? (
        <Card><CardContent className="py-16 text-center text-muted-foreground">Loading…</CardContent></Card>
      ) : filtered.length === 0 && invoices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 font-heading text-lg font-semibold">No invoices yet</h3>
            <p className="mb-4 max-w-sm text-sm text-muted-foreground">
              Track your invoices and automate payment reminders. Add one to get started.
            </p>
            <Button asChild>
              <Link to="/app/invoices/new">Add Your First Invoice</Link>
            </Button>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-16 text-center text-muted-foreground">No invoices match your filters.</CardContent></Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((inv) => {
                const tracking = trackingByInvoice.get(inv.id);
                return (
                  <TableRow key={inv.id} className="cursor-pointer" onClick={() => navigate(`/invoices/${inv.id}`)}>
                    <TableCell className="font-medium">{inv.invoice_number}</TableCell>
                    <TableCell>{inv.client_name}</TableCell>
                    <TableCell>{formatCurrency(inv.amount, inv.currency)}</TableCell>
                    <TableCell>{format(new Date(inv.due_date), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-1">
                        <Badge variant="secondary" className={statusColors[inv.status]}>
                          {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                        </Badge>
                        {emailTracking && tracking && tracking.opens > 0 && (
                          <Badge className="bg-violet-100 text-violet-800 hover:bg-violet-100 text-xs">
                            <Eye className="mr-0.5 h-3 w-3" />{tracking.opens}
                          </Badge>
                        )}
                        {emailTracking && tracking && tracking.clicks > 0 && (
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs">
                            <MousePointerClick className="mr-0.5 h-3 w-3" />{tracking.clicks}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

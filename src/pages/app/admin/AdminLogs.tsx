import { useState, useMemo } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { Search, Mail, MousePointerClick, Eye, Activity, AlertCircle, CheckCircle2, Clock, Archive, ArchiveRestore } from "lucide-react";

interface SendLog {
  id: string;
  message_id: string | null;
  template_name: string;
  recipient_email: string;
  status: string;
  error_message: string | null;
  metadata: any;
  created_at: string;
  is_admin?: boolean;
}

interface EmailEvent {
  id: string;
  invoice_id: string;
  tracking_id: string;
  event_type: string;
  metadata: any;
  created_at: string;
}

interface InvoiceActivity {
  id: string;
  invoice_id: string;
  activity_type: string;
  description: string;
  created_at: string;
  archived_at?: string | null;
  is_admin?: boolean;
}

const statusBadge = (status: string) => {
  switch (status) {
    case "sent":
      return <Badge className="bg-primary/15 text-primary hover:bg-primary/15 border border-primary/30"><CheckCircle2 className="mr-1 h-3 w-3" />Sent</Badge>;
    case "pending":
      return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
    case "dlq":
    case "failed":
      return <Badge variant="destructive"><AlertCircle className="mr-1 h-3 w-3" />Failed</Badge>;
    case "suppressed":
      return <Badge className="bg-destructive/15 text-destructive hover:bg-destructive/15 border border-destructive/30">Suppressed</Badge>;
    case "bounced":
      return <Badge variant="destructive">Bounced</Badge>;
    case "complained":
      return <Badge className="bg-destructive/15 text-destructive hover:bg-destructive/15 border border-destructive/30">Complained</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function AdminLogs() {
  usePageMeta({ title: "Admin — Logs" });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [templateFilter, setTemplateFilter] = useState("all");
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const [actorFilter, setActorFilter] = useState("all"); // "all" | "admin" | "user"
  const [archivedFilter, setArchivedFilter] = useState<"active" | "archived" | "all">("active");
  const queryClient = useQueryClient();

  const archiveMutation = useMutation({
    mutationFn: async ({ id, archive }: { id: string; archive: boolean }) => {
      const { error } = await supabase.functions.invoke("admin-stats", {
        body: { action: archive ? "archive-activity" : "restore-activity", activityId: id },
      });
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      toast({ title: vars.archive ? "Activity archived" : "Activity restored" });
      queryClient.invalidateQueries({ queryKey: ["admin-logs"] });
    },
    onError: (err: any) => {
      toast({ title: "Action failed", description: err?.message || "Try again.", variant: "destructive" });
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-logs"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("admin-stats", {
        body: { action: "logs" },
      });
      if (error) throw error;
      return data as {
        sendLogs: SendLog[];
        emailEvents: EmailEvent[];
        activities: InvoiceActivity[];
      };
    },
  });

  const sendLogs = data?.sendLogs || [];
  const emailEvents = data?.emailEvents || [];
  const activities = data?.activities || [];

  // Build a map of message_id → set of event types (open, click)
  const eventsByMessageId = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const ev of emailEvents) {
      // tracking_id format: {invoice_uuid}_{message_uuid} — UUID is 36 chars
      const messageId = ev.tracking_id.length > 37 ? ev.tracking_id.slice(37) : ev.tracking_id;
      if (!map.has(messageId)) map.set(messageId, new Set());
      map.get(messageId)!.add(ev.event_type);
    }
    return map;
  }, [emailEvents]);

  // Deduplicate send logs by message_id (latest status wins)
  const dedupedLogs = useMemo(() => {
    const map = new Map<string, SendLog>();
    for (const log of sendLogs) {
      const key = log.message_id || log.id;
      const existing = map.get(key);
      if (!existing || new Date(log.created_at) > new Date(existing.created_at)) {
        map.set(key, log);
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [sendLogs]);

  // Stats
  const totalSent = dedupedLogs.filter((l) => l.status === "sent").length;
  const totalFailed = dedupedLogs.filter((l) => ["dlq", "failed"].includes(l.status)).length;
  const totalSuppressed = dedupedLogs.filter((l) => l.status === "suppressed").length;
  const totalOpens = emailEvents.filter((e) => e.event_type === "open").length;
  const totalClicks = emailEvents.filter((e) => e.event_type === "click").length;

  // Template names for filter
  const templateNames = useMemo(() => {
    const names = new Set(dedupedLogs.map((l) => l.template_name));
    return Array.from(names).sort();
  }, [dedupedLogs]);

  // Filtered send logs
  const filteredLogs = useMemo(() => {
    return dedupedLogs.filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (templateFilter !== "all" && l.template_name !== templateFilter) return false;
      if (actorFilter === "admin" && !l.is_admin) return false;
      if (actorFilter === "user" && l.is_admin) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          l.recipient_email.toLowerCase().includes(q) ||
          l.template_name.toLowerCase().includes(q) ||
          l.message_id?.toLowerCase().includes(q) ||
          l.error_message?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [dedupedLogs, statusFilter, templateFilter, actorFilter, search]);

  // Filtered email events
  const filteredEvents = useMemo(() => {
    return emailEvents.filter((e) => {
      if (eventTypeFilter !== "all" && e.event_type !== eventTypeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          e.tracking_id.toLowerCase().includes(q) ||
          e.invoice_id.toLowerCase().includes(q) ||
          e.event_type.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [emailEvents, eventTypeFilter, search]);

  // Filtered activities
  const filteredActivities = useMemo(() => {
    return activities.filter((a) => {
      if (actorFilter === "admin" && !a.is_admin) return false;
      if (actorFilter === "user" && a.is_admin) return false;
      if (archivedFilter === "active" && a.archived_at) return false;
      if (archivedFilter === "archived" && !a.archived_at) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        a.description.toLowerCase().includes(q) ||
        a.activity_type.toLowerCase().includes(q) ||
        a.invoice_id.toLowerCase().includes(q)
      );
    });
  }, [activities, actorFilter, archivedFilter, search]);

  if (isLoading) {
    return <div className="py-16 text-center text-muted-foreground">Loading logs…</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">System Logs</h1>

      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Emails Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{totalSent}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Failed</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-destructive">{totalFailed}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Suppressed</CardTitle>
            <Mail className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{totalSuppressed}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Opens Tracked</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{totalOpens}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Clicks Tracked</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{totalClicks}</p></CardContent>
        </Card>
      </div>

      {/* Search + Actor filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search logs…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={actorFilter} onValueChange={setActorFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Actor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actors</SelectItem>
            <SelectItem value="admin">Admin only</SelectItem>
            <SelectItem value="user">Users only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="emails" className="space-y-4">
        <TabsList>
          <TabsTrigger value="emails" className="gap-1.5"><Mail className="h-3.5 w-3.5" />Email Sends ({filteredLogs.length})</TabsTrigger>
          <TabsTrigger value="tracking" className="gap-1.5"><Eye className="h-3.5 w-3.5" />Tracking Events ({filteredEvents.length})</TabsTrigger>
          <TabsTrigger value="activities" className="gap-1.5"><Activity className="h-3.5 w-3.5" />Invoice Activities ({filteredActivities.length})</TabsTrigger>
        </TabsList>

        {/* Email Send Logs */}
        <TabsContent value="emails" className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="dlq">DLQ</SelectItem>
                <SelectItem value="suppressed">Suppressed</SelectItem>
                <SelectItem value="bounced">Bounced</SelectItem>
              </SelectContent>
            </Select>
            <Select value={templateFilter} onValueChange={setTemplateFilter}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All templates</SelectItem>
                {templateNames.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.slice(0, 100).map((log) => {
                  const messageKey = log.message_id || log.id;
                  const events = eventsByMessageId.get(messageKey);
                  const hasOpen = events?.has("open");
                  const hasClick = events?.has("click");
                  return (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {format(new Date(log.created_at), "MMM d, HH:mm:ss")}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{log.template_name}</TableCell>
                    <TableCell className="text-sm">{log.recipient_email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {statusBadge(log.status)}
                        {hasOpen && (
                          <Badge className="bg-foreground/10 text-foreground hover:bg-foreground/10 border border-foreground/20">
                            <Eye className="mr-1 h-3 w-3" />Opened
                          </Badge>
                        )}
                        {hasClick && (
                          <Badge className="bg-foreground/10 text-foreground hover:bg-foreground/10 border border-foreground/20">
                            <MousePointerClick className="mr-1 h-3 w-3" />Clicked
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-xs text-destructive">
                      {log.error_message || "—"}
                    </TableCell>
                  </TableRow>
                  );
                })}
                {filteredLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">No email logs found.</TableCell>
                  </TableRow>
                )}
                {filteredLogs.length > 100 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-xs text-muted-foreground">
                      Showing first 100 of {filteredLogs.length} results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Tracking Events */}
        <TabsContent value="tracking" className="space-y-4">
          <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Event type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All events</SelectItem>
              <SelectItem value="open">Opens</SelectItem>
              <SelectItem value="click">Clicks</SelectItem>
            </SelectContent>
          </Select>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Tracking ID</TableHead>
                  <TableHead>User Agent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.slice(0, 100).map((ev) => (
                  <TableRow key={ev.id}>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {format(new Date(ev.created_at), "MMM d, HH:mm:ss")}
                    </TableCell>
                    <TableCell>
                      {ev.event_type === "open" ? (
                        <Badge variant="secondary"><Eye className="mr-1 h-3 w-3" />Open</Badge>
                      ) : (
                        <Badge className="bg-foreground/10 text-foreground hover:bg-foreground/10 border border-foreground/20"><MousePointerClick className="mr-1 h-3 w-3" />Click</Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{ev.invoice_id.slice(0, 8)}…</TableCell>
                    <TableCell className="font-mono text-xs">{ev.tracking_id.slice(0, 16)}…</TableCell>
                    <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                      {(ev.metadata as any)?.user_agent?.slice(0, 60) || "—"}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredEvents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">No tracking events found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Invoice Activities */}
        <TabsContent value="activities">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivities.slice(0, 100).map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {format(new Date(a.created_at), "MMM d, HH:mm:ss")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{a.activity_type}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{a.invoice_id.slice(0, 8)}…</TableCell>
                    <TableCell className="text-sm">{a.description}</TableCell>
                  </TableRow>
                ))}
                {filteredActivities.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">No activities found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

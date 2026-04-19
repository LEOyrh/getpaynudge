import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle2, RefreshCw, Trash2, ExternalLink, AlertCircle } from "lucide-react";

export function StripeConnectionCard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [apiKey, setApiKey] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const { data: connection, isLoading } = useQuery({
    queryKey: ["stripe-connection", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stripe_connections_safe")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleConnect = async () => {
    if (!apiKey.trim()) {
      toast.error("Please paste your Stripe restricted key");
      return;
    }
    setConnecting(true);
    const { data, error } = await supabase.functions.invoke("connect-stripe", {
      body: { apiKey: apiKey.trim() },
    });
    setConnecting(false);
    if (error || (data as any)?.error) {
      toast.error((data as any)?.error ?? error?.message ?? "Failed to connect");
      return;
    }
    setApiKey("");
    toast.success("Stripe connected");
    queryClient.invalidateQueries({ queryKey: ["stripe-connection", user?.id] });
  };

  const handleSync = async () => {
    setSyncing(true);
    const { data, error } = await supabase.functions.invoke("sync-stripe-invoices");
    setSyncing(false);
    if (error || (data as any)?.error) {
      toast.error((data as any)?.error ?? error?.message ?? "Sync failed");
      queryClient.invalidateQueries({ queryKey: ["stripe-connection", user?.id] });
      return;
    }
    const d: any = data;
    let msg = `Synced ${d.totalSynced} invoice${d.totalSynced === 1 ? "" : "s"}`;
    if (d.imported) msg += ` (${d.imported} new)`;
    if (d.skippedDueToLimit) msg += ` — ${d.skippedDueToLimit} skipped (plan limit)`;
    toast.success(msg);
    queryClient.invalidateQueries({ queryKey: ["stripe-connection", user?.id] });
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
  };

  const handleDisconnect = async () => {
    if (!confirm("Disconnect Stripe? Your imported invoices will remain.")) return;
    setDisconnecting(true);
    const { error } = await supabase.functions.invoke("disconnect-stripe");
    setDisconnecting(false);
    if (error) {
      toast.error("Failed to disconnect");
      return;
    }
    toast.success("Stripe disconnected");
    queryClient.invalidateQueries({ queryKey: ["stripe-connection", user?.id] });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Stripe Sync</CardTitle>
            <CardDescription className="mt-1">
              Pull your open and overdue invoices from Stripe so PayNudge can chase them.
            </CardDescription>
          </div>
          {connection && (
            <Badge variant="secondary" className="gap-1.5">
              <CheckCircle2 className="h-3 w-3" />
              Connected
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : connection ? (
          <>
            <div className="rounded-md border border-border bg-muted/30 p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">
                  {connection.stripe_account_name ?? connection.stripe_account_email ?? connection.stripe_account_id}
                </span>
                <span className="font-mono text-xs text-muted-foreground">••••{connection.api_key_last4}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {connection.last_sync_at
                  ? `Last sync ${new Date(connection.last_sync_at).toLocaleString()} • ${connection.invoices_synced_count ?? 0} imported`
                  : "Never synced yet."}
              </p>
              {connection.last_sync_status === "error" && connection.last_sync_error && (
                <p className="mt-2 flex items-start gap-1.5 text-xs text-destructive">
                  <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                  {connection.last_sync_error}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleSync} disabled={syncing}>
                <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
                {syncing ? "Syncing…" : "Sync now"}
              </Button>
              <Button variant="outline" onClick={handleDisconnect} disabled={disconnecting}>
                <Trash2 className="mr-2 h-4 w-4" />
                {disconnecting ? "Disconnecting…" : "Disconnect"}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-md border border-border bg-muted/30 p-4 text-sm">
              <p className="font-medium text-foreground">Use a restricted Stripe key (read-only)</p>
              <ol className="mt-2 list-inside list-decimal space-y-1 text-xs text-muted-foreground">
                <li>Open Stripe Dashboard → Developers → API keys → Restricted keys.</li>
                <li>Click <strong>Create restricted key</strong>.</li>
                <li>Set <strong>Invoices: Read</strong> and <strong>Customers: Read</strong>. Leave everything else as None.</li>
                <li>Copy the key (starts with <code className="font-mono">rk_live_</code> or <code className="font-mono">rk_test_</code>) and paste below.</li>
              </ol>
              <a
                href="https://dashboard.stripe.com/apikeys/create?name=PayNudge%20Sync&permissions%5Binvoice%5D=read&permissions%5Bcustomer%5D=read"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                Open Stripe key creator <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Restricted API key</label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="rk_live_..."
                autoComplete="off"
              />
              <Button onClick={handleConnect} disabled={connecting || !apiKey.trim()}>
                {connecting ? "Validating…" : "Connect Stripe"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

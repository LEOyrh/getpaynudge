import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { stripePlans } from "@/config/stripe";
import { DollarSign, Users, FileText, TrendingUp } from "lucide-react";

const productToName: Record<string, string> = {
  // Legacy products
  "prod_UIMg3mg0NPPxGO": "Starter (Legacy)",
};
for (const [key, val] of Object.entries(stripePlans)) {
  productToName[val.productId] = key.charAt(0).toUpperCase() + key.slice(1);
}

export default function AdminFinance() {
  usePageMeta({ title: "Admin — Finance" });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("admin-stats", {
        body: { action: "stats" },
      });
      if (error) throw error;
      return data as {
        totalUsers: number;
        totalInvoices: number;
        tierCounts: Record<string, number>;
        mrr: number;
        projectedAnnual: number;
      };
    },
  });

  if (isLoading) return <div className="py-16 text-center text-muted-foreground">Loading…</div>;

  const stats = data!;
  const tierEntries = Object.entries(stats.tierCounts).map(([productId, count]) => ({
    name: productToName[productId] || productId,
    count,
  }));

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">Finance Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><p className="text-3xl font-bold">{stats.totalUsers}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><p className="text-3xl font-bold">{stats.totalInvoices}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">MRR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><p className="text-3xl font-bold">${stats.mrr.toFixed(2)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Projected Annual</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><p className="text-3xl font-bold">${stats.projectedAnnual.toFixed(2)}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Subscriptions by Tier</CardTitle></CardHeader>
        <CardContent>
          {tierEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active subscriptions yet.</p>
          ) : (
            <div className="space-y-3">
              {tierEntries.map((t) => (
                <div key={t.name} className="flex items-center justify-between">
                  <span className="font-medium">{t.name}</span>
                  <span className="text-muted-foreground">{t.count} subscriber{t.count !== 1 ? "s" : ""}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

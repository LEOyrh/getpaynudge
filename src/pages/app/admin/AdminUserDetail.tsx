import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePageMeta } from "@/hooks/usePageMeta";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { stripePlans } from "@/config/stripe";

const productToName: Record<string, string> = {};
for (const [key, val] of Object.entries(stripePlans)) {
  productToName[val.productId] = key.charAt(0).toUpperCase() + key.slice(1);
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  overdue: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  cancelled: "bg-muted text-muted-foreground",
};

export default function AdminUserDetail() {
  usePageMeta({ title: "Admin — User Detail" });
  const { userId } = useParams<{ userId: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-user-detail", userId],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("admin-stats", {
        body: { action: "user-detail", userId },
      });
      return data as {
        email: string;
        profile: { full_name: string | null; business_name: string | null; created_at: string } | null;
        invoices: Array<{
          id: string;
          invoice_number: string;
          client_name: string;
          amount: number;
          currency: string;
          status: string;
          due_date: string;
          created_at: string;
        }>;
        subscription: { productId: string; status: string; currentPeriodEnd: string } | null;
      };
    },
    enabled: !!userId,
  });

  if (isLoading) return <div className="py-16 text-center text-muted-foreground">Loading…</div>;
  if (!data) return <div className="py-16 text-center text-muted-foreground">User not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/app/admin/users"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="font-heading text-2xl font-bold text-foreground">{data.email}</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">Profile</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Name:</span> {data.profile?.full_name || "—"}</p>
            <p><span className="text-muted-foreground">Business:</span> {data.profile?.business_name || "—"}</p>
            <p><span className="text-muted-foreground">Joined:</span> {data.profile ? format(new Date(data.profile.created_at), "MMM d, yyyy") : "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Subscription</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {data.subscription ? (
              <>
                <p><span className="text-muted-foreground">Plan:</span> {productToName[data.subscription.productId] || data.subscription.productId}</p>
                <p><span className="text-muted-foreground">Status:</span> {data.subscription.status}</p>
                <p><span className="text-muted-foreground">Renews:</span> {format(new Date(data.subscription.currentPeriodEnd), "MMM d, yyyy")}</p>
              </>
            ) : (
              <p className="text-muted-foreground">Free plan</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Invoices ({data.invoices.length})</CardTitle></CardHeader>
        <CardContent>
          {data.invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No invoices.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.invoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">{inv.invoice_number}</TableCell>
                      <TableCell>{inv.client_name}</TableCell>
                      <TableCell>{formatCurrency(inv.amount, inv.currency)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={statusColors[inv.status]}>
                          {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(inv.due_date), "MMM d, yyyy")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

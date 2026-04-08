import { FileText, Clock, DollarSign, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";

const stats = [
  { label: "Active Invoices", value: "0", icon: FileText, color: "text-primary" },
  { label: "Overdue", value: "0", icon: Clock, color: "text-destructive" },
  { label: "Paid This Month", value: "$0", icon: DollarSign, color: "text-green-600" },
  { label: "Reminders Sent", value: "0", icon: Bell, color: "text-primary" },
];

export default function Dashboard() {
  usePageMeta({ title: "Dashboard" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-foreground">Dashboard</h1>
        <Button asChild>
          <Link to="/app/invoices/new">New Invoice</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
    </div>
  );
}

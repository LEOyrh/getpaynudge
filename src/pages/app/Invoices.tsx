import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function Invoices() {
  usePageMeta({ title: "Invoices" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-foreground">Invoices</h1>
        <Button asChild>
          <Link to="/app/invoices/new">New Invoice</Link>
        </Button>
      </div>

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
    </div>
  );
}

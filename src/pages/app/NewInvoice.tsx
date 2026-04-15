import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, ArrowLeft, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useInvoiceLimits } from "@/hooks/useInvoiceLimits";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Link } from "react-router-dom";

const invoiceSchema = z.object({
  client_name: z.string().trim().min(1, "Client name is required").max(200),
  client_email: z.string().trim().email("Invalid email").max(255).or(z.literal("")),
  invoice_number: z.string().trim().min(1, "Invoice number is required").max(50),
  amount: z.coerce.number().positive("Amount must be positive"),
  currency: z.string().default("USD"),
  due_date: z.date({ required_error: "Due date is required" }),
  payment_link: z.string().url("Must be a valid URL").max(2000).or(z.literal("")).optional(),
  notes: z.string().max(2000).optional(),
});

type InvoiceForm = z.infer<typeof invoiceSchema>;

export default function NewInvoice() {
  usePageMeta({ title: "New Invoice" });
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const { atLimit, limit, activeCount, isUnlimited, planKey } = useInvoiceLimits();

  const form = useForm<InvoiceForm>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      client_name: "",
      client_email: "",
      invoice_number: "",
      amount: undefined,
      currency: "USD",
      payment_link: "",
      notes: "",
    },
  });

  const onSubmit = async (data: InvoiceForm) => {
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase.from("invoices").insert({
      user_id: user.id,
      client_name: data.client_name,
      client_email: data.client_email || null,
      invoice_number: data.invoice_number,
      amount: data.amount,
      currency: data.currency,
      due_date: format(data.due_date, "yyyy-MM-dd"),
      payment_link: data.payment_link || null,
      status: "sent",
    } as any);

    if (error) {
      toast.error("Failed to create invoice");
    } else {
      toast.success("Invoice created");
      navigate("/app/invoices");
    }
    setSubmitting(false);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/app/invoices"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="font-heading text-2xl font-bold text-foreground">New Invoice</h1>
      </div>

      {atLimit && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-start gap-3 py-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div>
              <p className="font-semibold text-foreground">
                Invoice limit reached ({activeCount}/{limit})
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Your {planKey.charAt(0).toUpperCase() + planKey.slice(1)} plan allows {limit} active invoice{limit !== 1 ? "s" : ""}. Upgrade to add more.
              </p>
              <Button size="sm" className="mt-2" asChild>
                <Link to="/app/billing">Upgrade Plan</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Invoice Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="client_name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name</FormLabel>
                    <FormControl><Input placeholder="Acme Corp" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="client_email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Email</FormLabel>
                    <FormControl><Input type="email" placeholder="billing@acme.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <FormField control={form.control} name="invoice_number" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice #</FormLabel>
                    <FormControl><Input placeholder="INV-001" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="amount" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="currency" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="CAD">CAD</SelectItem>
                        <SelectItem value="AUD">AUD</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="due_date" render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" className={cn("w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="payment_link" render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Link (optional)</FormLabel>
                  <FormControl><Input type="url" placeholder="https://pay.example.com/inv-001" {...field} /></FormControl>
                  <p className="text-xs text-muted-foreground">A URL where your client can pay. Included in reminder emails.</p>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl><Textarea placeholder="Any additional notes..." rows={3} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={submitting || atLimit}>
                  {submitting ? "Creating…" : "Create Invoice"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/app/invoices")}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

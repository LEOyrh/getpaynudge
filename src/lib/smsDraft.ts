import { format } from "date-fns";
import { predictPayDate, type ClientPayBehavior } from "@/hooks/useClientPayBehavior";

interface BuildSmsParams {
  clientName: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  dueDate: string;
  paymentLink?: string | null;
  businessName?: string | null;
  payBehavior?: ClientPayBehavior;
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

/**
 * Build a pre-filled SMS draft body for an invoice reminder.
 * Includes the predicted pay date when available.
 */
export function buildInvoiceSmsBody(params: BuildSmsParams): string {
  const { clientName, invoiceNumber, amount, currency, dueDate, paymentLink, businessName, payBehavior } = params;
  const firstName = clientName.split(" ")[0] || clientName;
  const formattedAmount = formatCurrency(amount, currency);
  const formattedDue = format(new Date(dueDate), "MMM d");
  const predicted = predictPayDate(dueDate, payBehavior?.avg_days_late ?? null);

  const lines: string[] = [
    `Hi ${firstName}, quick nudge on invoice ${invoiceNumber} (${formattedAmount}) due ${formattedDue}.`,
  ];

  if (predicted && payBehavior && (payBehavior.paid_count ?? 0) >= 2) {
    const predictedStr = format(predicted, "MMM d");
    lines.push(`Based on past timing I'm expecting payment around ${predictedStr} — let me know if that still works.`);
  }

  if (paymentLink) {
    lines.push(`Pay here: ${paymentLink}`);
  }

  if (businessName) {
    lines.push(`Thanks, ${businessName}`);
  }

  return lines.join("\n\n");
}

/**
 * Build an sms: href. Body is URL-encoded; the `?body=` param is widely
 * supported on iOS and Android (Google Messages, Samsung Messages).
 */
export function buildSmsHref(body: string, phone?: string | null): string {
  const encoded = encodeURIComponent(body);
  const target = phone ? phone.replace(/\s+/g, "") : "";
  return `sms:${target}?&body=${encoded}`;
}

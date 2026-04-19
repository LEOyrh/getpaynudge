import { TrendingUp, Clock, AlertTriangle, Sparkles, Lock } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ClientPayBehavior } from "@/hooks/useClientPayBehavior";
import { predictPayDate } from "@/hooks/useClientPayBehavior";

type Tier = "great" | "okay" | "risky" | "new";

function tierFor(score: number | null): Tier {
  if (score == null) return "new";
  if (score >= 80) return "great";
  if (score >= 50) return "okay";
  return "risky";
}

const tierConfig: Record<
  Tier,
  { label: string; className: string; Icon: typeof TrendingUp }
> = {
  great: {
    label: "Reliable",
    className: "bg-primary/15 text-primary border border-primary/30 hover:bg-primary/15",
    Icon: TrendingUp,
  },
  okay: {
    label: "Average",
    className:
      "bg-foreground/10 text-foreground border border-foreground/20 hover:bg-foreground/10",
    Icon: Clock,
  },
  risky: {
    label: "Slow payer",
    className:
      "bg-destructive/15 text-destructive border border-destructive/30 hover:bg-destructive/15",
    Icon: AlertTriangle,
  },
  new: {
    label: "New",
    className: "bg-muted text-muted-foreground border border-border hover:bg-muted",
    Icon: Sparkles,
  },
};

interface PayBehaviorBadgeProps {
  data?: ClientPayBehavior;
  /** Show the predicted pay date alongside (Studio only). Pass dueDate to compute. */
  dueDate?: string;
  predictedPayDateUnlocked?: boolean;
  size?: "sm" | "md";
}

export function PayBehaviorBadge({
  data,
  dueDate,
  predictedPayDateUnlocked,
  size = "sm",
}: PayBehaviorBadgeProps) {
  const score = data?.score ?? null;
  const tier = tierFor(score);
  const cfg = tierConfig[tier];
  const Icon = cfg.Icon;

  const predicted =
    dueDate && data?.avg_days_late != null
      ? predictPayDate(dueDate, data.avg_days_late)
      : null;

  const textSize = size === "md" ? "text-xs" : "text-[10px]";
  const iconSize = size === "md" ? "h-3 w-3" : "h-2.5 w-2.5";

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1.5">
            <Badge className={`${cfg.className} ${textSize} font-semibold uppercase tracking-wider`}>
              <Icon className={`${iconSize} mr-0.5`} />
              {score != null ? score : cfg.label}
            </Badge>
            {predicted && predictedPayDateUnlocked && (
              <span className={`${textSize} text-muted-foreground`}>
                ~{format(predicted, "MMM d")}
              </span>
            )}
            {predicted && !predictedPayDateUnlocked && (
              <span className={`inline-flex items-center gap-0.5 ${textSize} text-muted-foreground/70`}>
                <Lock className={iconSize} />
                Studio
              </span>
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <PayBehaviorTooltip data={data} predicted={predicted} predictedUnlocked={predictedPayDateUnlocked} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function PayBehaviorTooltip({
  data,
  predicted,
  predictedUnlocked,
}: {
  data?: ClientPayBehavior;
  predicted: Date | null;
  predictedUnlocked?: boolean;
}) {
  if (!data || data.paid_count === 0) {
    return (
      <div className="space-y-1 text-xs">
        <p className="font-semibold text-foreground">No payment history yet</p>
        <p className="text-muted-foreground">
          The score appears once this client has paid an invoice.
        </p>
      </div>
    );
  }
  const onTimePct = Math.round((data.on_time_rate ?? 0) * 100);
  const avgLate = data.avg_days_late ? Number(data.avg_days_late).toFixed(1) : "0";
  return (
    <div className="space-y-1.5 text-xs">
      <p className="font-semibold text-foreground">
        Pay-Behavior Score: {data.score}/100
      </p>
      <ul className="space-y-0.5 text-muted-foreground">
        <li>{onTimePct}% paid on time ({data.paid_count} invoices)</li>
        <li>Avg {avgLate} days late</li>
        {predicted && predictedUnlocked && (
          <li className="text-foreground">
            Next expected pay: {format(predicted, "MMM d, yyyy")}
          </li>
        )}
        {predicted && !predictedUnlocked && (
          <li className="text-muted-foreground/80">
            Predicted pay date is a Studio feature.
          </li>
        )}
      </ul>
    </div>
  );
}

export function PayBehaviorPanel({
  clientName,
  data,
  dueDate,
  predictedPayDateUnlocked,
}: {
  clientName: string;
  data?: ClientPayBehavior;
  dueDate?: string;
  predictedPayDateUnlocked?: boolean;
}) {
  const tier = tierFor(data?.score ?? null);
  const cfg = tierConfig[tier];
  const Icon = cfg.Icon;
  const onTimePct = data?.on_time_rate != null ? Math.round(data.on_time_rate * 100) : null;
  const avgLate = data?.avg_days_late != null ? Number(data.avg_days_late).toFixed(1) : null;
  const predicted =
    dueDate && data?.avg_days_late != null
      ? predictPayDate(dueDate, data.avg_days_late)
      : null;

  return (
    <div className="space-y-3 rounded-md border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Client behavior
          </p>
          <p className="mt-1 font-heading text-base font-semibold text-foreground">
            {clientName}
          </p>
        </div>
        <Badge className={`${cfg.className} text-xs font-semibold uppercase tracking-wider`}>
          <Icon className="h-3 w-3 mr-1" />
          {data?.score != null ? `${data.score}/100` : cfg.label}
        </Badge>
      </div>

      {data && data.paid_count > 0 ? (
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">On-time rate</p>
            <p className="font-semibold text-foreground">{onTimePct}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Avg days late</p>
            <p className="font-semibold text-foreground">{avgLate}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Paid invoices</p>
            <p className="font-semibold text-foreground">{data.paid_count}</p>
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Score appears after the first paid invoice from this client.
        </p>
      )}

      {predicted && (
        <div className="border-t border-border pt-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Predicted pay date
          </p>
          {predictedPayDateUnlocked ? (
            <p className="mt-1 font-heading text-lg font-bold text-primary">
              ~{format(predicted, "MMM d, yyyy")}
            </p>
          ) : (
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Lock className="h-3.5 w-3.5" />
              Available on Studio
            </p>
          )}
        </div>
      )}
    </div>
  );
}

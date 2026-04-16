import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UpgradePromptProps {
  feature: string;
  requiredPlan: string;
}

export function UpgradePrompt({ feature, requiredPlan }: UpgradePromptProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4">
      <Lock className="h-4 w-4 shrink-0 text-primary" />
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{feature}</p>
        <p className="text-xs text-muted-foreground">
          Available on {requiredPlan} plan and above.
        </p>
      </div>
      <Button size="sm" variant="outline" asChild>
        <Link to="/app/billing">Upgrade</Link>
      </Button>
    </div>
  );
}

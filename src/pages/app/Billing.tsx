import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Clock, CreditCard, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import { plans } from "@/config/brand";
import { stripePlans, planKeyFromProductId, StripePlanKey } from "@/config/stripe";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

/** Format a UTC ISO date string as a date using UTC so timezone doesn't shift the day */
function formatSubDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function Billing() {
  usePageMeta({ title: "Billing", description: "Manage your PayNudge subscription" });

  const { subscription, checkSubscription } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const currentPlanKey = planKeyFromProductId(subscription.productId);

  // Handle success/canceled query params
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("Subscription activated! Welcome aboard.");
      checkSubscription();
      setSearchParams({}, { replace: true });
    } else if (searchParams.get("canceled") === "true") {
      toast.info("Checkout was canceled.");
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, checkSubscription, setSearchParams]);

  const handleCheckout = async (planId: string) => {
    if (!(planId in stripePlans)) return;
    const priceId = stripePlans[planId as StripePlanKey].priceId;
    setCheckoutLoading(planId);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to start checkout");
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleManage = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to open billing portal");
    } finally {
      setPortalLoading(false);
    }
  };

  const paidPlans = plans.filter((p) => p.price > 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Billing</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your subscription and payment details.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => checkSubscription()}
          disabled={subscription.loading}
        >
          <RefreshCw className={cn("mr-1 h-4 w-4", subscription.loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Cancellation notice */}
      {subscription.cancelAtPeriodEnd && subscription.subscriptionEnd && (
        <Card className="border-yellow-500/40 bg-yellow-500/10">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0" />
            <p className="text-sm text-foreground">
              Your subscription has been canceled and will remain active until{" "}
              <span className="font-semibold">
                {formatSubDate(subscription.subscriptionEnd)}
              </span>
              . After that date you'll be moved to the Free plan.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Trial notice */}
      {subscription.isTrialing && subscription.trialEnd && (
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="flex items-center gap-3 py-4">
            <Clock className="h-5 w-5 text-primary shrink-0" />
            <p className="text-sm text-foreground">
              You're on a <span className="font-semibold">free trial</span> until{" "}
              <span className="font-semibold">
                {formatSubDate(subscription.trialEnd)}
              </span>
              .{" "}
              {(() => {
                const days = Math.max(0, Math.ceil((new Date(subscription.trialEnd).getTime() - Date.now()) / 86400000));
                return <span className="text-primary font-semibold">{days} day{days !== 1 ? "s" : ""} remaining</span>;
              })()}
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex items-center justify-between py-5">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-primary" />
            <div>
              <p className="font-heading font-semibold text-foreground">
                {subscription.loading
                  ? "Loading…"
                  : `Current plan: ${currentPlanKey.charAt(0).toUpperCase() + currentPlanKey.slice(1)}`}
              </p>
              {subscription.subscriptionEnd && (
                <p className="text-xs text-muted-foreground">
                  {subscription.cancelAtPeriodEnd ? "Active until" : "Renews"}{" "}
                  {formatSubDate(subscription.subscriptionEnd)}
                </p>
              )}
            </div>
          </div>
          {subscription.subscribed && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleManage}
              disabled={portalLoading}
            >
              {portalLoading ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="mr-1 h-4 w-4" />
              )}
              Manage Subscription
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Plan cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        {paidPlans.map((plan) => {
          const isCurrentPlan = plan.id === currentPlanKey;
          const isPlanInStripe = plan.id in stripePlans;

          return (
            <Card
              key={plan.id}
              className={cn(
                "relative h-full transition-shadow",
                isCurrentPlan
                  ? "border-primary shadow-md ring-1 ring-primary"
                  : "border-border hover:shadow-sm"
              )}
            >
              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                  Your Plan
                </div>
              )}
              <CardContent className="flex h-full flex-col pt-8 pb-6">
                <div>
                  <h3 className="font-heading text-lg font-bold text-foreground">{plan.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                  <div className="mt-4">
                    <span className="font-heading text-4xl font-bold text-foreground">
                      ${plan.price}
                    </span>
                    <span className="text-sm text-muted-foreground">/month</span>
                  </div>
                  <ul className="mt-5 space-y-2">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto pt-6">
                  {isCurrentPlan ? (
                    <Button className="w-full" variant="outline" disabled>
                      Current Plan
                    </Button>
                  ) : isPlanInStripe ? (
                    <Button
                      className="w-full"
                      variant={plan.highlighted ? "default" : "outline"}
                      onClick={() => handleCheckout(plan.id)}
                      disabled={!!checkoutLoading}
                    >
                      {checkoutLoading === plan.id ? (
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      ) : null}
                      {subscription.subscribed ? "Switch Plan" : "Start 7-Day Free Trial"}
                    </Button>
                  ) : (
                    <Button className="w-full" variant="outline" asChild>
                      <a href="mailto:support@paynudge.com">Contact Sales</a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

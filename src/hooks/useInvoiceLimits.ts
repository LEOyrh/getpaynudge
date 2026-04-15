import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { planKeyFromProductId, getInvoiceLimit } from "@/config/stripe";
import { useAdminRole } from "@/hooks/useAdminRole";

export function useInvoiceLimits() {
  const { user, subscription } = useAuth();
  const { isAdmin } = useAdminRole();

  const { data: activeCount = 0 } = useQuery({
    queryKey: ["active-invoice-count", user?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("invoices")
        .select("*", { count: "exact", head: true })
        .in("status", ["sent", "overdue", "draft"]);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!user,
  });

  const planKey = planKeyFromProductId(subscription.productId);
  const limit = getInvoiceLimit(planKey);
  const isUnlimited = isAdmin || limit === -1;
  const atLimit = !isUnlimited && activeCount >= limit;
  const remaining = isUnlimited ? Infinity : Math.max(0, limit - activeCount);

  return { planKey, limit, activeCount, isUnlimited, atLimit, remaining };
}

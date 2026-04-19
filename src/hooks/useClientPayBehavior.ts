import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ClientPayBehavior {
  client_name: string;
  total_invoices: number;
  outstanding_count: number;
  paid_count: number;
  avg_days_late: number | null;
  on_time_rate: number | null;
  last_paid_at: string | null;
  score: number | null;
}

/**
 * Fetches per-client pay-behavior aggregates for the current user.
 * Returns a Map keyed by client_name for O(1) lookup from invoice rows.
 */
export function useClientPayBehavior() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["client-pay-behavior", user?.id],
    queryFn: async (): Promise<ClientPayBehavior[]> => {
      const { data, error } = await supabase
        .from("client_pay_behavior" as any)
        .select(
          "client_name,total_invoices,outstanding_count,paid_count,avg_days_late,on_time_rate,last_paid_at,score"
        );
      if (error) throw error;
      return (data ?? []) as unknown as ClientPayBehavior[];
    },
    enabled: !!user,
    staleTime: 60_000,
  });

  const byClient = useMemo(() => {
    const map = new Map<string, ClientPayBehavior>();
    for (const row of query.data ?? []) map.set(row.client_name, row);
    return map;
  }, [query.data]);

  return { ...query, byClient };
}

/**
 * Predict pay date for an outstanding invoice given client's avg lateness.
 * Returns null if we don't have any paid history for this client.
 */
export function predictPayDate(dueDate: string, avgDaysLate: number | null): Date | null {
  if (avgDaysLate == null || Number.isNaN(avgDaysLate)) return null;
  const d = new Date(dueDate);
  d.setDate(d.getDate() + Math.round(avgDaysLate));
  return d;
}

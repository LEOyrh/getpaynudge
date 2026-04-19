-- Per-client pay behavior view, derived from invoices
CREATE OR REPLACE VIEW public.client_pay_behavior
WITH (security_invoker = true)
AS
WITH paid AS (
  SELECT
    user_id,
    client_name,
    GREATEST(0, (updated_at::date - due_date))::int AS days_late,
    CASE WHEN updated_at::date <= due_date THEN 1 ELSE 0 END AS on_time,
    updated_at
  FROM public.invoices
  WHERE status = 'paid'
),
agg_paid AS (
  SELECT
    user_id,
    client_name,
    COUNT(*)::int                       AS paid_count,
    AVG(days_late)::numeric(10,2)       AS avg_days_late,
    AVG(on_time)::numeric(10,4)         AS on_time_rate,
    MAX(updated_at)                     AS last_paid_at
  FROM paid
  GROUP BY user_id, client_name
),
totals AS (
  SELECT
    user_id,
    client_name,
    COUNT(*)::int                                                                AS total_invoices,
    COUNT(*) FILTER (WHERE status IN ('sent','overdue'))::int                    AS outstanding_count
  FROM public.invoices
  GROUP BY user_id, client_name
)
SELECT
  t.user_id,
  t.client_name,
  t.total_invoices,
  t.outstanding_count,
  COALESCE(a.paid_count, 0)         AS paid_count,
  a.avg_days_late,
  a.on_time_rate,
  a.last_paid_at,
  -- Score: 70% weight on-time rate, 30% weight on lateness magnitude (clamped to 30 days)
  CASE
    WHEN a.paid_count IS NULL OR a.paid_count = 0 THEN NULL
    ELSE GREATEST(0, LEAST(100, ROUND(
      70 * a.on_time_rate
      + 30 * GREATEST(0, LEAST(1, 1 - (a.avg_days_late / 30.0)))
    )))::int
  END AS score
FROM totals t
LEFT JOIN agg_paid a
  ON a.user_id = t.user_id AND a.client_name = t.client_name;

-- Grant read to authenticated; security_invoker means underlying invoices RLS still applies
GRANT SELECT ON public.client_pay_behavior TO authenticated;
-- 1) Add soft-delete column to invoice_activities
ALTER TABLE public.invoice_activities
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_invoice_activities_archived_at
  ON public.invoice_activities (archived_at);

-- 2) Tighten RLS on invoice_activities
-- Owners: SELECT only non-archived rows belonging to their invoices
DROP POLICY IF EXISTS "Users can view own invoice activities" ON public.invoice_activities;
CREATE POLICY "Users can view own non-archived activities"
  ON public.invoice_activities
  FOR SELECT
  TO authenticated
  USING (
    archived_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_activities.invoice_id
        AND invoices.user_id = auth.uid()
    )
  );

-- Owners: INSERT activities for their own invoices (unchanged behavior, scoped to authenticated)
DROP POLICY IF EXISTS "Users can insert own invoice activities" ON public.invoice_activities;
CREATE POLICY "Users can insert own invoice activities"
  ON public.invoice_activities
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_activities.invoice_id
        AND invoices.user_id = auth.uid()
    )
  );

-- Admins: SELECT all activities (including archived) via existing has_role()
DROP POLICY IF EXISTS "Admins can view all activities" ON public.invoice_activities;
CREATE POLICY "Admins can view all activities"
  ON public.invoice_activities
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Block ALL deletes for authenticated users (restrictive). Hard-delete is service-role only.
DROP POLICY IF EXISTS "Block deletes for authenticated" ON public.invoice_activities;
CREATE POLICY "Block deletes for authenticated"
  ON public.invoice_activities
  AS RESTRICTIVE
  FOR DELETE
  TO authenticated
  USING (false);

-- Block ALL updates for authenticated users (restrictive). Archive/restore is service-role only via edge fn.
DROP POLICY IF EXISTS "Block updates for authenticated" ON public.invoice_activities;
CREATE POLICY "Block updates for authenticated"
  ON public.invoice_activities
  AS RESTRICTIVE
  FOR UPDATE
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- 3) Hardening user_roles: explicit restrictive denials for anon/authenticated INSERT/UPDATE/DELETE.
-- has_role() and the existing service_role ALL policy continue to work because RESTRICTIVE policies
-- only apply to the authenticated/anon roles listed below.
DROP POLICY IF EXISTS "Deny user_roles insert for clients" ON public.user_roles;
CREATE POLICY "Deny user_roles insert for clients"
  ON public.user_roles
  AS RESTRICTIVE
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (false);

DROP POLICY IF EXISTS "Deny user_roles update for clients" ON public.user_roles;
CREATE POLICY "Deny user_roles update for clients"
  ON public.user_roles
  AS RESTRICTIVE
  FOR UPDATE
  TO authenticated, anon
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "Deny user_roles delete for clients" ON public.user_roles;
CREATE POLICY "Deny user_roles delete for clients"
  ON public.user_roles
  AS RESTRICTIVE
  FOR DELETE
  TO authenticated, anon
  USING (false);
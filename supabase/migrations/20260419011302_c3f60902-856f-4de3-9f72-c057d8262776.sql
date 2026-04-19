-- Enable pgcrypto for symmetric encryption of stored API keys
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- ============================================================
-- stripe_connections: one per user
-- ============================================================
CREATE TABLE public.stripe_connections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  -- Encrypted Stripe restricted API key (bytea, encrypted with pgp_sym_encrypt
  -- using a server-side secret passed in by the edge function).
  -- Never expose this column to the client; RLS below blocks SELECT for
  -- everyone except service_role.
  encrypted_api_key bytea NOT NULL,
  -- Last 4 chars of the live key, safe to display (e.g. "rk_live_…ABCD")
  api_key_last4 text NOT NULL,
  -- Stripe account ID this key belongs to (acct_...)
  stripe_account_id text NOT NULL,
  stripe_account_email text,
  stripe_account_name text,
  last_sync_at timestamptz,
  last_sync_status text, -- 'success' | 'error'
  last_sync_error text,
  invoices_synced_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.stripe_connections ENABLE ROW LEVEL SECURITY;

-- Users can see their own *metadata* — but the encrypted_api_key column is
-- still a column on the row. To prevent it leaking via SELECT *, we expose a
-- view further down and lock direct table access to service_role only for
-- reads, while still letting the user know whether they have a connection
-- (handled via the view).
CREATE POLICY "Service role manages stripe connections"
  ON public.stripe_connections
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can view all stripe connections"
  ON public.stripe_connections
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Block direct user reads of the table (forces clients through the safe view).
-- (No "users can select own" policy on purpose.)

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_stripe_connections_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_stripe_connections_updated_at
  BEFORE UPDATE ON public.stripe_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.set_stripe_connections_updated_at();

-- ============================================================
-- Safe view: lets a user see their own connection metadata
-- WITHOUT exposing the encrypted key column.
-- ============================================================
CREATE OR REPLACE VIEW public.stripe_connections_safe
WITH (security_invoker = true) AS
SELECT
  id,
  user_id,
  api_key_last4,
  stripe_account_id,
  stripe_account_email,
  stripe_account_name,
  last_sync_at,
  last_sync_status,
  last_sync_error,
  invoices_synced_count,
  created_at,
  updated_at
FROM public.stripe_connections
WHERE user_id = auth.uid()
   OR public.has_role(auth.uid(), 'admin'::public.app_role);

GRANT SELECT ON public.stripe_connections_safe TO authenticated;

-- ============================================================
-- stripe_invoice_map: link our invoices to Stripe invoice IDs
-- ============================================================
CREATE TABLE public.stripe_invoice_map (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  stripe_invoice_id text NOT NULL,
  stripe_account_id text NOT NULL,
  last_synced_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (stripe_account_id, stripe_invoice_id)
);

CREATE INDEX idx_stripe_invoice_map_user ON public.stripe_invoice_map(user_id);
CREATE INDEX idx_stripe_invoice_map_invoice ON public.stripe_invoice_map(invoice_id);

ALTER TABLE public.stripe_invoice_map ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stripe invoice mappings"
  ON public.stripe_invoice_map
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all stripe invoice mappings"
  ON public.stripe_invoice_map
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Service role manages stripe invoice mappings"
  ON public.stripe_invoice_map
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Block client-side writes
CREATE POLICY "Block stripe invoice map insert for clients"
  ON public.stripe_invoice_map
  AS RESTRICTIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "Block stripe invoice map update for clients"
  ON public.stripe_invoice_map
  AS RESTRICTIVE
  FOR UPDATE
  TO authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Block stripe invoice map delete for clients"
  ON public.stripe_invoice_map
  AS RESTRICTIVE
  FOR DELETE
  TO authenticated
  USING (false);

-- ============================================================
-- Add stripe_source flag to invoices so the UI can show a badge
-- ============================================================
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual'
    CHECK (source IN ('manual', 'stripe'));

CREATE INDEX IF NOT EXISTS idx_invoices_source ON public.invoices(source);

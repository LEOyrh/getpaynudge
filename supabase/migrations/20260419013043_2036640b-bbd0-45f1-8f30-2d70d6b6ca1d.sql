
-- Encrypt a Stripe API key with the server-side secret
CREATE OR REPLACE FUNCTION public.encrypt_stripe_key(_plaintext text, _secret text)
RETURNS bytea
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT pgp_sym_encrypt(_plaintext, _secret);
$$;

-- Decrypt a Stripe API key with the server-side secret
CREATE OR REPLACE FUNCTION public.decrypt_stripe_key(_ciphertext bytea, _secret text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT pgp_sym_decrypt(_ciphertext, _secret);
$$;

-- Restrict execution to service role only
REVOKE ALL ON FUNCTION public.encrypt_stripe_key(text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.decrypt_stripe_key(bytea, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.encrypt_stripe_key(text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.decrypt_stripe_key(bytea, text) TO service_role;

-- Unique constraint: one stripe connection per user (for now)
CREATE UNIQUE INDEX IF NOT EXISTS stripe_connections_user_id_unique
  ON public.stripe_connections(user_id);

-- Unique mapping per user+stripe invoice id (idempotent sync)
CREATE UNIQUE INDEX IF NOT EXISTS stripe_invoice_map_user_stripe_unique
  ON public.stripe_invoice_map(user_id, stripe_invoice_id);

-- Trigger to auto-update updated_at on stripe_connections
DROP TRIGGER IF EXISTS trg_stripe_connections_updated_at ON public.stripe_connections;
CREATE TRIGGER trg_stripe_connections_updated_at
  BEFORE UPDATE ON public.stripe_connections
  FOR EACH ROW EXECUTE FUNCTION public.set_stripe_connections_updated_at();

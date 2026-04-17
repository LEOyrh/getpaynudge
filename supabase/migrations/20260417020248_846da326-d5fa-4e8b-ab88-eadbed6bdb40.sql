-- Plan tier table maintained by the check-subscription edge function
CREATE TABLE IF NOT EXISTS public.user_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  plan_key TEXT NOT NULL DEFAULT 'free',
  product_id TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own plan"
  ON public.user_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages plans"
  ON public.user_plans FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE TRIGGER update_user_plans_updated_at
  BEFORE UPDATE ON public.user_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function returning the active-invoice cap for a given user
CREATE OR REPLACE FUNCTION public.get_invoice_limit_for_user(_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _plan TEXT;
BEGIN
  -- Admins are unlimited
  IF public.has_role(_user_id, 'admin'::app_role) THEN
    RETURN -1;
  END IF;

  SELECT plan_key INTO _plan FROM public.user_plans WHERE user_id = _user_id;

  RETURN CASE COALESCE(_plan, 'free')
    WHEN 'business' THEN -1
    WHEN 'pro'      THEN 60
    WHEN 'starter'  THEN 20
    ELSE 3 -- free
  END;
END;
$$;

-- Enforce the limit on insert
CREATE OR REPLACE FUNCTION public.enforce_invoice_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _limit INTEGER;
  _count INTEGER;
BEGIN
  IF NEW.status NOT IN ('draft', 'sent', 'overdue') THEN
    RETURN NEW;
  END IF;

  _limit := public.get_invoice_limit_for_user(NEW.user_id);

  IF _limit = -1 THEN
    RETURN NEW;
  END IF;

  SELECT COUNT(*) INTO _count
  FROM public.invoices
  WHERE user_id = NEW.user_id
    AND status IN ('draft', 'sent', 'overdue');

  IF _count >= _limit THEN
    RAISE EXCEPTION 'Invoice limit reached for your plan (% active invoices). Upgrade to add more.', _limit
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_invoice_limit_trigger ON public.invoices;
CREATE TRIGGER enforce_invoice_limit_trigger
  BEFORE INSERT ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.enforce_invoice_limit();
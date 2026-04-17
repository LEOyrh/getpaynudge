-- Server-side enforcement of active invoice limit on INSERT.
-- Active = status in (draft, sent, overdue). Paid/cancelled do not count.
-- Admins and unlimited plans (limit = -1) bypass.

CREATE OR REPLACE FUNCTION public.enforce_invoice_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_limit INTEGER;
  active_count INTEGER;
BEGIN
  -- Admins bypass
  IF public.has_role(NEW.user_id, 'admin'::app_role) THEN
    RETURN NEW;
  END IF;

  -- Get the plan limit for this user (-1 = unlimited)
  user_limit := public.get_invoice_limit_for_user(NEW.user_id);

  IF user_limit = -1 THEN
    RETURN NEW;
  END IF;

  -- Count active invoices for this user
  SELECT COUNT(*) INTO active_count
  FROM public.invoices
  WHERE user_id = NEW.user_id
    AND status IN ('draft', 'sent', 'overdue');

  IF active_count >= user_limit THEN
    RAISE EXCEPTION 'Active invoice limit reached (%/%) for your plan. Mark an invoice paid or cancelled, or upgrade your plan.', active_count, user_limit
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_invoice_limit_trigger ON public.invoices;

CREATE TRIGGER enforce_invoice_limit_trigger
BEFORE INSERT ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.enforce_invoice_limit();
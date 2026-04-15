
CREATE TABLE public.email_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL,
  tracking_id text NOT NULL,
  event_type text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_events_invoice ON public.email_events(invoice_id);
CREATE INDEX idx_email_events_tracking ON public.email_events(tracking_id);

ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;

-- Service role can insert (from edge function)
CREATE POLICY "Service role can insert email events"
  ON public.email_events FOR INSERT
  TO public
  WITH CHECK (auth.role() = 'service_role');

-- Users can view events for their own invoices
CREATE POLICY "Users can view own invoice events"
  ON public.email_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = email_events.invoice_id
        AND invoices.user_id = auth.uid()
    )
  );

-- Admins can view all events
CREATE POLICY "Admins can view all email events"
  ON public.email_events FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

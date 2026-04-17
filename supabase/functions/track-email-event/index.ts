import { createClient } from 'npm:@supabase/supabase-js@2'

// This edge function handles two tracking endpoints:
// GET /track-email-event?t=<trackingId>&e=open  → returns 1x1 transparent pixel
// GET /track-email-event?t=<trackingId>&e=click&r=<url> → logs click, redirects to url
//
// Security: the redirect target is NOT trusted from the query string. It is
// validated against the invoice's stored payment_link to prevent open-redirect
// abuse (phishing via the legit app domain).

const TRANSPARENT_PIXEL = Uint8Array.from(atob(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
), c => c.charCodeAt(0))

Deno.serve(async (req) => {
  const url = new URL(req.url)
  const trackingId = url.searchParams.get('t')
  const eventType = url.searchParams.get('e')
  const redirectUrl = url.searchParams.get('r')

  if (!trackingId || !eventType || !['open', 'click'].includes(eventType)) {
    return new Response('Bad request', { status: 400 })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Parse tracking ID format: {invoiceId}_{messageId}
  const parts = trackingId.split('_')
  const invoiceId = parts[0]

  // Log the event (fire-and-forget — don't block the response)
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown'
  const ua = req.headers.get('user-agent') || 'unknown'

  supabase.from('email_events').insert({
    invoice_id: invoiceId,
    tracking_id: trackingId,
    event_type: eventType,
    metadata: { ip, user_agent: ua },
  }).then(({ error }) => {
    if (error) console.error('Failed to log email event', { error, trackingId, eventType })
  })

  if (eventType === 'click') {
    if (!redirectUrl) {
      return new Response('Missing redirect', { status: 400 })
    }

    // Basic URL parse first — must be a well-formed http(s) URL
    let parsedRequested: URL
    try {
      parsedRequested = new URL(redirectUrl)
      if (!['http:', 'https:'].includes(parsedRequested.protocol)) {
        return new Response('Invalid redirect', { status: 400 })
      }
    } catch {
      return new Response('Invalid redirect URL', { status: 400 })
    }

    // Look up the invoice's stored payment_link and verify the requested
    // redirect matches. This prevents callers from substituting an arbitrary
    // URL (open-redirect / phishing).
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('payment_link')
      .eq('id', invoiceId)
      .maybeSingle()

    if (invoiceError || !invoice?.payment_link) {
      console.warn('Click redirect rejected — no payment_link on invoice', {
        invoiceId,
        error: invoiceError,
      })
      return new Response('Invalid redirect', { status: 400 })
    }

    let parsedStored: URL
    try {
      parsedStored = new URL(invoice.payment_link)
    } catch {
      return new Response('Invalid redirect', { status: 400 })
    }

    // Require an exact match on origin + pathname. Query/fragment may differ
    // harmlessly, but the destination host and path must be the one we sent.
    if (
      parsedRequested.origin !== parsedStored.origin ||
      parsedRequested.pathname !== parsedStored.pathname
    ) {
      console.warn('Click redirect rejected — does not match stored payment_link', {
        invoiceId,
        requested: parsedRequested.href,
        stored: parsedStored.href,
      })
      return new Response('Invalid redirect', { status: 400 })
    }

    return new Response(null, {
      status: 302,
      headers: {
        'Location': invoice.payment_link,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    })
  }

  // Return tracking pixel for open events
  return new Response(TRANSPARENT_PIXEL, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  })
})

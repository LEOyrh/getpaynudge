import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const today = new Date().toISOString().split('T')[0]

  // Get all enabled reminders with their invoice data
  const { data: reminders, error: rErr } = await supabase
    .from('invoice_reminders')
    .select('*, invoices!inner(id, invoice_number, amount, currency, due_date, client_name, client_email, status, user_id, payment_link)')
    .eq('enabled', true)
    .in('invoices.status', ['sent', 'overdue'])

  if (rErr) {
    console.error('Failed to fetch reminders', rErr)
    return new Response(JSON.stringify({ error: 'Failed to fetch reminders' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let sentCount = 0

  for (const reminder of reminders ?? []) {
    const invoice = (reminder as any).invoices
    if (!invoice?.client_email) continue

    // Calculate trigger date based on due_date + days_offset
    const dueDate = new Date(invoice.due_date)
    let triggerDate: Date

    if (reminder.reminder_type === 'before_due') {
      triggerDate = new Date(dueDate)
      triggerDate.setDate(triggerDate.getDate() - reminder.days_offset)
    } else if (reminder.reminder_type === 'on_due') {
      triggerDate = dueDate
    } else {
      // after_due
      triggerDate = new Date(dueDate)
      triggerDate.setDate(triggerDate.getDate() + reminder.days_offset)
    }

    const triggerDateStr = triggerDate.toISOString().split('T')[0]
    if (triggerDateStr !== today) continue

    // Determine tone based on timing
    let tone: 'friendly' | 'professional' | 'firm' = 'friendly'
    if (reminder.reminder_type === 'after_due' && reminder.days_offset >= 7) {
      tone = 'firm'
    } else if (reminder.reminder_type === 'after_due' || reminder.reminder_type === 'on_due') {
      tone = 'professional'
    }

    // Get business name from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('business_name, full_name')
      .eq('user_id', invoice.user_id)
      .maybeSingle()

    const businessName = profile?.business_name || profile?.full_name || 'Your service provider'

    const amount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoice.currency || 'USD',
    }).format(invoice.amount)

    const formattedDue = new Date(invoice.due_date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    })

    // Send via send-transactional-email (invoke internally)
    const { error: sendErr } = await supabase.functions.invoke('send-transactional-email', {
      body: {
        templateName: 'payment-reminder',
        recipientEmail: invoice.client_email,
        idempotencyKey: `reminder-${reminder.id}-${today}`,
        templateData: {
          invoiceId: invoice.id,
          clientName: invoice.client_name,
          invoiceNumber: invoice.invoice_number,
          amount,
          dueDate: formattedDue,
          businessName,
          tone,
          payLink: invoice.payment_link || undefined,
        },
      },
    })

    if (sendErr) {
      console.error('Failed to send reminder', { invoiceId: invoice.id, error: sendErr })
      continue
    }

    // Log activity
    await supabase.from('invoice_activities').insert({
      invoice_id: invoice.id,
      activity_type: 'reminder_sent',
      description: `Payment reminder sent to ${invoice.client_email} (${tone} tone)`,
    })

    sentCount++
  }

  console.log(`Processed reminders: ${sentCount} sent`)

  return new Response(
    JSON.stringify({ success: true, sent: sentCount }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})

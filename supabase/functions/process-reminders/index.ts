import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Map internal reminder schedule -> voice-trainer stage
function reminderToStage(
  type: string,
  daysOffset: number,
): 'heads_up' | 'due' | 'gentle' | 'firm' | 'final' {
  if (type === 'before_due') return 'heads_up'
  if (type === 'on_due') return 'due'
  // after_due
  if (daysOffset >= 14) return 'final'
  if (daysOffset >= 7) return 'firm'
  return 'gentle'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')
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
  let voiceRenderedCount = 0

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

    // Determine tone for the generic template
    let tone: 'friendly' | 'professional' | 'firm' = 'friendly'
    if (reminder.reminder_type === 'after_due' && reminder.days_offset >= 7) {
      tone = 'firm'
    } else if (reminder.reminder_type === 'after_due' || reminder.reminder_type === 'on_due') {
      tone = 'professional'
    }

    // Get business name + full name from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('business_name, full_name')
      .eq('user_id', invoice.user_id)
      .maybeSingle()

    const businessName = profile?.business_name || profile?.full_name || 'Your service provider'
    const senderName = profile?.full_name || profile?.business_name || undefined

    const amount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoice.currency || 'USD',
    }).format(invoice.amount)

    const formattedDue = new Date(invoice.due_date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    })

    // Check if user has opted into voice rendering
    const { data: voiceProfile } = await supabase
      .from('voice_profiles')
      .select('voice_enabled, tone_profile')
      .eq('user_id', invoice.user_id)
      .maybeSingle()

    const wantsVoice =
      !!voiceProfile?.voice_enabled &&
      !!voiceProfile?.tone_profile &&
      !!lovableApiKey

    let voiceBody: string | null = null
    let voiceSubject: string | null = null
    let voiceFailed = false

    if (wantsVoice) {
      try {
        const stage = reminderToStage(reminder.reminder_type, reminder.days_offset)
        const daysOffsetSigned =
          reminder.reminder_type === 'before_due'
            ? -reminder.days_offset
            : reminder.reminder_type === 'on_due'
              ? 0
              : reminder.days_offset

        const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-3-flash-preview',
            messages: [
              {
                role: 'system',
                content: [
                  "You write invoice payment-reminder emails in the user's saved voice.",
                  '- Output ONLY plain text via the tool. No HTML, no markdown.',
                  '- Keep it under 110 words.',
                  '- Reference the actual invoice number, amount, and due date.',
                  '- Never threaten, never use ALL CAPS.',
                  '- If a payment_link is provided, include it on its own line.',
                  "- End with the user's typical sign-off + their name.",
                ].join('\n'),
              },
              {
                role: 'user',
                content: [
                  `Writer voice profile (apply faithfully):\n${JSON.stringify(voiceProfile.tone_profile, null, 2)}`,
                  '',
                  `Stage: ${stage}`,
                  '',
                  'Invoice context:',
                  `- Client: ${invoice.client_name}`,
                  `- Invoice #: ${invoice.invoice_number}`,
                  `- Amount: ${amount}`,
                  `- Due date: ${formattedDue}`,
                  `- Days offset from due date: ${daysOffsetSigned}`,
                  senderName ? `- Sender name: ${senderName}` : '',
                  invoice.payment_link ? `- Payment link: ${invoice.payment_link}` : '',
                  '',
                  'Write the reminder now.',
                ]
                  .filter(Boolean)
                  .join('\n'),
              },
            ],
            tools: [
              {
                type: 'function',
                function: {
                  name: 'save_reminder',
                  description: "Save the reminder email written in the user's voice.",
                  parameters: {
                    type: 'object',
                    properties: {
                      subject: { type: 'string' },
                      body: { type: 'string' },
                    },
                    required: ['subject', 'body'],
                    additionalProperties: false,
                  },
                },
              },
            ],
            tool_choice: { type: 'function', function: { name: 'save_reminder' } },
          }),
        })

        if (!aiRes.ok) {
          console.warn('Voice render failed, falling back to template', {
            status: aiRes.status,
            invoiceId: invoice.id,
          })
          voiceFailed = true
        } else {
          const aiData = await aiRes.json()
          const argsStr = aiData?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments
          if (argsStr) {
            const parsed = JSON.parse(argsStr)
            voiceSubject = parsed.subject ?? null
            voiceBody = parsed.body ?? null
          } else {
            voiceFailed = true
          }
        }
      } catch (e) {
        console.warn('Voice render threw, falling back to template', { invoiceId: invoice.id, err: String(e) })
        voiceFailed = true
      }
    }

    // Send via send-transactional-email — pass voice content via templateData
    // so the payment-reminder template renders the AI body when present and
    // falls back to the canned tone copy when absent.
    const usingVoice = !!voiceBody && !!voiceSubject
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
          ...(usingVoice ? { voiceBody, voiceSubject } : {}),
        },
      },
    })

    if (sendErr) {
      console.error('Failed to send reminder', { invoiceId: invoice.id, error: sendErr })
      continue
    }

    // Log activity (note voice vs standard, and silent fallback if it happened)
    const renderLabel = usingVoice
      ? 'voice'
      : voiceFailed
        ? 'standard (voice fallback)'
        : 'standard'
    await supabase.from('invoice_activities').insert({
      invoice_id: invoice.id,
      activity_type: 'reminder_sent',
      description: `Payment reminder sent to ${invoice.client_email} — ${renderLabel} tone (${tone})`,
    })

    if (usingVoice) voiceRenderedCount++
    sentCount++
  }

  console.log(`Processed reminders: ${sentCount} sent (${voiceRenderedCount} voice-rendered)`)

  return new Response(
    JSON.stringify({ success: true, sent: sentCount, voice_rendered: voiceRenderedCount }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})

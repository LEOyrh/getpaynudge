import { createClient } from 'npm:@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@18.5.0'

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

  // Verify admin
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: userData, error: userError } = await supabase.auth.getUser(token)
  if (userError || !userData.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Check admin role
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userData.user.id)
    .eq('role', 'admin')
    .maybeSingle()

  if (!roleData) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const url = new URL(req.url)
  const action = url.searchParams.get('action') || 'stats'

  try {
    if (action === 'stats') {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Get total invoices
      const { count: totalInvoices } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })

      // Get Stripe subscription stats
      const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
      let tierCounts: Record<string, number> = {}
      let mrr = 0

      if (stripeKey) {
        const stripe = new Stripe(stripeKey, { apiVersion: '2025-08-27.basil' })
        const subs = await stripe.subscriptions.list({ status: 'active', limit: 100 })

        for (const sub of subs.data) {
          const productId = sub.items.data[0]?.price?.product as string
          tierCounts[productId] = (tierCounts[productId] || 0) + 1
          const amount = sub.items.data[0]?.price?.unit_amount || 0
          mrr += amount / 100
        }
      }

      return new Response(JSON.stringify({
        totalUsers: totalUsers || 0,
        totalInvoices: totalInvoices || 0,
        tierCounts,
        mrr,
        projectedAnnual: mrr * 12,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'users') {
      // List all users with profiles
      const { data: authUsers } = await supabase.auth.admin.listUsers({ perPage: 1000 })
      const { data: profiles } = await supabase.from('profiles').select('*')

      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]))

      const users = (authUsers?.users || []).map(u => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        full_name: profileMap.get(u.id)?.full_name || null,
        business_name: profileMap.get(u.id)?.business_name || null,
      }))

      return new Response(JSON.stringify({ users }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'user-detail') {
      const userId = url.searchParams.get('userId')
      if (!userId) {
        return new Response(JSON.stringify({ error: 'userId required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      const { data: invoices } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      // Get Stripe subscription for this user
      const { data: authUser } = await supabase.auth.admin.getUserById(userId)
      let subscription = null
      const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
      if (stripeKey && authUser?.user?.email) {
        const stripe = new Stripe(stripeKey, { apiVersion: '2025-08-27.basil' })
        const customers = await stripe.customers.list({ email: authUser.user.email, limit: 1 })
        if (customers.data.length > 0) {
          const subs = await stripe.subscriptions.list({ customer: customers.data[0].id, status: 'active', limit: 1 })
          if (subs.data.length > 0) {
            const sub = subs.data[0]
            subscription = {
              productId: sub.items.data[0]?.price?.product,
              priceId: sub.items.data[0]?.price?.id,
              status: sub.status,
              currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
            }
          }
        }
      }

      return new Response(JSON.stringify({
        profile,
        invoices: invoices || [],
        subscription,
        email: authUser?.user?.email,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'all-invoices') {
      const { data: invoices } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500)

      return new Response(JSON.stringify({ invoices: invoices || [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('admin-stats error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

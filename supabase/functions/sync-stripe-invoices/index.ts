// Pulls open + overdue (uncollectible/past_due) invoices from Stripe and imports them.
// Idempotent via stripe_invoice_map (user_id + stripe_invoice_id unique).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type StripeInvoice = {
  id: string;
  number: string | null;
  status: string;
  due_date: number | null;
  created: number;
  amount_due: number;
  amount_remaining: number;
  currency: string;
  customer_name: string | null;
  customer_email: string | null;
  customer: string | null;
  hosted_invoice_url: string | null;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const encSecret = Deno.env.get("STRIPE_KEY_ENCRYPTION_SECRET");
    if (!encSecret) return json({ error: "Server not configured" }, 500);

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userRes, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userRes.user) return json({ error: "Unauthorized" }, 401);
    const user = userRes.user;

    const admin = createClient(supabaseUrl, serviceKey);

    // Load connection
    const { data: conn, error: connErr } = await admin
      .from("stripe_connections")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (connErr) return json({ error: "Failed to load connection" }, 500);
    if (!conn) return json({ error: "No Stripe connection. Connect first." }, 400);

    // Decrypt key
    const { data: apiKey, error: decErr } = await admin.rpc("decrypt_stripe_key", {
      _ciphertext: conn.encrypted_api_key,
      _secret: encSecret,
    });
    if (decErr || !apiKey) {
      console.error("decrypt failed", decErr);
      return json({ error: "Failed to decrypt Stripe key" }, 500);
    }

    // Plan limit (so we don't blow past it during import)
    const { data: limitData } = await admin.rpc("get_invoice_limit_for_user", {
      _user_id: user.id,
    });
    const planLimit: number = limitData ?? 3; // -1 = unlimited

    // Count current active invoices
    const { count: activeCount } = await admin
      .from("invoices")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .in("status", ["draft", "sent", "overdue"]);
    let currentActive = activeCount ?? 0;

    // Fetch open invoices from Stripe (paginate up to 5 pages = 500)
    const collected: StripeInvoice[] = [];
    let startingAfter: string | null = null;
    for (let page = 0; page < 5; page++) {
      const url = new URL("https://api.stripe.com/v1/invoices");
      url.searchParams.set("status", "open");
      url.searchParams.set("limit", "100");
      if (startingAfter) url.searchParams.set("starting_after", startingAfter);

      const r = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        await admin
          .from("stripe_connections")
          .update({
            last_sync_at: new Date().toISOString(),
            last_sync_status: "error",
            last_sync_error: err?.error?.message ?? `HTTP ${r.status}`,
          })
          .eq("user_id", user.id);
        return json({ error: err?.error?.message ?? "Stripe API error" }, 400);
      }
      const data = await r.json();
      const items: any[] = data?.data ?? [];
      for (const inv of items) {
        collected.push({
          id: inv.id,
          number: inv.number,
          status: inv.status,
          due_date: inv.due_date,
          created: inv.created,
          amount_due: inv.amount_due,
          amount_remaining: inv.amount_remaining,
          currency: inv.currency,
          customer_name: inv.customer_name ?? inv.customer_details?.name ?? null,
          customer_email: inv.customer_email ?? inv.customer_details?.email ?? null,
          customer: typeof inv.customer === "string" ? inv.customer : inv.customer?.id ?? null,
          hosted_invoice_url: inv.hosted_invoice_url ?? null,
        });
      }
      if (!data?.has_more) break;
      startingAfter = items[items.length - 1]?.id ?? null;
      if (!startingAfter) break;
    }

    // Import (insert new ones; update existing mapped ones)
    let imported = 0;
    let updated = 0;
    let skippedDueToLimit = 0;
    const today = new Date();

    for (const inv of collected) {
      // Determine status
      const dueMs = inv.due_date ? inv.due_date * 1000 : null;
      const isOverdue = dueMs !== null && dueMs < today.getTime();
      const localStatus: "sent" | "overdue" = isOverdue ? "overdue" : "sent";

      // Resolve client name (fallback: fetch customer)
      let clientName = inv.customer_name;
      let clientEmail = inv.customer_email;
      if ((!clientName || !clientEmail) && inv.customer) {
        try {
          const cr = await fetch(`https://api.stripe.com/v1/customers/${inv.customer}`, {
            headers: { Authorization: `Bearer ${apiKey}` },
          });
          if (cr.ok) {
            const c = await cr.json();
            clientName = clientName ?? c?.name ?? c?.email ?? "Stripe Customer";
            clientEmail = clientEmail ?? c?.email ?? null;
          }
        } catch (_) { /* ignore */ }
      }
      clientName = clientName ?? "Stripe Customer";

      const issueDate = new Date(inv.created * 1000).toISOString().slice(0, 10);
      const dueDate = dueMs
        ? new Date(dueMs).toISOString().slice(0, 10)
        : issueDate;

      // Check existing mapping
      const { data: existing } = await admin
        .from("stripe_invoice_map")
        .select("invoice_id")
        .eq("user_id", user.id)
        .eq("stripe_invoice_id", inv.id)
        .maybeSingle();

      if (existing?.invoice_id) {
        // Update existing local invoice
        const { error: updErr } = await admin
          .from("invoices")
          .update({
            client_name: clientName,
            client_email: clientEmail,
            amount: (inv.amount_remaining ?? inv.amount_due) / 100,
            currency: inv.currency.toUpperCase(),
            due_date: dueDate,
            status: localStatus,
            payment_link: inv.hosted_invoice_url,
          })
          .eq("id", existing.invoice_id)
          .eq("user_id", user.id);
        if (!updErr) {
          updated++;
          await admin
            .from("stripe_invoice_map")
            .update({ last_synced_at: new Date().toISOString() })
            .eq("user_id", user.id)
            .eq("stripe_invoice_id", inv.id);
        }
        continue;
      }

      // Enforce plan limit before insert
      if (planLimit !== -1 && currentActive >= planLimit) {
        skippedDueToLimit++;
        continue;
      }

      const invoiceNumber = inv.number ?? `STRIPE-${inv.id.slice(-8).toUpperCase()}`;

      const { data: inserted, error: insErr } = await admin
        .from("invoices")
        .insert({
          user_id: user.id,
          client_name: clientName,
          client_email: clientEmail,
          invoice_number: invoiceNumber,
          amount: (inv.amount_remaining ?? inv.amount_due) / 100,
          currency: inv.currency.toUpperCase(),
          issue_date: issueDate,
          due_date: dueDate,
          status: localStatus,
          payment_link: inv.hosted_invoice_url,
          source: "stripe",
        })
        .select("id")
        .single();

      if (insErr || !inserted) {
        // Likely hit the trigger limit
        if ((insErr as any)?.code === "23514") {
          skippedDueToLimit++;
          continue;
        }
        console.error("insert invoice failed", insErr);
        continue;
      }

      await admin.from("stripe_invoice_map").insert({
        user_id: user.id,
        invoice_id: inserted.id,
        stripe_invoice_id: inv.id,
        stripe_account_id: conn.stripe_account_id,
      });

      imported++;
      currentActive++;
    }

    const totalSynced = imported + updated;
    await admin
      .from("stripe_connections")
      .update({
        last_sync_at: new Date().toISOString(),
        last_sync_status: "ok",
        last_sync_error: null,
        invoices_synced_count: (conn.invoices_synced_count ?? 0) + imported,
      })
      .eq("user_id", user.id);

    return json({
      ok: true,
      fetched: collected.length,
      imported,
      updated,
      skippedDueToLimit,
      totalSynced,
    });
  } catch (e) {
    console.error("sync-stripe-invoices error", e);
    return json({ error: "Unexpected error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

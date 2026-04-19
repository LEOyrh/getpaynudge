// Validates a user-provided Stripe restricted API key, then encrypts and stores it.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const encSecret = Deno.env.get("STRIPE_KEY_ENCRYPTION_SECRET");
    if (!encSecret) {
      return json({ error: "Server not configured: missing encryption secret" }, 500);
    }

    // Auth: verify caller
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) return json({ error: "Unauthorized" }, 401);

    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userRes, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userRes.user) return json({ error: "Unauthorized" }, 401);
    const user = userRes.user;

    const body = await req.json().catch(() => ({}));
    const apiKey = String(body?.apiKey ?? "").trim();
    if (!apiKey || !/^(rk|sk)_(live|test)_[A-Za-z0-9]+/.test(apiKey)) {
      return json({ error: "Please paste a valid Stripe key (starts with rk_ or sk_)" }, 400);
    }

    // Validate against Stripe by calling /v1/account
    const acctRes = await fetch("https://api.stripe.com/v1/account", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!acctRes.ok) {
      const errBody = await acctRes.json().catch(() => ({}));
      return json(
        { error: errBody?.error?.message ?? "Invalid Stripe key" },
        400,
      );
    }
    const acct = await acctRes.json();

    // Confirm we can read invoices (permission check)
    const probe = await fetch("https://api.stripe.com/v1/invoices?limit=1", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!probe.ok) {
      return json(
        { error: "This key doesn't have permission to read Invoices. Add 'Invoices: Read' on your restricted key." },
        400,
      );
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // Encrypt the key via DB function
    const { data: encrypted, error: encErr } = await admin.rpc("encrypt_stripe_key", {
      _plaintext: apiKey,
      _secret: encSecret,
    });
    if (encErr || !encrypted) {
      console.error("encrypt failed", encErr);
      return json({ error: "Failed to secure key" }, 500);
    }

    const last4 = apiKey.slice(-4);
    const accountName: string =
      acct?.business_profile?.name ?? acct?.settings?.dashboard?.display_name ?? acct?.email ?? acct?.id;

    // Upsert connection
    const { error: upErr } = await admin
      .from("stripe_connections")
      .upsert(
        {
          user_id: user.id,
          encrypted_api_key: encrypted,
          api_key_last4: last4,
          stripe_account_id: acct.id,
          stripe_account_email: acct.email ?? null,
          stripe_account_name: accountName ?? null,
          last_sync_status: null,
          last_sync_error: null,
        },
        { onConflict: "user_id" },
      );
    if (upErr) {
      console.error("upsert failed", upErr);
      return json({ error: "Failed to save connection" }, 500);
    }

    return json({
      ok: true,
      account: {
        id: acct.id,
        email: acct.email,
        name: accountName,
        last4,
      },
    });
  } catch (e) {
    console.error("connect-stripe error", e);
    return json({ error: "Unexpected error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const HOST = "getpaynudge.com";
const KEY = "4fe07780644e47d2b82d48fc5258fc7e";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

const ALL_URLS = [
  "https://getpaynudge.com/",
  "https://getpaynudge.com/how-it-works",
  "https://getpaynudge.com/pricing",
  "https://getpaynudge.com/compare",
  "https://getpaynudge.com/faq",
  "https://getpaynudge.com/help",
  "https://getpaynudge.com/contact",
  "https://getpaynudge.com/privacy",
  "https://getpaynudge.com/terms",
  "https://getpaynudge.com/templates",
  "https://getpaynudge.com/templates/past-due-invoice-email-template",
  "https://getpaynudge.com/templates/polite-payment-reminder-email",
  "https://getpaynudge.com/templates/final-invoice-reminder-template",
  "https://getpaynudge.com/templates/how-to-follow-up-on-unpaid-invoice",
  "https://getpaynudge.com/templates/late-payment-policy-template",
  "https://getpaynudge.com/templates/reminder-schedule-for-overdue-invoices",
  "https://getpaynudge.com/templates/invoice-follow-up-tips-for-freelancers",
  "https://getpaynudge.com/templates/small-business-late-payment-workflow",
];

const log = (step: string, details?: unknown) => {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[SUBMIT-INDEXNOW] ${step}${d}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    log("Function started", { method: req.method });

    let urlList: string[] = ALL_URLS;

    // Allow POST body to override URL list (for one-off submissions)
    if (req.method === "POST") {
      try {
        const body = await req.json();
        if (Array.isArray(body?.urls) && body.urls.length > 0) {
          // Validate every URL belongs to our host
          const valid = body.urls.filter(
            (u: unknown) =>
              typeof u === "string" && u.startsWith(`https://${HOST}/`)
          );
          if (valid.length !== body.urls.length) {
            return new Response(
              JSON.stringify({ error: `All URLs must start with https://${HOST}/` }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
            );
          }
          urlList = valid;
        }
      } catch {
        // No body or invalid JSON → fall back to ALL_URLS
      }
    }

    log("Submitting URLs", { count: urlList.length });

    const indexNowRes = await fetch("https://api.indexnow.org/IndexNow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: HOST,
        key: KEY,
        keyLocation: KEY_LOCATION,
        urlList,
      }),
    });

    const text = await indexNowRes.text();
    log("IndexNow responded", { status: indexNowRes.status, body: text.slice(0, 200) });

    return new Response(
      JSON.stringify({
        success: indexNowRes.ok,
        status: indexNowRes.status,
        submitted: urlList.length,
        urls: urlList,
        indexNowResponse: text || null,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: indexNowRes.ok ? 200 : indexNowRes.status,
      }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log("ERROR", { message: msg });
    return new Response(
      JSON.stringify({ error: "Failed to submit URLs to IndexNow" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

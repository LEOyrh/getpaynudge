// Voice trainer: extract a tone profile from sample emails OR render a reminder in that voice.
// Uses Lovable AI Gateway via tool-calling for structured output.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";

const AnalyzeBody = z.object({
  action: z.literal("analyze"),
  samples: z.array(z.string().trim().min(20).max(4000)).min(1).max(5),
});

const RenderBody = z.object({
  action: z.literal("render"),
  stage: z.enum(["heads_up", "due", "gentle", "firm", "final"]),
  variables: z.object({
    client_name: z.string().min(1).max(120),
    invoice_number: z.string().min(1).max(60),
    amount: z.string().min(1).max(40), // pre-formatted "$1,200.00"
    due_date: z.string().min(1).max(40), // pre-formatted "Mar 24, 2026"
    days_offset: z.number().int(),
    sender_name: z.string().min(1).max(120).optional(),
    payment_link: z.string().url().max(500).optional(),
  }),
});

const Body = z.union([AnalyzeBody, RenderBody]);

const TONE_TOOL = {
  type: "function" as const,
  function: {
    name: "save_tone_profile",
    description: "Save the extracted writing-tone profile.",
    parameters: {
      type: "object",
      properties: {
        formality: { type: "string", enum: ["casual", "warm", "neutral", "formal"] },
        warmth: { type: "string", enum: ["cool", "neutral", "warm"] },
        directness: { type: "string", enum: ["soft", "balanced", "direct"] },
        greeting_style: { type: "string", description: "How they typically open (e.g., 'Hey {name},')." },
        signoff_style: { type: "string", description: "How they typically close (e.g., 'Thanks!')." },
        signature_phrases: {
          type: "array",
          items: { type: "string" },
          description: "2-5 short phrases or words this writer uses repeatedly.",
        },
        avg_sentence_length: { type: "string", enum: ["short", "medium", "long"] },
        emoji_usage: { type: "string", enum: ["never", "rare", "occasional", "frequent"] },
        contractions: { type: "boolean", description: "Do they use contractions like 'I'm' / 'you're'." },
        summary: { type: "string", description: "One-sentence summary of the writer's voice." },
      },
      required: [
        "formality", "warmth", "directness", "greeting_style", "signoff_style",
        "signature_phrases", "avg_sentence_length", "emoji_usage", "contractions", "summary",
      ],
      additionalProperties: false,
    },
  },
};

const REMINDER_TOOL = {
  type: "function" as const,
  function: {
    name: "save_reminder",
    description: "Save the reminder email written in the user's voice.",
    parameters: {
      type: "object",
      properties: {
        subject: { type: "string", description: "Email subject line." },
        body: { type: "string", description: "Plain-text email body, no HTML, no markdown headings." },
      },
      required: ["subject", "body"],
      additionalProperties: false,
    },
  },
};

const STAGE_BRIEF: Record<string, string> = {
  heads_up: "Friendly heads-up, sent ~3 days BEFORE due date. Light touch, just a polite reminder.",
  due: "Polite reminder sent ON the due date. Neutral, helpful.",
  gentle: "Gentle follow-up sent ~3 days AFTER due date. Still polite, no pressure.",
  firm: "Firm reminder sent ~7 days AFTER due date. Direct but professional, request prompt action.",
  final: "Final notice sent ~14 days AFTER due date. Clear about next steps, still professional.",
};

async function callGateway(messages: any[], tool: any) {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      tools: [tool],
      tool_choice: { type: "function", function: { name: tool.function.name } },
    }),
  });

  if (res.status === 429) {
    return { _err: { status: 429, msg: "Rate limit hit. Please try again in a moment." } };
  }
  if (res.status === 402) {
    return { _err: { status: 402, msg: "AI credits exhausted. Add credits in Lovable workspace settings." } };
  }
  if (!res.ok) {
    const t = await res.text();
    console.error("Gateway error", res.status, t);
    return { _err: { status: 500, msg: "AI gateway error" } };
  }

  const data = await res.json();
  const call = data?.choices?.[0]?.message?.tool_calls?.[0];
  if (!call?.function?.arguments) {
    console.error("No tool call in response", JSON.stringify(data));
    return { _err: { status: 500, msg: "AI returned no structured output" } };
  }
  try {
    return { result: JSON.parse(call.function.arguments) };
  } catch (e) {
    console.error("Bad JSON in tool call", call.function.arguments);
    return { _err: { status: 500, msg: "AI returned malformed output" } };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (parsed.data.action === "analyze") {
      const numbered = parsed.data.samples
        .map((s, i) => `--- Sample ${i + 1} ---\n${s}`)
        .join("\n\n");

      const messages = [
        {
          role: "system",
          content:
            "You analyze a writer's tone from sample emails they have sent. Be specific, terse, and only call the provided tool. Never include placeholders or fictional names in signature_phrases.",
        },
        {
          role: "user",
          content: `Analyze the writing voice across these emails I have written:\n\n${numbered}`,
        },
      ];
      const out = await callGateway(messages, TONE_TOOL);
      if (out._err) {
        return new Response(JSON.stringify({ error: out._err.msg }), {
          status: out._err.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ tone_profile: out.result }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // RENDER
    // Fetch the user's tone profile (RLS will scope to them)
    const { data: profile } = await supabase
      .from("voice_profiles")
      .select("tone_profile")
      .maybeSingle();

    const tone = profile?.tone_profile;
    const v = parsed.data.variables;
    const stage = parsed.data.stage;

    const toneInstruction = tone
      ? `Writer's voice profile (apply faithfully):\n${JSON.stringify(tone, null, 2)}`
      : "No saved voice profile. Use a warm, professional default.";

    const messages = [
      {
        role: "system",
        content: [
          "You write invoice payment-reminder emails in the user's saved voice.",
          "Strict rules:",
          "- Output ONLY plain text via the tool. No HTML, no markdown, no bullet lists, no bold.",
          "- Keep it under 110 words.",
          "- Reference the actual invoice number, amount, and due date provided.",
          "- Never threaten, never use ALL CAPS, never use legalese.",
          "- If a payment_link is provided, include it on its own line.",
          "- End with the user's typical sign-off + their name (sender_name).",
        ].join("\n"),
      },
      {
        role: "user",
        content: [
          toneInstruction,
          "",
          `Stage: ${stage} — ${STAGE_BRIEF[stage]}`,
          "",
          "Invoice context:",
          `- Client: ${v.client_name}`,
          `- Invoice #: ${v.invoice_number}`,
          `- Amount: ${v.amount}`,
          `- Due date: ${v.due_date}`,
          `- Days offset from due date: ${v.days_offset}`,
          v.sender_name ? `- Sender name: ${v.sender_name}` : "",
          v.payment_link ? `- Payment link: ${v.payment_link}` : "",
          "",
          "Write the reminder now.",
        ]
          .filter(Boolean)
          .join("\n"),
      },
    ];

    const out = await callGateway(messages, REMINDER_TOOL);
    if (out._err) {
      return new Response(JSON.stringify({ error: out._err.msg }), {
        status: out._err.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ reminder: out.result }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("voice-trainer error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

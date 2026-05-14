# AI Voice System

> **This is the salvageable IP.** The rest of PayNudge is fairly generic
> "Stripe + invoices + reminders" infra that any 50 competitors have. The
> Voice Trainer — extracting a writer's tone profile from sample emails and
> rendering future emails in that voice — is the differentiated piece worth
> lifting into other products.

## Concept

A user pastes 1–5 sample emails they've written (any topic, doesn't have to
be invoice-related). An LLM analyzes them and extracts a structured **tone
profile**: formality, warmth, directness, greeting/signoff patterns,
signature phrases, sentence length, emoji usage, contractions, and a
one-sentence voice summary. The tone profile is stored as JSONB in
`voice_profiles.tone_profile`.

Then, when PayNudge needs to send a payment reminder, instead of using a
canned tone template (friendly/professional/firm), it sends the tone profile
+ invoice context to the LLM and asks it to write the reminder in the user's
voice — at the appropriate stage (heads-up before due → final notice 14 days
overdue).

The result is an email that sounds like the user wrote it, not like a SaaS
template, while still hitting all the structural requirements (invoice number,
amount, due date, payment link, sign-off).

## What lives where

| File | Role |
| --- | --- |
| `supabase/migrations/20260419033453_*.sql` | Creates `voice_profiles` table |
| `supabase/functions/voice-trainer/index.ts` | Two actions: `analyze` (extract profile from samples) and `render` (generate reminder in voice). Direct user-facing endpoint. |
| `supabase/functions/process-reminders/index.ts` | The auto-pipeline: when sending a scheduled reminder, fetches the user's tone_profile and renders inline. Falls back to canned template on failure. |
| `supabase/functions/_shared/transactional-email-templates/payment-reminder.tsx` | React Email template with a `voiceBody` branch — when present, renders the AI-written body instead of the canned tone copy. The invoice box + CTA are still rendered for clarity. |
| `src/pages/VoiceTrainer.tsx` (and related components) | UI for pasting samples + viewing extracted profile + previewing rendered emails |

## The provider

At archive time:

- **Endpoint**: `https://ai.gateway.lovable.dev/v1/chat/completions`
- **Model**: `google/gemini-3-flash-preview`
- **API shape**: OpenAI-compatible `/v1/chat/completions` with `tools` +
  `tool_choice` for structured output.
- **Auth**: `Authorization: Bearer ${LOVABLE_API_KEY}`
- **Billing**: included in Lovable workspace AI credits (returns 402 when
  exhausted).

This is a Lovable-proprietary proxy. To reuse this code anywhere else,
swap the URL + model + auth header. Three viable replacements:

1. **Anthropic Claude Haiku 4.5** — `https://api.anthropic.com/v1/messages`,
   model `claude-haiku-4-5`, auth `x-api-key: <ANTHROPIC_API_KEY>` plus
   `anthropic-version: 2023-06-01`. Different tool-calling shape (input_schema
   instead of OpenAI parameters). One vendor account, supports prompt caching.
2. **Google Gemini direct** — `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`,
   different request shape (Google-native), supports function declarations.
   Has a free tier (15 RPM, 1M tokens/day) good for archive-tier traffic.
3. **OpenAI** — `https://api.openai.com/v1/chat/completions`, model `gpt-4o-mini`
   or `gpt-5.5-haiku` etc. Drop-in for the OpenAI-compatible shape — only the
   URL + model + key change.

For PayNudge specifically I recommended Anthropic Claude Haiku 4.5 because
priceaura already uses it (one fewer vendor) and prompt caching is a big
cost win when re-using the same tone profile across many reminders.

## The tone profile schema

Returned by the `analyze` action and stored in `voice_profiles.tone_profile`:

```jsonc
{
  // High-level dimensions
  "formality": "casual" | "warm" | "neutral" | "formal",
  "warmth": "cool" | "neutral" | "warm",
  "directness": "soft" | "balanced" | "direct",

  // Concrete patterns
  "greeting_style": "Hey {name},",            // example only — varies
  "signoff_style": "Thanks!",                 // example only — varies
  "signature_phrases": ["string", ...],       // 2–5 short phrases the writer uses repeatedly

  // Style mechanics
  "avg_sentence_length": "short" | "medium" | "long",
  "emoji_usage": "never" | "rare" | "occasional" | "frequent",
  "contractions": true | false,                // does the writer use I'm / you're

  // The handle for prompts that need a quick read
  "summary": "One-sentence voice summary."
}
```

All fields are required. The `signature_phrases` array is constrained 2–5
items long; the system prompt tells the LLM to never use placeholders or
fictional names there. The schema is enforced via OpenAI tool-calling
(`additionalProperties: false`).

## The 5 reminder stages

Mapped from `(reminder_type, days_offset)` by `reminderToStage()` in
`process-reminders`:

| Stage | When | Tone brief |
| --- | --- | --- |
| `heads_up` | `before_due`, any offset (typically 3 days before) | "Friendly heads-up… Light touch, just a polite reminder." |
| `due` | `on_due`, offset 0 | "Polite reminder sent ON the due date. Neutral, helpful." |
| `gentle` | `after_due`, days_offset < 7 | "Gentle follow-up… Still polite, no pressure." |
| `firm` | `after_due`, 7 ≤ days_offset < 14 | "Firm reminder… Direct but professional, request prompt action." |
| `final` | `after_due`, days_offset ≥ 14 | "Final notice… Clear about next steps, still professional." |

Stage briefs live in `STAGE_BRIEF` in `voice-trainer/index.ts` (the
direct-render endpoint). `process-reminders` doesn't include them inline —
it just passes the `stage` string and lets the prompt convey the difference
implicitly. Both produce coherent output but the explicit briefs give
better stage adherence and would be the right thing to pass through if
re-pointed at a different model.

## Tool definitions

Two tools are defined; only one is forced via `tool_choice` per call.

### `save_tone_profile` (used by `analyze`)

```ts
{
  type: "function",
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
}
```

### `save_reminder` (used by `render`)

```ts
{
  type: "function",
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
}
```

## Prompts (verbatim)

### Analyze prompt

System message:

```
You analyze a writer's tone from sample emails they have sent. Be specific,
terse, and only call the provided tool. Never include placeholders or
fictional names in signature_phrases.
```

User message:

```
Analyze the writing voice across these emails I have written:

--- Sample 1 ---
<text>

--- Sample 2 ---
<text>

...
```

Constraint at the input layer: each sample is z.string().trim().min(20).max(4000),
1–5 samples per request.

### Render prompt (canonical version, from `voice-trainer/index.ts`)

System message:

```
You write invoice payment-reminder emails in the user's saved voice.
Strict rules:
- Output ONLY plain text via the tool. No HTML, no markdown, no bullet lists, no bold.
- Keep it under 110 words.
- Reference the actual invoice number, amount, and due date provided.
- Never threaten, never use ALL CAPS, never use legalese.
- If a payment_link is provided, include it on its own line.
- End with the user's typical sign-off + their name (sender_name).
```

User message:

```
Writer's voice profile (apply faithfully):
<tone_profile JSON pretty-printed>

Stage: <stage> — <STAGE_BRIEF[stage]>

Invoice context:
- Client: <client_name>
- Invoice #: <invoice_number>
- Amount: <amount>          (pre-formatted "$1,200.00")
- Due date: <due_date>      (pre-formatted "Mar 24, 2026")
- Days offset from due date: <days_offset>
- Sender name: <sender_name>     (omitted if not provided)
- Payment link: <payment_link>   (omitted if not provided)

Write the reminder now.
```

The `process-reminders` (auto-pipeline) version is identical except it
omits the explicit `STAGE_BRIEF[stage]` text after the stage label — passes
just `Stage: <stage>` and lets the model infer.

## The render → email rendering pipeline

When `process-reminders` gets back `{ subject, body }` from the gateway, it
passes them to `send-transactional-email` as `templateData.voiceSubject` and
`templateData.voiceBody`.

The React Email template (`payment-reminder.tsx`) checks for `voiceBody`:

```tsx
{voiceBody ? (
  // Voice-rendered: preserve the writer's words. Split on blank lines
  // into paragraphs so the layout still breathes.
  voiceBody.split(/\n{2,}/).map((para, i) => (
    <Text key={i} style={text}>
      {para.split('\n').map((line, j, arr) => (
        <React.Fragment key={j}>
          {line}
          {j < arr.length - 1 ? <br /> : null}
        </React.Fragment>
      ))}
    </Text>
  ))
) : (
  // Canned fallback
  <>
    <Heading style={h1}>{t.greeting(clientName)}</Heading>
    <Text style={text}>{t.body}</Text>
  </>
)}
```

The invoice box (number, amount, due date, business name) and the
payment-link CTA button are always rendered, voice or not. Only the prose
body and the closing line vary.

The subject line is resolved by the template's `subject` resolver:

```ts
subject: (data) => data.voiceSubject || `Payment reminder: Invoice ${data.invoiceNumber || 'due'}`
```

So a voice-rendered email gets the LLM-written subject; otherwise the canned
fallback subject.

## Failure handling

`process-reminders` treats voice as a soft enhancement:

- If `LOVABLE_API_KEY` is unset → skip voice, use canned template.
- If `voice_profiles.tone_profile` is null → skip voice, use canned template.
- If the gateway returns non-2xx → log warning, set `voiceFailed = true`,
  use canned template. Never fail the whole reminder send.
- If the gateway returns 2xx but no parseable tool call args → same as above.

The activity log records which path was taken: `voice`, `standard`, or
`standard (voice fallback)`. So you can monitor the voice success rate
post-hoc by querying invoice_activities.

## Why the design choices

- **Tool-calling for structured output** instead of "respond in JSON":
  guarantees the schema. Even when the LLM hallucinates content, the
  shape is enforced. `additionalProperties: false` rejects extra fields.
- **`tool_choice: { type: "function", function: { name: ... } }`**: forces
  the model to call the tool rather than maybe call it. Rules out the
  "the model just chatted instead of calling the tool" failure mode.
- **`signature_phrases` constrained to 2–5 items, not "as many as you find"**:
  bounded output. Without this the model could pad with low-confidence
  phrases that pollute future renders. The system prompt's "never include
  placeholders or fictional names" is the second guardrail against the same
  failure mode.
- **The render prompt pre-formats `amount` and `due_date` as display strings**:
  removes one whole class of failure (model formatting numbers wrong, getting
  currency symbols wrong, ambiguous date order). The model just inserts the
  string verbatim.
- **`days_offset_signed`** in process-reminders (`-3` for before_due, `+0` for
  on_due, positive for after_due): gives the model a single signed integer
  instead of a (type, magnitude) pair. Cleaner reasoning input.
- **Voice is opt-in by training, not by toggle**: there used to be a
  `voice_enabled BOOLEAN` column on `voice_profiles`; it was added then
  removed in the next migration. Current behavior: if you have a tone profile,
  you're using voice. If you want to disable, delete the row.
- **The canned template still renders the invoice box + CTA when voice is
  used**: the LLM is told to "include the invoice number, amount, and due
  date" but the structured box guarantees the recipient can find them at
  a glance regardless of how the LLM weaves them into the prose.

## Salvage notes (for future projects)

If you want to lift this into a different product:

1. Take the two prompt blocks (analyze, render) and the two tool definitions
   verbatim. They're product-agnostic except for the "invoice payment-reminder"
   framing in the render system message — adjust to your domain.
2. Take the tone profile JSONB schema as your stored representation.
3. Take the 5-stage escalation pattern (heads_up → final) as a reusable
   pattern for any time-decayed nudge sequence (renewal reminders, abandoned
   cart, follow-up after a meeting, etc.).
4. Take the "voice is a soft enhancement, fall back to canned template on
   any failure" pattern. It's the right reliability posture for AI in
   user-visible emails.
5. The React Email template's "voice body OR canned body, but always render
   the structured details" pattern is reusable for any AI-augmented email
   where you want the LLM creativity but not the LLM unreliability on
   factual details.

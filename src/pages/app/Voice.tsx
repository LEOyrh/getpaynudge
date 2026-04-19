import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mic, Sparkles, Wand2, Check, Loader2, Copy, RefreshCcw, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

type ToneProfile = {
  formality: "casual" | "warm" | "neutral" | "formal";
  warmth: "cool" | "neutral" | "warm";
  directness: "soft" | "balanced" | "direct";
  greeting_style: string;
  signoff_style: string;
  signature_phrases: string[];
  avg_sentence_length: "short" | "medium" | "long";
  emoji_usage: "never" | "rare" | "occasional" | "frequent";
  contractions: boolean;
  summary: string;
};

type VoiceProfileRow = {
  id: string;
  user_id: string;
  samples: string[];
  tone_profile: ToneProfile | null;
  analyzed_at: string | null;
  voice_enabled: boolean;
};

const STAGES = [
  { value: "heads_up", label: "Heads-up (−3 days)", offset: -3 },
  { value: "due", label: "Due date", offset: 0 },
  { value: "gentle", label: "Gentle follow-up (+3)", offset: 3 },
  { value: "firm", label: "Firm reminder (+7)", offset: 7 },
  { value: "final", label: "Final notice (+14)", offset: 14 },
] as const;

export default function Voice() {
  usePageMeta({
    title: "AI Voice Trainer · PayNudge",
    description: "Teach PayNudge your voice. Paste 2–3 sample emails and we'll write reminders that sound like you.",
  });
  const { user } = useAuth();
  const qc = useQueryClient();

  const [samples, setSamples] = useState<string[]>(["", "", ""]);
  const [stage, setStage] = useState<(typeof STAGES)[number]["value"]>("gentle");
  const [vars, setVars] = useState({
    client_name: "Acme Co.",
    invoice_number: "INV-218",
    amount: "$1,200.00",
    due_date: "Mar 24, 2026",
    sender_name: "",
    payment_link: "",
  });

  // Fetch existing voice profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["voice-profile", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<VoiceProfileRow | null> => {
      const { data, error } = await supabase
        .from("voice_profiles" as any)
        .select("*")
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as VoiceProfileRow) ?? null;
    },
  });

  // Hydrate sample state once profile loads
  useEffect(() => {
    if (profile?.samples?.length) {
      const padded = [...profile.samples, "", "", ""].slice(0, Math.max(3, profile.samples.length));
      setSamples(padded);
    }
  }, [profile?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch the user's profile for sender_name default
  const { data: userProfile } = useQuery({
    queryKey: ["profile-name", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // Hydrate sender_name from profiles.full_name → user_metadata.full_name (no email-handle fallback)
  useEffect(() => {
    if (vars.sender_name || !user) return;
    const name =
      userProfile?.full_name?.trim() ||
      (user.user_metadata?.full_name as string | undefined)?.trim() ||
      "";
    if (name) setVars((v) => ({ ...v, sender_name: name }));
  }, [user, userProfile?.full_name]); // eslint-disable-line react-hooks/exhaustive-deps

  const filledSamples = samples.map((s) => s.trim()).filter((s) => s.length >= 20);

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      if (filledSamples.length < 1) {
        throw new Error("Add at least one sample (20+ characters).");
      }
      const { data, error } = await supabase.functions.invoke("voice-trainer", {
        body: { action: "analyze", samples: filledSamples },
      });
      if (error) throw error;
      const tone = data?.tone_profile as ToneProfile;

      // Persist samples + tone
      const payload = {
        user_id: user!.id,
        samples: filledSamples,
        tone_profile: tone as any,
        analyzed_at: new Date().toISOString(),
      };
      const { error: upErr } = await supabase
        .from("voice_profiles" as any)
        .upsert(payload, { onConflict: "user_id" });
      if (upErr) throw upErr;
      return tone;
    },
    onSuccess: () => {
      toast.success("Your voice has been learned");
      qc.invalidateQueries({ queryKey: ["voice-profile", user?.id] });
      // Auto-generate a preview right after analyzing
      previewMutation.mutate();
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not analyze samples"),
  });

  const previewMutation = useMutation({
    mutationFn: async () => {
      const offset = STAGES.find((s) => s.value === stage)!.offset;
      const { data, error } = await supabase.functions.invoke("voice-trainer", {
        body: {
          action: "render",
          stage,
          variables: {
            ...vars,
            days_offset: offset,
            payment_link: vars.payment_link || undefined,
          },
        },
      });
      if (error) throw error;
      return data?.reminder as { subject: string; body: string };
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not generate preview"),
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("voice_profiles" as any)
        .delete()
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Voice profile cleared");
      setSamples(["", "", ""]);
      qc.setQueryData(["voice-profile", user?.id], null);
      previewMutation.reset();
    },
  });

  const tone = profile?.tone_profile ?? null;

  const reminder = previewMutation.data;
  const renderedAt = useMemo(
    () => (profile?.analyzed_at ? new Date(profile.analyzed_at) : null),
    [profile?.analyzed_at]
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-primary">
            <Sparkles className="h-3 w-3" />
            New
          </span>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            AI Voice Trainer
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Paste a couple of emails you've actually written. PayNudge learns your voice and writes
            every reminder so it sounds like you — not a robot.
          </p>
        </div>
        {tone && (
          <Badge className="self-start border border-primary/30 bg-primary/15 text-primary hover:bg-primary/15">
            <Check className="mr-1 h-3 w-3" />
            Voice trained
          </Badge>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* LEFT: samples + analyze */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-4 w-4 text-primary" />
              Your sample emails
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">
              2–3 emails works best. Anything you've sent — client updates, project intros, casual
              follow-ups. We only use them to learn your tone.
            </p>
            {samples.map((s, i) => (
              <div key={i} className="space-y-1.5">
                <Label htmlFor={`sample-${i}`} className="text-xs uppercase tracking-wider text-muted-foreground">
                  Sample {i + 1}
                </Label>
                <Textarea
                  id={`sample-${i}`}
                  value={s}
                  onChange={(e) => {
                    const next = [...samples];
                    next[i] = e.target.value;
                    setSamples(next);
                  }}
                  placeholder={
                    i === 0
                      ? "Hey Sarah, just wrapping up the deck — should be in your inbox by EOD..."
                      : "Paste another email you've written..."
                  }
                  rows={5}
                  maxLength={4000}
                  className="resize-y font-sans text-sm"
                />
                <p className="text-[10px] text-muted-foreground/70">
                  {s.trim().length} / 4000
                </p>
              </div>
            ))}

            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                onClick={() => analyzeMutation.mutate()}
                disabled={analyzeMutation.isPending || filledSamples.length === 0}
                className="font-bold uppercase tracking-[0.15em]"
              >
                {analyzeMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    {tone ? "Re-train voice" : "Train my voice"}
                  </>
                )}
              </Button>
              {tone && (
                <Button
                  variant="outline"
                  onClick={() => {
                    if (confirm("Clear your voice profile and samples?")) resetMutation.mutate();
                  }}
                  disabled={resetMutation.isPending}
                  className="uppercase tracking-[0.15em]"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* RIGHT: tone profile + preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Your voice profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profileLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : tone ? (
                <div className="space-y-4">
                  <p className="text-sm italic text-foreground">"{tone.summary}"</p>
                  <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                    <ToneStat label="Formality" value={tone.formality} />
                    <ToneStat label="Warmth" value={tone.warmth} />
                    <ToneStat label="Directness" value={tone.directness} />
                    <ToneStat label="Sentence length" value={tone.avg_sentence_length} />
                    <ToneStat label="Emoji" value={tone.emoji_usage} />
                    <ToneStat label="Contractions" value={tone.contractions ? "yes" : "no"} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      Greeting / Sign-off
                    </p>
                    <p className="text-sm text-foreground">
                      {tone.greeting_style} … {tone.signoff_style}
                    </p>
                  </div>
                  {tone.signature_phrases.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        Signature phrases
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {tone.signature_phrases.map((p) => (
                          <Badge key={p} variant="secondary" className="font-normal">
                            {p}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {renderedAt && (
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
                      Trained {renderedAt.toLocaleDateString()}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No profile yet. Paste your samples on the left and hit{" "}
                  <span className="font-semibold text-foreground">Train my voice</span>.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-primary" />
                Live preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Stage</Label>
                  <Select value={stage} onValueChange={(v) => setStage(v as any)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STAGES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <SmallInput
                  label="Client name"
                  value={vars.client_name}
                  onChange={(v) => setVars({ ...vars, client_name: v })}
                />
                <SmallInput
                  label="Invoice #"
                  value={vars.invoice_number}
                  onChange={(v) => setVars({ ...vars, invoice_number: v })}
                />
                <SmallInput
                  label="Amount"
                  value={vars.amount}
                  onChange={(v) => setVars({ ...vars, amount: v })}
                />
                <SmallInput
                  label="Due date"
                  value={vars.due_date}
                  onChange={(v) => setVars({ ...vars, due_date: v })}
                />
                <SmallInput
                  label="Your name"
                  value={vars.sender_name}
                  onChange={(v) => setVars({ ...vars, sender_name: v })}
                />
                <SmallInput
                  label="Payment link (optional)"
                  value={vars.payment_link}
                  onChange={(v) => setVars({ ...vars, payment_link: v })}
                  placeholder="https://..."
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => previewMutation.mutate()}
                  disabled={previewMutation.isPending}
                  variant="outline"
                  className="uppercase tracking-[0.15em]"
                >
                  {previewMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Drafting
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      {reminder ? "Regenerate" : "Generate preview"}
                    </>
                  )}
                </Button>
                {reminder && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      navigator.clipboard.writeText(`${reminder.subject}\n\n${reminder.body}`);
                      toast.success("Copied to clipboard");
                    }}
                    className="uppercase tracking-[0.15em]"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                )}
              </div>

              {reminder ? (
                <div className="space-y-2 rounded-md border border-border bg-muted/30 p-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Subject
                    </p>
                    <p className="font-semibold text-foreground">{reminder.subject}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Body
                    </p>
                    <pre className="mt-1 whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                      {reminder.body}
                    </pre>
                  </div>
                </div>
              ) : (
                <p className="rounded-md border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                  {tone
                    ? "Hit Generate to see a reminder written in your voice."
                    : "Train your voice first, then preview a reminder here."}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ToneStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-semibold capitalize text-foreground">{value}</p>
    </div>
  );
}

function SmallInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      <Input
        className="mt-1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={500}
      />
    </div>
  );
}

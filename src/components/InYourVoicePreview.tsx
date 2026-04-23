import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Sparkles, Wand2, RefreshCcw, Lock } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

const STAGES = [
  { value: "heads_up", short: "−3d", label: "Heads-up", offset: -3 },
  { value: "due", short: "Due", label: "Due date", offset: 0 },
  { value: "gentle", short: "+3d", label: "Gentle", offset: 3 },
  { value: "firm", short: "+7d", label: "Firm", offset: 7 },
  { value: "final", short: "+14d", label: "Final notice", offset: 14 },
] as const;

type StageValue = (typeof STAGES)[number]["value"];

export interface InYourVoicePreviewProps {
  /** Pre-formatted variables to render into the preview. */
  clientName: string;
  invoiceNumber: string;
  /** Numeric amount; will be formatted as currency. */
  amount: number;
  currency: string;
  /** ISO date or yyyy-MM-dd string. */
  dueDate: string;
  paymentLink?: string | null;
  /** When provided, the section is hidden if the user has no trained voice profile. */
  hideWhenUntrained?: boolean;
}

function formatAmount(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

/**
 * "In your voice" preview — renders all 5 reminder stages using the user's
 * trained voice profile. Calls the voice-trainer edge function lazily when the
 * user expands a stage so we never spend AI credits unprompted.
 */
export function InYourVoicePreview({
  clientName,
  invoiceNumber,
  amount,
  currency,
  dueDate,
  paymentLink,
  hideWhenUntrained = false,
}: InYourVoicePreviewProps) {
  const { user } = useAuth();
  const [activeStage, setActiveStage] = useState<StageValue>("gentle");
  // Persist generated previews per stage so switching tabs doesn't re-spend credits.
  const [previews, setPreviews] = useState<
    Partial<Record<StageValue, { subject: string; body: string }>>
  >({});
  const [loading, setLoading] = useState<StageValue | null>(null);
  const [errorByStage, setErrorByStage] = useState<Partial<Record<StageValue, string>>>({});

  // Check if the user has a trained voice profile (gates the whole UI).
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["voice-profile-trained-flag", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("voice_profiles" as any)
        .select("id, tone_profile, analyzed_at")
        .maybeSingle();
      if (error) throw error;
      return data as { id: string; tone_profile: unknown; analyzed_at: string | null } | null;
    },
  });

  const isTrained = !!profile?.tone_profile;
  const formattedAmount = formatAmount(amount, currency);
  const formattedDue = (() => {
    try {
      return format(new Date(dueDate), "MMMM d, yyyy");
    } catch {
      return dueDate;
    }
  })();

  const generate = async (stage: StageValue) => {
    if (!isTrained) return;
    setLoading(stage);
    setErrorByStage((e) => ({ ...e, [stage]: undefined }));
    try {
      const offset = STAGES.find((s) => s.value === stage)!.offset;
      const { data, error } = await supabase.functions.invoke("voice-trainer", {
        body: {
          action: "render",
          stage,
          variables: {
            client_name: clientName,
            invoice_number: invoiceNumber,
            amount: formattedAmount,
            due_date: formattedDue,
            days_offset: offset,
            payment_link: paymentLink || undefined,
          },
        },
      });
      if (error) throw error;
      const reminder = data?.reminder as { subject: string; body: string } | undefined;
      if (!reminder) throw new Error("No preview returned");
      setPreviews((p) => ({ ...p, [stage]: reminder }));
    } catch (err: any) {
      setErrorByStage((e) => ({
        ...e,
        [stage]: err?.message ?? "Could not generate preview",
      }));
    } finally {
      setLoading(null);
    }
  };

  // Hide entirely when untrained and parent opted out of upsell card.
  if (hideWhenUntrained && !profileLoading && !isTrained) return null;

  return (
    <Card className="border-primary/30 bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" />
          In your voice
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Preview every reminder stage rendered in your trained voice before any send.
        </p>
      </CardHeader>
      <CardContent>
        {profileLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : !isTrained ? (
          <div className="flex flex-col items-start gap-3 rounded-md border border-dashed border-border bg-muted/30 p-4">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">
                Train your voice to unlock this preview
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Paste 2–3 emails you've sent. PayNudge learns your tone and writes every reminder
              in your style.
            </p>
            <Button asChild size="sm" className="uppercase tracking-[0.15em]">
              <Link to="/voice">
                <Wand2 className="mr-1.5 h-3.5 w-3.5" />
                Train my voice
              </Link>
            </Button>
          </div>
        ) : (
          <Tabs value={activeStage} onValueChange={(v) => setActiveStage(v as StageValue)}>
            <TabsList className="grid w-full grid-cols-5">
              {STAGES.map((s) => (
                <TabsTrigger key={s.value} value={s.value} className="text-[10px] sm:text-xs">
                  <span className="hidden sm:inline">{s.label}</span>
                  <span className="sm:hidden">{s.short}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            {STAGES.map((s) => {
              const preview = previews[s.value];
              const isLoading = loading === s.value;
              const err = errorByStage[s.value];
              return (
                <TabsContent key={s.value} value={s.value} className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className="border-primary/40 bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider"
                    >
                      <Sparkles className="mr-0.5 h-2.5 w-2.5" />
                      {s.label}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generate(s.value)}
                      disabled={isLoading}
                      className="h-8 text-xs uppercase tracking-[0.15em]"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                          Drafting
                        </>
                      ) : preview ? (
                        <>
                          <RefreshCcw className="mr-1.5 h-3 w-3" />
                          Regenerate
                        </>
                      ) : (
                        <>
                          <Wand2 className="mr-1.5 h-3 w-3" />
                          Generate
                        </>
                      )}
                    </Button>
                  </div>

                  {err && (
                    <p className="rounded-md border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive">
                      {err}
                    </p>
                  )}

                  {preview ? (
                    <div className="space-y-2 rounded-md border border-border bg-background p-4">
                      <div className="border-b border-border pb-2">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
                          Subject
                        </p>
                        <p className="mt-0.5 font-mono text-sm text-foreground">
                          {preview.subject}
                        </p>
                      </div>
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                        {preview.body}
                      </pre>
                    </div>
                  ) : !isLoading ? (
                    <p className="rounded-md border border-dashed border-border bg-muted/20 p-4 text-xs text-muted-foreground">
                      Click <span className="font-semibold text-foreground">Generate</span> to
                      draft this stage in your voice. Each preview uses a small amount of AI
                      credit.
                    </p>
                  ) : (
                    <Skeleton className="h-24 w-full" />
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}

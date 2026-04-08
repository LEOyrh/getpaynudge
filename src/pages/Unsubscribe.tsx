import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { brand } from "@/config/brand";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2, MailX } from "lucide-react";

type Status = "loading" | "valid" | "already" | "invalid" | "success" | "error";

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<Status>("loading");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    fetch(`${supabaseUrl}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`, {
      headers: { apikey: anonKey },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.valid === false && data.reason === "already_unsubscribed") {
          setStatus("already");
        } else if (data.valid) {
          setStatus("valid");
        } else {
          setStatus("invalid");
        }
      })
      .catch(() => setStatus("invalid"));
  }, [token]);

  const handleConfirm = async () => {
    if (!token) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });
      if (error) throw error;
      if (data?.success) {
        setStatus("success");
      } else if (data?.reason === "already_unsubscribed") {
        setStatus("already");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 pt-8 pb-8 text-center">
          {status === "loading" && (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground">Verifying…</p>
            </>
          )}

          {status === "valid" && (
            <>
              <MailX className="h-10 w-10 text-primary" />
              <h1 className="font-heading text-xl font-bold text-foreground">Unsubscribe</h1>
              <p className="text-muted-foreground">
                Are you sure you want to stop receiving email reminders from {brand.name}?
              </p>
              <Button onClick={handleConfirm} disabled={busy} className="mt-2 w-full max-w-xs">
                {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Confirm Unsubscribe
              </Button>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="h-10 w-10 text-green-600" />
              <h1 className="font-heading text-xl font-bold text-foreground">Unsubscribed</h1>
              <p className="text-muted-foreground">
                You've been successfully unsubscribed. You won't receive any more email reminders.
              </p>
            </>
          )}

          {status === "already" && (
            <>
              <CheckCircle className="h-10 w-10 text-muted-foreground" />
              <h1 className="font-heading text-xl font-bold text-foreground">Already Unsubscribed</h1>
              <p className="text-muted-foreground">
                This email address has already been unsubscribed.
              </p>
            </>
          )}

          {status === "invalid" && (
            <>
              <XCircle className="h-10 w-10 text-destructive" />
              <h1 className="font-heading text-xl font-bold text-foreground">Invalid Link</h1>
              <p className="text-muted-foreground">
                This unsubscribe link is invalid or has expired.
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="h-10 w-10 text-destructive" />
              <h1 className="font-heading text-xl font-bold text-foreground">Something Went Wrong</h1>
              <p className="text-muted-foreground">
                We couldn't process your request. Please try again later.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

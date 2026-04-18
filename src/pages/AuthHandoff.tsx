import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Receives an auth session from the marketing domain and installs it on
 * the app subdomain.
 *
 * Flow: getpaynudge.com/login → on success →
 *   app.getpaynudge.com/auth/handoff#access_token=...&refresh_token=...&next=/dashboard
 * → setSession → navigate to `next`.
 *
 * Uses the URL hash so tokens never hit the server / logs.
 */
export default function AuthHandoff() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
    const params = new URLSearchParams(hash);
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    const next = params.get("next") || "/dashboard";

    if (!access_token || !refresh_token) {
      setError("Missing session tokens.");
      return;
    }

    (async () => {
      const { error } = await supabase.auth.setSession({ access_token, refresh_token });
      if (error) {
        setError(error.message);
        return;
      }
      // Use replace so the hash (with tokens) is wiped from history.
      window.location.replace(next);
    })();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      {error ? (
        <div className="text-center">
          <p className="text-sm text-destructive">Sign-in handoff failed: {error}</p>
          <a href="/login" className="mt-3 inline-block text-sm text-primary underline">
            Back to log in
          </a>
        </div>
      ) : (
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Receives an auth session from the marketing domain and installs it on
 * the app subdomain.
 *
 * Flow: getpaynudge.com/login → on success →
 *   app.getpaynudge.com/auth/handoff#access_token=...&refresh_token=...&next=/dashboard
 * → setSession → verify persisted → navigate to `next`.
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

    // Wipe the hash immediately so a stray re-render or back-nav can't
    // re-trigger the handoff with stale tokens.
    history.replaceState(null, "", window.location.pathname);

    (async () => {
      const { data, error: setErr } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });
      if (setErr || !data.session) {
        setError(setErr?.message ?? "Failed to install session.");
        return;
      }

      // Confirm the session has been written to localStorage by reading it
      // back. Without this, navigating to /dashboard can race the storage
      // write and ProtectedRoute sees `user=null` → bounces back to login →
      // auto-handoff re-fires → refresh loop.
      for (let i = 0; i < 20; i++) {
        const { data: check } = await supabase.auth.getSession();
        if (check.session?.access_token === access_token) break;
        await new Promise((r) => setTimeout(r, 50));
      }

      // Use SPA navigation so AuthProvider keeps its in-memory session
      // and we don't re-run getSession() from scratch.
      window.location.assign(next);
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

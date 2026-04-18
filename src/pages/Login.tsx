import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useAuth } from "@/contexts/AuthContext";
import { brand, isLocalDev } from "@/config/brand";
import { toast } from "sonner";
import Turnstile from "@/components/Turnstile";
import { supabase } from "@/integrations/supabase/client";

export default function Login() {
  usePageMeta({
    title: "Log In",
    description: `Log in to your ${brand.name} account.`,
  });

  const { signIn, session } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // If the user already has a session on this domain (e.g. ProtectedRoute on
  // the app subdomain bounced them here), hand the session off immediately
  // instead of forcing a re-login. Guarded by sessionStorage so a broken
  // handoff can't trigger an infinite refresh loop between the two domains.
  useEffect(() => {
    if (!session?.access_token || !session?.refresh_token) return;
    const returnTo = searchParams.get("returnTo") || "/dashboard";
    if (isLocalDev()) {
      navigate(returnTo, { replace: true });
      return;
    }
    const guardKey = "pn_handoff_attempted";
    if (sessionStorage.getItem(guardKey)) {
      // Already tried once this tab session — don't loop. The user can click
      // "Log in" manually to retry.
      return;
    }
    sessionStorage.setItem(guardKey, "1");
    const params = new URLSearchParams({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      next: returnTo,
    });
    window.location.replace(`${brand.appUrl}/auth/handoff#${params.toString()}`);
  }, [session, searchParams, navigate]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (brand.turnstileSiteKey && !turnstileToken) {
      toast.error("Please complete the security check.");
      return;
    }

    setLoading(true);

    if (brand.turnstileSiteKey && turnstileToken) {
      const { data } = await supabase.functions.invoke("verify-turnstile", {
        body: { token: turnstileToken },
      });
      if (!data?.success) {
        toast.error("Security verification failed. Please try again.");
        setLoading(false);
        return;
      }
    }

    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      // After successful login, redirect to app subdomain
      const returnTo = searchParams.get("returnTo") || "/dashboard";
      sessionStorage.removeItem("pn_handoff_attempted");
      if (isLocalDev()) {
        navigate(returnTo);
      } else {
        // Pass session tokens via URL hash so the app subdomain can install
        // them in its own localStorage (Supabase storage is per-origin).
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token && session?.refresh_token) {
          const params = new URLSearchParams({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            next: returnTo,
          });
          window.location.href = `${brand.appUrl}/auth/handoff#${params.toString()}`;
        } else {
          window.location.href = `${brand.appUrl}${returnTo}`;
        }
      }
    }
  };

  return (
    <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <div className="w-full max-w-md px-4">
        <div className="mb-10 text-center">
          <Link to="/" className="inline-flex items-baseline gap-0.5">
            <span className="font-heading text-2xl font-extrabold tracking-tightest text-foreground">
              {brand.name}
            </span>
            <span className="h-1.5 w-1.5 translate-y-[-1px] bg-primary" aria-hidden />
          </Link>
          <h1 className="mt-8 text-display text-3xl text-foreground md:text-4xl">
            Welcome back
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Log in to your {brand.name} account
          </p>
        </div>

        <Card className="border-border">
          <CardContent className="pt-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              {brand.turnstileSiteKey && (
                <Turnstile
                  siteKey={brand.turnstileSiteKey}
                  onVerify={setTurnstileToken}
                  onExpire={() => setTurnstileToken(null)}
                  className="flex justify-center"
                />
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in…" : "Log in"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="font-medium text-primary hover:underline">
            Sign up free
          </Link>
        </p>
      </div>
    </section>
  );
}

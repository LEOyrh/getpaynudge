import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { usePageMeta } from "@/hooks/usePageMeta";
import { supabase } from "@/integrations/supabase/client";
import { brand, isLocalDev } from "@/config/brand";
import { toast } from "sonner";

export default function ResetPassword() {
  usePageMeta({ title: "Set New Password" });
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setReady(true);
    } else {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) setReady(true);
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully");
      if (isLocalDev()) {
        navigate("/dashboard");
      } else {
        window.location.href = `${brand.appUrl}/dashboard`;
      }
    }
  };

  if (!ready) {
    return (
      <section className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Invalid or expired reset link.</p>
          <Button variant="ghost" className="mt-4" asChild>
            <Link to="/forgot-password">Request a new one</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="flex min-h-screen items-center justify-center py-12">
      <div className="w-full max-w-md px-4">
        <div className="mb-10 text-center">
          <h1 className="text-display text-3xl text-foreground md:text-4xl">Set new password</h1>
          <p className="mt-3 text-sm text-muted-foreground">Choose a strong password for your account.</p>
        </div>
        <Card className="border-border">
          <CardContent className="pt-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">New Password</label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="At least 8 characters"
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Updating…" : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

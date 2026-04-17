import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useAuth } from "@/contexts/AuthContext";
import { brand } from "@/config/brand";
import { toast } from "sonner";

export default function ForgotPassword() {
  usePageMeta({ title: "Forgot Password" });
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <section className="flex min-h-screen items-center justify-center py-12">
      <div className="w-full max-w-md px-4">
        <div className="mb-10 text-center">
          <Link to="/" className="inline-flex items-baseline gap-0.5">
            <span className="font-heading text-2xl font-extrabold tracking-tightest text-foreground">
              {brand.name}
            </span>
            <span className="h-1.5 w-1.5 translate-y-[-1px] bg-primary" aria-hidden />
          </Link>
          <h1 className="mt-8 text-display text-3xl text-foreground md:text-4xl">Reset your password</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            We'll send you a link to reset your password.
          </p>
        </div>

        <Card className="border-border">
          <CardContent className="pt-6 pb-6">
            {sent ? (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Check your email for a password reset link.</p>
                <Button variant="ghost" className="mt-4" asChild>
                  <Link to="/login">Back to login</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
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
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending…" : "Send Reset Link"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">Log in</Link>
        </p>
      </div>
    </section>
  );
}

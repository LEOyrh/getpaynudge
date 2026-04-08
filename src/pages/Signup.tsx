import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useAuth } from "@/contexts/AuthContext";
import { brand } from "@/config/brand";
import { toast } from "sonner";

export default function Signup() {
  usePageMeta({
    title: "Sign Up",
    description: `Create your free ${brand.name} account. Start sending automated invoice reminders in under 60 seconds.`,
  });

  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp(email, password, name);
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Check your email to confirm your account!");
      navigate("/login");
    }
  };

  return (
    <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <div className="w-full max-w-md px-4">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <span className="text-lg font-bold text-primary-foreground">P</span>
            </div>
          </Link>
          <h1 className="mt-4 font-heading text-2xl font-bold text-foreground">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Start sending automated invoice reminders — free
          </p>
        </div>

        <Card className="border-border">
          <CardContent className="pt-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">
                  Full name
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Jane Smith"
                  autoComplete="name"
                />
              </div>
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
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">
                  Password
                </label>
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
                {loading ? "Creating account…" : "Create Free Account"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                By signing up, you agree to our{" "}
                <Link to="/terms" className="text-primary hover:underline">Terms</Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
              </p>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </section>
  );
}

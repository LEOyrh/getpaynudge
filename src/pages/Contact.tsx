import { useState } from "react";
import { Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { usePageMeta } from "@/hooks/usePageMeta";
import { brand } from "@/config/brand";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Turnstile from "@/components/Turnstile";

export default function Contact() {
  usePageMeta({
    title: "Contact",
    description: `Get in touch with the ${brand.name} team. We'd love to hear from you.`,
  });

  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);

    const formData = new FormData(e.currentTarget);
    const name = (formData.get("name") as string).trim();
    const email = (formData.get("email") as string).trim();
    const message = (formData.get("message") as string).trim();

    if (!name || !email || !message) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      setSending(false);
      return;
    }

    if (brand.turnstileSiteKey && !turnstileToken) {
      toast({ title: "Please complete the security check", variant: "destructive" });
      setSending(false);
      return;
    }

    // Verify turnstile token server-side
    if (brand.turnstileSiteKey && turnstileToken) {
      const { data } = await supabase.functions.invoke("verify-turnstile", {
        body: { token: turnstileToken },
      });
      if (!data?.success) {
        toast({ title: "Security verification failed", description: "Please try again.", variant: "destructive" });
        setSending(false);
        return;
      }
    }

    try {
      const id = crypto.randomUUID();
      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "contact-form-notification",
          recipientEmail: email,
          idempotencyKey: `contact-${id}`,
          templateData: { name, email, message },
        },
      });

      toast({
        title: "Message sent",
        description: "We'll get back to you as soon as possible.",
      });
      (e.target as HTMLFormElement).reset();
      setTurnstileToken(null);
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again or email us directly.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Get in touch
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Have a question, feedback, or need help? We're here.
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-4xl gap-8 md:grid-cols-5">
            <div className="md:col-span-2">
              <div className="space-y-6">
                <Card className="border-border">
                  <CardContent className="pt-6 pb-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                        <Mail className="h-5 w-5 text-accent-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Email</p>
                        <a
                          href={`mailto:${brand.supportEmail}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {brand.supportEmail}
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border">
                  <CardContent className="pt-6 pb-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                        <MessageSquare className="h-5 w-5 text-accent-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Response time</p>
                        <p className="text-sm text-muted-foreground">Usually within 24 hours</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card className="border-border md:col-span-3">
              <CardContent className="pt-6 pb-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">
                      Name
                    </label>
                    <Input id="name" name="name" required placeholder="Your name" maxLength={100} />
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
                      Email
                    </label>
                    <Input id="email" name="email" type="email" required placeholder="you@example.com" maxLength={255} />
                  </div>
                  <div>
                    <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-foreground">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      placeholder="How can we help?"
                      maxLength={2000}
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
                  <Button type="submit" className="w-full" disabled={sending}>
                    {sending ? "Sending…" : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}

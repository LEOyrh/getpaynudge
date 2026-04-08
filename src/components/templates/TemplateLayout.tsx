import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageMeta } from "@/hooks/usePageMeta";
import { brand } from "@/config/brand";

interface TemplateLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  relatedLinks?: { title: string; slug: string }[];
}

export default function TemplateLayout({ title, description, children, relatedLinks }: TemplateLayoutProps) {
  usePageMeta({ title, description });

  return (
    <>
      <section className="py-16 md:py-24">
        <div className="container">
          <article className="mx-auto max-w-3xl">
            <div className="mb-4">
              <Link to="/templates" className="text-sm text-primary hover:underline">
                ← Back to Templates
              </Link>
            </div>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {title}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">{description}</p>

            <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
              {children}
            </div>

            {relatedLinks && relatedLinks.length > 0 && (
              <div className="mt-12 border-t border-border pt-8">
                <h3 className="mb-4 font-heading text-lg font-semibold text-foreground">Related Resources</h3>
                <ul className="space-y-2">
                  {relatedLinks.map((link) => (
                    <li key={link.slug}>
                      <Link to={`/templates/${link.slug}`} className="text-primary hover:underline">
                        {link.title} →
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </article>
        </div>
      </section>

      <section className="border-t border-border bg-secondary/30 py-14">
        <div className="container text-center">
          <h2 className="font-heading text-2xl font-bold text-foreground">
            Skip the manual follow-up
          </h2>
          <p className="mt-3 text-muted-foreground">
            {brand.name} sends polite, automated reminders for you — so you can focus on your work.
          </p>
          <Button size="lg" className="mt-6" asChild>
            <Link to="/signup">
              Try {brand.name} Free <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}

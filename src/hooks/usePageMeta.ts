import { useEffect } from "react";
import { brand, isAppDomain } from "@/config/brand";

interface StructuredData {
  [key: string]: unknown;
}

interface PageMeta {
  title: string;
  description?: string;
  noIndex?: boolean;
  structuredData?: StructuredData | StructuredData[];
}

const noIndexRoutes = new Set([
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/unsubscribe",
]);

const segmentLabels: Record<string, string> = {
  faq: "FAQ",
  "how-it-works": "How It Works",
  pricing: "Pricing",
  contact: "Contact",
  help: "Help",
  privacy: "Privacy Policy",
  terms: "Terms of Service",
  templates: "Templates",
  login: "Log In",
  signup: "Sign Up",
  "forgot-password": "Forgot Password",
  "reset-password": "Reset Password",
  unsubscribe: "Unsubscribe",
  app: "App",
  dashboard: "Dashboard",
  invoices: "Invoices",
  billing: "Billing",
  settings: "Settings",
  admin: "Admin",
  finance: "Finance",
  users: "Users",
  logs: "Logs",
};

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let meta = document.querySelector<HTMLMetaElement>(selector);
  if (!meta) {
    meta = document.createElement("meta");
    document.head.appendChild(meta);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    meta?.setAttribute(key, value);
  });
}

function humanizeSegment(segment: string) {
  return (
    segmentLabels[segment] ??
    segment
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

function resolveCanonical(pathname: string) {
  // On the app subdomain, canonical points to app subdomain
  if (isAppDomain()) {
    return new URL(pathname, `${brand.appUrl}/`).toString();
  }
  // App-like paths (in dev) get app subdomain canonical
  const appPaths = ["/dashboard", "/invoices", "/settings", "/billing", "/admin"];
  if (appPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return new URL(pathname, `${brand.appUrl}/`).toString();
  }
  return new URL(pathname, `${brand.url}/`).toString();
}

function buildBreadcrumbSchema(pathname: string) {
  // No breadcrumbs for app pages or noindex pages
  const appPaths = ["/dashboard", "/invoices", "/settings", "/billing", "/admin"];
  if (appPaths.some((p) => pathname === p || pathname.startsWith(p + "/")) || pathname === "/" || noIndexRoutes.has(pathname)) {
    return null;
  }

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  let currentPath = "";
  const itemListElement = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: `${brand.url}/`,
    },
  ];

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    itemListElement.push({
      "@type": "ListItem",
      position: index + 2,
      name: humanizeSegment(segment),
      item: new URL(currentPath, `${brand.url}/`).toString(),
    });
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement,
  };
}

export function usePageMeta({ title, description, noIndex, structuredData }: PageMeta) {
  useEffect(() => {
    const pathname = window.location.pathname;
    const fullTitle = title === brand.name ? title : `${title} | ${brand.name}`;
    const canonical = resolveCanonical(pathname);

    // All app routes and the app subdomain should be noindex
    const appPaths = ["/dashboard", "/invoices", "/settings", "/billing", "/admin"];
    const isAppRoute = appPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));
    const shouldNoIndex = noIndex ?? (
      noIndexRoutes.has(pathname) ||
      isAppRoute ||
      isAppDomain()
    );
    const robotsContent = shouldNoIndex ? "noindex, nofollow" : "index, follow";

    document.title = fullTitle;

    if (description) {
      upsertMeta('meta[name="description"]', { name: "description", content: description });
      upsertMeta('meta[property="og:description"]', {
        property: "og:description",
        content: description,
      });
      upsertMeta('meta[name="twitter:description"]', {
        name: "twitter:description",
        content: description,
      });
    }

    upsertMeta('meta[property="og:title"]', { property: "og:title", content: fullTitle });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: fullTitle });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: canonical });
    upsertMeta('meta[name="robots"]', { name: "robots", content: robotsContent });

    const ogImage = `${brand.url}/og-image.png`;
    upsertMeta('meta[property="og:image"]', { property: "og:image", content: ogImage });
    upsertMeta('meta[property="og:image:width"]', { property: "og:image:width", content: "1216" });
    upsertMeta('meta[property="og:image:height"]', { property: "og:image:height", content: "640" });
    upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: ogImage });
    upsertMeta('meta[name="theme-color"]', { name: "theme-color", content: "#0A0A0A" });

    let canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", canonical);

    document.querySelectorAll('script[data-lovable-seo="managed"]').forEach((script) => script.remove());

    const schemas: StructuredData[] = [];
    const breadcrumbSchema = buildBreadcrumbSchema(pathname);
    if (!shouldNoIndex && breadcrumbSchema) schemas.push(breadcrumbSchema);

    if (structuredData) {
      schemas.push(...(Array.isArray(structuredData) ? structuredData : [structuredData]));
    }

    schemas.forEach((schema) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.lovableSeo = "managed";
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });
  }, [title, description, noIndex, structuredData]);
}

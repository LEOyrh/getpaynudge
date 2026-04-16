import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { brand, isAppDomain, isMarketingDomain, isLocalDev } from "@/config/brand";

/**
 * Client-side domain router.
 *
 * Both getpaynudge.com and app.getpaynudge.com serve the same SPA.
 * This component enforces:
 *  - Marketing pages only on getpaynudge.com
 *  - App pages (/app/*) only on app.getpaynudge.com
 *  - Auth pages (/login, /signup, etc.) only on getpaynudge.com
 *
 * On localhost / lovable.app previews it does nothing.
 */

const marketingPaths = new Set([
  "/",
  "/how-it-works",
  "/pricing",
  "/faq",
  "/contact",
  "/help",
  "/privacy",
  "/terms",
]);

function isMarketingPath(pathname: string) {
  return (
    marketingPaths.has(pathname) ||
    pathname.startsWith("/templates")
  );
}

function isAuthPath(pathname: string) {
  return ["/login", "/signup", "/forgot-password", "/reset-password", "/unsubscribe"].some(
    (p) => pathname === p
  );
}

export default function DomainRouter() {
  const location = useLocation();

  useEffect(() => {
    // Skip domain routing in dev/preview
    if (isLocalDev()) return;

    const { pathname, search, hash } = location;

    // On getpaynudge.com: redirect /app/* to app.getpaynudge.com
    if (isMarketingDomain() && pathname.startsWith("/app")) {
      window.location.href = `${brand.appUrl}${pathname}${search}${hash}`;
      return;
    }

    // On app.getpaynudge.com: redirect marketing/auth pages to getpaynudge.com
    if (isAppDomain() && (isMarketingPath(pathname) || isAuthPath(pathname))) {
      window.location.href = `${brand.url}${pathname}${search}${hash}`;
      return;
    }

    // On app.getpaynudge.com: bare root → dashboard
    if (isAppDomain() && pathname === "/") {
      window.location.href = `${brand.appUrl}/app/dashboard`;
      return;
    }
  }, [location]);

  return null;
}

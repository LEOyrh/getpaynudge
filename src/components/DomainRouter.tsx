import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { brand, isAppDomain, isMarketingDomain, isLocalDev } from "@/config/brand";

/**
 * Client-side domain router.
 *
 * Both getpaynudge.com and app.getpaynudge.com serve the same SPA.
 * This component enforces:
 *  - Marketing + auth pages only on getpaynudge.com
 *  - App pages (/dashboard, /invoices, etc.) only on app.getpaynudge.com
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

const authPaths = new Set([
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/unsubscribe",
]);

/** Auth paths that must remain on the app subdomain (e.g. cross-domain handoff). */
const appAuthPaths = new Set(["/auth/handoff"]);

const appPaths = [
  "/dashboard",
  "/invoices",
  "/billing",
  "/settings",
  "/admin",
];

function isMarketingPath(pathname: string) {
  return marketingPaths.has(pathname) || pathname.startsWith("/templates");
}

function isAuthPath(pathname: string) {
  return authPaths.has(pathname);
}

function isAppPath(pathname: string) {
  return appPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export default function DomainRouter() {
  const location = useLocation();

  useEffect(() => {
    if (isLocalDev()) return;

    const { pathname, search, hash } = location;

    // On getpaynudge.com: redirect app paths to app.getpaynudge.com
    if (isMarketingDomain() && isAppPath(pathname)) {
      window.location.href = `${brand.appUrl}${pathname}${search}${hash}`;
      return;
    }

    // On getpaynudge.com: strip legacy /app prefix and redirect
    if (isMarketingDomain() && pathname.startsWith("/app")) {
      const stripped = pathname.replace(/^\/app/, "") || "/dashboard";
      window.location.href = `${brand.appUrl}${stripped}${search}${hash}`;
      return;
    }

    // On app.getpaynudge.com: redirect marketing/auth pages to getpaynudge.com
    // (except cross-domain auth handoff routes that must run here)
    if (
      isAppDomain() &&
      !appAuthPaths.has(pathname) &&
      (isMarketingPath(pathname) || isAuthPath(pathname))
    ) {
      window.location.href = `${brand.url}${pathname}${search}${hash}`;
      return;
    }

    // On app.getpaynudge.com: bare root → dashboard
    if (isAppDomain() && pathname === "/") {
      window.location.href = `${brand.appUrl}/dashboard`;
      return;
    }
  }, [location]);

  return null;
}

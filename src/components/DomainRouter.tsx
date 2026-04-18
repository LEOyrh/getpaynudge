import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { brand, isAppDomain, isMarketingDomain, isLocalDev } from "@/config/brand";

/**
 * Client-side domain router.
 *
 * Intended end-state: marketing on getpaynudge.com, app on app.getpaynudge.com.
 *
 * IMPORTANT: until `app.getpaynudge.com` is independently hosted (DNS + CDN
 * config that resolves to a separate origin), this router runs in
 * **single-domain mode**: both marketing and app routes live on the same
 * origin. The previous split caused an infinite redirect loop because
 * `app.getpaynudge.com` actually serves the SPA from `getpaynudge.com`,
 * so `isAppDomain()` was always false and `/dashboard` was endlessly
 * redirected to itself.
 *
 * To enable cross-domain mode again: deploy the app subdomain as a separate
 * origin (so `window.location.hostname === "app.getpaynudge.com"`), then
 * flip the constant below.
 */
const CROSS_DOMAIN_SPLIT_ENABLED = false;

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
    if (!CROSS_DOMAIN_SPLIT_ENABLED) {
      // Single-domain mode: still strip the legacy /app/* prefix so old
      // bookmarks land on the new flat routes.
      if (location.pathname.startsWith("/app")) {
        const stripped = location.pathname.replace(/^\/app/, "") || "/dashboard";
        window.location.replace(`${stripped}${location.search}${location.hash}`);
      }
      return;
    }

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

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { brand, isLocalDev } from "@/config/brand";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    // Encode the current path so login can redirect back after auth
    const returnTo = encodeURIComponent(location.pathname + location.search);

    if (isLocalDev()) {
      return <Navigate to={`/login?returnTo=${returnTo}`} replace />;
    }

    // Redirect to login on the marketing domain with returnTo
    window.location.href = `${brand.url}/login?returnTo=${returnTo}`;
    return null;
  }

  return <>{children}</>;
}

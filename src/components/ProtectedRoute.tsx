import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    // Redirect to login on the marketing domain
    if (window.location.hostname !== "localhost" && !window.location.hostname.includes("lovable.app")) {
      window.location.href = `https://getpaynudge.com/login`;
      return null;
    }
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

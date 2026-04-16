import { Navigate } from "react-router-dom";
import { useAdminRole } from "@/hooks/useAdminRole";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading } = useAdminRole();

  if (isLoading) {
    return <div className="flex items-center justify-center py-16 text-muted-foreground">Checking access…</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

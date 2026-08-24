import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function ProtectedRoute({
  children,
  requerAdmin = false,
}: {
  children: ReactNode;
  requerAdmin?: boolean;
}) {
  const { usuario, carregando, isAdmin } = useAuth();

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Carregando...
      </div>
    );
  }

  if (!usuario) return <Navigate to="/login" replace />;
  if (requerAdmin && !isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
}

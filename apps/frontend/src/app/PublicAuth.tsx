import { getStoredToken } from "@/lib/auth";
import { Navigate } from "react-router";

export const PublicAuth = ({ children }: { children: React.ReactNode }) => {
  const token = getStoredToken();

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
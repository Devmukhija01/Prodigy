// src/routes/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../../client/src/context/Authcontext";
import {Loader2} from 'lucide-react'

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { token, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

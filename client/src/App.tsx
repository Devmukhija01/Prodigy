import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "../../server/routes/ProtectedRoute";
import { useAuth } from "../../server/context/Authcontext";
import { Routes, Route, Navigate } from "react-router-dom";
import Profile from "./pages/Profile";
function Router() {
  const { token } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register/>}/>
      <Route path="/profile" element={<Profile/>}/>
      {/* Protect the home route */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      {/* Redirect all invalid routes */}
      <Route path="*" element={<Navigate to={token ? "/" : "/login"} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

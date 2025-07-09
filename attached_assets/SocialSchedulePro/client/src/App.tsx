import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Calendar from "@/pages/calendar";
import CreatePost from "@/pages/create-post";
import Templates from "@/pages/templates";
import Analytics from "@/pages/analytics";
import BrandAssets from "@/pages/brand-assets";
import Tasks from "@/pages/tasks";
import Login from "@/pages/login";
import Register from "@/pages/register";
import AppLayout from "@/components/layout/app-layout";

function Router() {
  return (
    <Switch>
      {/* Authentication Routes (No Layout) */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* App Routes (With Layout) */}
      <Route path="/">
        <AppLayout>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/calendar" component={Calendar} />
            <Route path="/create-post" component={CreatePost} />
            <Route path="/templates" component={Templates} />
            <Route path="/tasks" component={Tasks} />
            <Route path="/analytics" component={Analytics} />
            <Route path="/brand-assets" component={BrandAssets} />
            <Route component={NotFound} />
          </Switch>
        </AppLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

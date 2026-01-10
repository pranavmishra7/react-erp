import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/Sidebar";

// Pages
import Dashboard from "@/pages/Dashboard";
import ModuleView from "@/pages/ModuleView";
import FormDesigner from "@/pages/FormDesigner";
import RecordsView from "@/pages/RecordsView";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/modules" component={() => <div className="p-8">Module Management (To be implemented)</div>} />
      <Route path="/modules/:id" component={ModuleView} />
      <Route path="/forms/:id/design" component={FormDesigner} />
      <Route path="/forms/:id/records" component={RecordsView} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex h-screen bg-background">
          <Sidebar />
          <main className="flex-1 ml-64 overflow-y-auto">
            <Router />
          </main>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

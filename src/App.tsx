import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import Cover from "./pages/Cover";
import Step1Authorization from "./pages/Step1Authorization";
import Step2Strategy from "./pages/Step2Strategy";
import Step3Timeline from "./pages/Step3Timeline";
import MyPlan from "./pages/MyPlan";
import ResourceVault from "./pages/ResourceVault";
import Dashboard from "./pages/Dashboard";
import AdminEvents from "./pages/AdminEvents";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const queryClient = new QueryClient();

function RouteTracker() {
  const location = useLocation();

  // Scroll to top on every route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RouteTracker />
        <Routes>
          <Route path="/" element={<Navigate to="/cover" replace />} />
          <Route path="/cover" element={<Cover />} />
          <Route path="/step-1-authorization" element={<Step1Authorization />} />
          <Route path="/step-2-strategy" element={<Step2Strategy />} />
          <Route path="/step-3-timeline" element={<Step3Timeline />} />
          <Route path="/my-plan" element={<MyPlan />} />
          <Route path="/resource-vault" element={<ResourceVault />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {import.meta.env.VITE_ENABLE_ADMIN === "true" && (
            <Route path="/admin/events" element={<AdminEvents />} />
          )}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Analytics />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

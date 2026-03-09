import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import { useNavigate, useLocation } from "react-router-dom";

const queryClient = new QueryClient();

const ROUTE_KEY = "currentRoute";
const VALID_ROUTES = ["/cover", "/step-1-authorization", "/step-2-strategy", "/step-3-timeline", "/my-plan", "/resource-vault", "/dashboard", "/admin/events"];

function RouteTracker() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (VALID_ROUTES.includes(location.pathname)) {
      localStorage.setItem(ROUTE_KEY, location.pathname);
    }
  }, [location.pathname]);

  useEffect(() => {
    const saved = localStorage.getItem(ROUTE_KEY);
    if (saved && VALID_ROUTES.includes(saved) && location.pathname === "/") {
      navigate(saved, { replace: true });
    }
  }, []);

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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin/events" element={<AdminEvents />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

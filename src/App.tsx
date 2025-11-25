import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Index from "./pages/Index";
import Simulador from "./pages/Simulador";
import HubEnergetico from "./pages/HubEnergetico";
import Beneficios from "./pages/Beneficios";
import Reportes from "./pages/Reportes";
import Institucional from "./pages/Institucional";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/simulador" element={<Simulador />} />
          <Route path="/hub-energetico" element={<HubEnergetico />} />
          <Route path="/beneficios" element={<Beneficios />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/institucional" element={<Institucional />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <footer className="footer text-center py-6 opacity-80 text-gray-600">
          <p>
            &copy; 2025 <strong>SID-Bio</strong> | Sistema de Información de Descarbonización Bioceánica - Jujuy, Argentina.
          </p>
        </footer>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

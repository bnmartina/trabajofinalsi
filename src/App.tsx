import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Importación de componentes y páginas
import Navbar from "./components/Navbar";
import Index from "./pages/Index";
import Simulador from "./pages/Simulador";
import Mapas from "./pages/Mapas";
import HubEnergetico from "./pages/HubEnergetico";
import Beneficios from "./pages/Beneficios";
import Reportes from "./pages/Reportes";
import Institucional from "./pages/Institucional";
import NotFound from "./pages/NotFound";
import Login from "./pages/login";

const queryClient = new QueryClient();

// Wrappers para protección de rutas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/reportes" replace />;
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
            <Navbar />
            <Routes>
              <Route path="/" element={<Index />} />
              
              <Route path="/login" element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              } />

              <Route path="/simulador" element={<Simulador />} />
              <Route path="/mapas" element={<Mapas />} />
              <Route path="/hub-energetico" element={<HubEnergetico />} />

              {/* AQUÍ ESTÁ EL CAMBIO: Beneficios ahora está protegido */}
              <Route path="/beneficios" element={
                <ProtectedRoute>
                  <Beneficios />
                </ProtectedRoute>
              } />

              <Route path="/reportes" element={
                <ProtectedRoute>
                  <Reportes />
                </ProtectedRoute>
              } />

              <Route path="/institucional" element={<Institucional />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <footer className="footer text-center py-6 opacity-80 text-gray-600 border-t mt-auto">
              <p>
                &copy; 2025 <strong>SID-Bio</strong> | Sistema de Información de Descarbonización Bioceánica - Jujuy, Argentina.
              </p>
            </footer>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
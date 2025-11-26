import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogIn, LogOut } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext"; 
import { toast } from "sonner";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  // Lógica de autenticación integrada
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Sesión cerrada");
    navigate('/');
    setIsOpen(false);
  };

  // Definición dinámica de ítems (Reportes solo aparece si hay sesión)
  const navItems = [
    { name: "Inicio", path: "/" },
    { name: "Simulador", path: "/simulador" },
    { name: "Hub Energético", path: "/hub-energetico" },
    { name: "Beneficios", path: "/beneficios" },
    ...(isAuthenticated ? [{ name: "Reportes", path: "/reportes" }] : []),
    { name: "Institucional", path: "/institucional" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* LOGO CON IMAGEN Y TEXTO */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="/logo.png" 
              alt="SID-Bio Logo"
              className="h-10 w-10 object-contain transition-transform group-hover:scale-110"
              // Fallback por si la imagen no existe en tu carpeta public
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null; 
                target.style.display = 'none';
              }}
            />
            {/* Si falla la imagen, el texto mantiene la identidad */}
            <div className="flex flex-col">
              <span className="font-bold text-lg text-foreground leading-none">SID-Bio</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={location.pathname === item.path ? "default" : "ghost"}
                  className="transition-all duration-300"
                >
                  {item.name}
                </Button>
              </Link>
            ))}

            {/* Separador Visual */}
            <div className="h-6 w-px bg-border mx-2"></div>

            {/* Botones de Acción (Login/Logout) */}
            {isAuthenticated ? (
               <Button 
                 variant="destructive" 
                 size="sm" 
                 onClick={handleLogout} 
                 className="gap-2 shadow-sm hover:shadow-md transition-all"
               >
                 <LogOut className="w-4 h-4" /> Salir
               </Button>
            ) : (
               <Link to="/login">
                 <Button 
                   variant="outline" 
                   size="sm" 
                   className="gap-2 border-primary/20 hover:border-primary/50 text-foreground hover:bg-accent"
                 >
                   <LogIn className="w-4 h-4" /> Ingresar
                 </Button>
               </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors text-foreground"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 animate-fade-in border-t border-border bg-card">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}>
                  <Button
                    variant={location.pathname === item.path ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    {item.name}
                  </Button>
                </Link>
              ))}
              
              <div className="h-px bg-border my-2"></div>

              {isAuthenticated ? (
                 <Button variant="destructive" onClick={handleLogout} className="w-full justify-start gap-2">
                   <LogOut className="w-4 h-4" /> Cerrar Sesión
                 </Button>
              ) : (
                 <Link to="/login" onClick={() => setIsOpen(false)}>
                   <Button variant="outline" className="w-full justify-start gap-2">
                     <LogIn className="w-4 h-4" /> Ingresar
                   </Button>
                 </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
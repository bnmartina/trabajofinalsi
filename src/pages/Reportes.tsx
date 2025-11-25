import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Download, 
  BarChart3, 
  User, 
  Mail, 
  Lock, 
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { toast } from "sonner";

const Reportes = () => {
  // Estado para controlar si el usuario está autenticado
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Estado para alternar entre Login y Registro
  const [isLogin, setIsLogin] = useState(true);

  // Funciones placeholder para los reportes
  const generarPDF = () => {
    toast.info("Función de exportación a PDF en desarrollo");
  };

  const generarExcel = () => {
    toast.info("Función de exportación a Excel en desarrollo");
  };

  // Manejador del login (simulado)
  const handleAuth = (e) => {
    e.preventDefault();
    // Simulamos una pequeña carga
    const promise = new Promise((resolve) => setTimeout(resolve, 800));
    
    toast.promise(promise, {
      loading: 'Verificando credenciales...',
      success: () => {
        setIsAuthenticated(true);
        return isLogin ? 'Bienvenido al sistema' : 'Registro completado con éxito';
      },
      error: 'Error al conectar',
    });
  };

  // Si no está autenticado, mostramos la tarjeta de login
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-24 min-h-[80vh] flex items-center justify-center animate-fade-in">
        <Card className="w-full max-w-md shadow-2xl hover:shadow-glow transition-all duration-300 border-t-4 border-t-primary">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {isLogin ? 'Bienvenido' : 'Crear Cuenta'}
            </CardTitle>
            <CardDescription>
              {isLogin 
                ? 'Ingresa tus credenciales para acceder a los reportes.' 
                : 'Registra tu empresa u organismo para comenzar.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input 
                    type="text" 
                    placeholder="Nombre completo o Razón Social" 
                    className="pl-10"
                    required
                  />
                </div>
              )}
              
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input 
                  type="email" 
                  placeholder="Correo electrónico" 
                  className="pl-10"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input 
                  type="password" 
                  placeholder="Contraseña" 
                  className="pl-10"
                  required
                />
              </div>

              {!isLogin && (
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input 
                    type="password" 
                    placeholder="Confirmar contraseña" 
                    className="pl-10"
                    required
                  />
                </div>
              )}

              <Button type="submit" className="w-full group">
                {isLogin ? 'Ingresar al Sistema' : 'Registrarse'}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground">
                {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
                <button 
                  onClick={() => setIsLogin(!isLogin)} 
                  className="ml-2 text-primary font-semibold hover:underline focus:outline-none"
                >
                  {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si está autenticado, mostramos el contenido de reportes
  return (
    <div className="container mx-auto px-4 py-24 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-start mb-12">
            <div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                    Reportes y Análisis
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                    Generación de informes y análisis del sistema de descarbonización
                </p>
            </div>
            <Button 
                variant="outline" 
                onClick={() => setIsAuthenticated(false)}
                className="hidden md:flex"
            >
                Cerrar Sesión
            </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-lg hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                Reporte de Emisiones
              </CardTitle>
              <CardDescription>
                Análisis completo de CO₂ mitigado y proyecciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Incluye comparativas entre escenarios, gráficos de tendencias y métricas ambientales clave.
              </p>
              <div className="flex gap-2">
                <Button onClick={generarPDF} variant="default" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar PDF
                </Button>
                <Button onClick={generarExcel} variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Excel
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-accent" />
                Reporte Energético
              </CardTitle>
              <CardDescription>
                Estado del hub y consumo energético del corredor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Detalla el flujo energético, cargas realizadas y proyecciones de abastecimiento.
              </p>
              <div className="flex gap-2">
                <Button onClick={generarPDF} variant="default" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar PDF
                </Button>
                <Button onClick={generarExcel} variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Excel
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-success" />
                Reporte Económico
              </CardTitle>
              <CardDescription>
                Beneficios monetarios y ahorros operativos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Cuantifica ahorros por reducción de tiempos y costos operativos del sistema.
              </p>
              <div className="flex gap-2">
                <Button onClick={generarPDF} variant="default" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar PDF
                </Button>
                <Button onClick={generarExcel} variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Excel
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-secondary" />
                Reporte Comparativo
              </CardTitle>
              <CardDescription>
                Comparación entre empresas y tipos de vehículos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Análisis por empresa transportista y eficiencia de cada tipo de flota.
              </p>
              <div className="flex gap-2">
                <Button onClick={generarPDF} variant="default" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar PDF
                </Button>
                <Button onClick={generarExcel} variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Excel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 shadow-lg bg-gradient-subtle">
          <CardHeader>
            <CardTitle>Mapa Interactivo del Corredor Bioceánico</CardTitle>
            <CardDescription>
              Visualización geográfica del tránsito y puntos de carga
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-card rounded-lg p-12 text-center">
              <p className="text-muted-foreground">
                El mapa interactivo mostrará las rutas del corredor bioceánico,
                ubicación de hubs energéticos y flujo de tráfico en tiempo real.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                (Integración de mapa disponible próximamente)
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Botón de cerrar sesión para móviles */}
        <div className="mt-8 flex justify-center md:hidden">
             <Button variant="ghost" onClick={() => setIsAuthenticated(false)}>
                Cerrar Sesión
             </Button>
        </div>
      </div>
    </div>
  );
};

export default Reportes;
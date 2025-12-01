import { ArrowRight, Leaf, BarChart3, Zap, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MapSIDBio from "@/components/MapSIDBio";

const Index = () => {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-gradient-primary py-20 md:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-background/10 backdrop-blur-sm rounded-full">
              <Leaf className="w-5 h-5 text-secondary" />
              <span className="text-sm font-medium text-primary-foreground">
                Corredor Bioceánico Sostenible
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
              Sistema de Información de
              <br />
              <span className="text-secondary">Descarbonización Bioceánica</span>
            </h1>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              herramienta digital orientada al análisis y simulación del impacto ambiental del transporte de carga que atraviesa el tramo jujeño del Corredor Bioceánico de Capricornio
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/simulador">
                <Button size="lg" variant="secondary" className="group">
                  Iniciar Simulación
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/institucional">
                <Button size="lg" variant="outline" className="bg-background/10 backdrop-blur-sm border-primary-foreground/20 text-primary-foreground hover:bg-background/20">
                  Conocer Más
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-8">
            Mapa del Corredor Bioceánico Tramo Jama - Pongo
          </h2>

          <div className="rounded-xl overflow-hidden shadow-lg border border-primary/20">
            <MapSIDBio />
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Nuestras herramientas
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Funcionalidades integradas para análisis completo de descarbonización
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/simulador" className="group">
              <Card className="h-full shadow-md hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
                <CardContent className="pt-6">
                  <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Simulador de Tránsito
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Genera escenarios de tráfico y calcula emisiones de CO₂ en tiempo real
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/hub-energetico" className="group">
              <Card className="h-full shadow-md hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
                <CardContent className="pt-6">
                  <div className="p-3 bg-accent/10 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
                    <Zap className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Hub Energético
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Monitoreo del suministro energético y gestión de cargas del sistema
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/beneficios" className="group">
              <Card className="h-full shadow-md hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
                <CardContent className="pt-6">
                  <div className="p-3 bg-success/10 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-8 h-8 text-success" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Beneficios Económicos
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Cuantifica ahorros operativos y reducción de costos de transporte
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/reportes" className="group">
              <Card className="h-full shadow-md hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
                <CardContent className="pt-6">
                  <div className="p-3 bg-secondary/10 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-8 h-8 text-secondary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Reportes y Análisis
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Genera informes detallados y visualizaciones de datos ambientales
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center animate-fade-in">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">200 GWh</div>
              <div className="text-sm text-muted-foreground">Capacidades Hubs Jama 150GWh + Pongo 50GWh</div>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="text-4xl md:text-5xl font-bold text-accent mb-2">2</div>
              <div className="text-sm text-muted-foreground">Estaciones de Carga</div>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="text-4xl md:text-5xl font-bold text-success mb-2">45</div>
              <div className="text-sm text-muted-foreground">Min Tiempo Carga</div>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="text-4xl md:text-5xl font-bold text-secondary mb-2">350</div>
              <div className="text-sm text-muted-foreground">kW Potencia</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;

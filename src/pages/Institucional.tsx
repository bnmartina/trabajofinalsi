import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Target, Eye, Users, Leaf, Award, Globe, AlertTriangle, Mail, MessageSquare, Send, User } from "lucide-react";
import { toast } from "sonner";

const Institucional = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulación de envío
    setTimeout(() => {
      setLoading(false);
      toast.success("Mensaje enviado correctamente. Nos pondremos en contacto pronto.");
      e.target.reset();
    }, 1500);
  };

  return (
    <div className="container mx-auto px-4 py-24 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Sobre SID-Bio
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Sistema de Información de Descarbonización Bioceánica
          </p>
        </div>

        {/* Sección Misión y Visión */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-lg hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-6 h-6 text-primary" />
                Misión
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Proveer información estratégica y herramientas de análisis para la toma de decisiones
                orientadas a la descarbonización del corredor bioceánico, promoviendo el uso de
                tecnologías limpias en el transporte de carga y facilitando la transición hacia
                una movilidad sostenible.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-6 h-6 text-accent" />
                Visión
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Ser la plataforma de referencia en la región para el monitoreo, análisis y
                proyección de impactos ambientales y económicos del transporte bioceánico,
                contribuyendo significativamente a los objetivos de descarbonización y desarrollo
                sostenible de América del Sur.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* NUEVA SECCIÓN: ODS 13 */}
        <Card className="shadow-lg mb-8 border-l-4 border-l-emerald-500 overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Globe className="w-32 h-32" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Globe className="w-7 h-7 text-emerald-600" />
              Marco de Referencia: ODS 13 - Acción por el Clima
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                La Urgencia Global
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed text-justify">
                El cambio climático es una amenaza real que evoluciona a un ritmo más rápido de lo previsto. 
                Para limitar el calentamiento global a <strong>1,5 °C</strong>, las emisiones deben reducirse 
                casi a la mitad para 2030. De no controlarse, los efectos intensificarán catástrofes naturales, 
                afectarán economías enteras y echarán por tierra avances en desarrollo. El costo de la inacción 
                supera con creces al de la acción inmediata.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Leaf className="w-5 h-5 text-emerald-500" />
                La Respuesta de SID-Bio
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed text-justify">
                Alineados con el Acuerdo de París y la Agenda 2030, entendemos que la solución exige transformar 
                sistemas de transporte e industriales. SID-Bio actúa como catalizador para esta transformación 
                en el corredor bioceánico, proporcionando los datos necesarios para redirigir flujos financieros 
                hacia la mitigación climática y garantizar un desarrollo resiliente.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sección Quiénes Somos */}
        <Card className="shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-6 h-6 text-success" />
              Quiénes Somos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              SID-Bio es una iniciativa tecnológica desarrollada para apoyar la gestión ambiental
              y económica del corredor bioceánico. Nuestro equipo combina experiencia en:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-primary/5 rounded-lg">
                <Leaf className="w-8 h-8 text-primary mb-2" />
                <h3 className="font-semibold text-foreground mb-1">Sostenibilidad Ambiental</h3>
                <p className="text-sm text-muted-foreground">
                  Especialistas en mitigación de emisiones y energías renovables
                </p>
              </div>
              <div className="p-4 bg-accent/5 rounded-lg">
                <Award className="w-8 h-8 text-accent mb-2" />
                <h3 className="font-semibold text-foreground mb-1">Tecnología e Innovación</h3>
                <p className="text-sm text-muted-foreground">
                  Desarrollo de sistemas de información y análisis de datos
                </p>
              </div>
              <div className="p-4 bg-success/5 rounded-lg">
                <Globe className="w-8 h-8 text-success mb-2" />
                <h3 className="font-semibold text-foreground mb-1">Logística Internacional</h3>
                <p className="text-sm text-muted-foreground">
                  Expertos en corredores bioceánicos y transporte de carga
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sección Compromiso */}
        <Card className="shadow-lg bg-gradient-accent mb-8">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-primary-foreground mb-4">
                Nuestro Compromiso
              </h2>
              <p className="text-primary-foreground/90 max-w-3xl mx-auto leading-relaxed">
                Trabajamos para transformar la información en acción, proporcionando datos precisos
                y análisis profundos que impulsen decisiones estratégicas hacia un futuro más
                limpio, eficiente y sostenible para el transporte bioceánico.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* NUEVA SECCIÓN: Formulario de Contacto */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-primary" />
              Contáctanos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  ¿Tienes alguna consulta sobre el proyecto o estás interesado en colaborar? 
                  Completa el formulario y nuestro equipo se pondrá en contacto contigo a la brevedad.
                </p>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="w-5 h-5 text-primary" />
                  <span>contacto@sid-bio.org</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Globe className="w-5 h-5 text-primary" />
                  <span>www.sid-bio.org</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Nombre completo" className="pl-9" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="email" placeholder="Correo electrónico" className="pl-9" required />
                  </div>
                </div>
                <div className="space-y-2">
                    <textarea 
                        className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Escribe tu mensaje aquí..."
                        required
                    />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Enviando...' : (
                    <>
                      Enviar Mensaje
                      <Send className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Institucional;
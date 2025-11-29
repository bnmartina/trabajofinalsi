import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Target, 
  Eye, 
  Leaf, 
  Globe, 
  AlertTriangle, 
  Mail, 
  Send, 
  User, 
  Truck, 
  Mountain, 
  Database, 
  BarChart3,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

const Institucional = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // Simulación de envío
    setTimeout(() => {
      setLoading(false);
      // @ts-ignore
      e.target.reset();
      toast.success("Mensaje enviado correctamente. Nos pondremos en contacto pronto.");
    }, 1500);
  };

  return (
    <div className="container mx-auto px-4 pt-32 pb-24 animate-fade-in bg-slate-50/50">
      
      <div className="max-w-5xl mx-auto mb-16 text-center">
        <span className="inline-block py-1 px-3 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold tracking-wider mb-4 uppercase">
          Estrategia Provincial
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
          SID-Bio
        </h1>
        <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto font-light leading-relaxed">
          Sistema de Información de Descarbonización para el <span className="text-emerald-700 font-semibold">Corredor Bioceánico de Capricornio</span>.
        </p>
      </div>

      <div className="max-w-6xl mx-auto space-y-16">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-none shadow-xl bg-gradient-to-br from-white to-emerald-50/30 hover:shadow-2xl transition-all duration-300 group">
            <CardHeader>
           
              <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6 text-teal-700" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-800">Nuestra Misión</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 leading-relaxed text-lg">
                Proveer una plataforma tecnológica integrada que centralice, procese y analice en tiempo real los datos de emisiones del transporte de carga, facilitando la toma de decisiones estratégicas para mitigar el impacto ambiental en el tramo jujeño del Corredor Bioceánico.
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-gradient-to-br from-white to-emerald-50/30 hover:shadow-2xl transition-all duration-300 group">
            <CardHeader>
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Eye className="w-6 h-6 text-emerald-700" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-800">Nuestra Visión</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 leading-relaxed text-lg">
                Consolidarnos como el sistema de referencia para la gestión ambiental logística, siendo claves para que la provincia de Jujuy alcance su meta de reducir un <strong>60% las emisiones para 2030</strong> y logre la <strong>carbono-neutralidad en 2050</strong>.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
              El Desafío del Corredor
            </h2>
            <div className="prose prose-slate max-w-none text-slate-600 text-justify">
              <p>
                La puesta en marcha del <strong>Corredor Bioceánico de Capricornio</strong> representa una oportunidad económica histórica, pero conlleva un desafío ambiental crítico: un incremento masivo en la circulación de vehículos pesados dependientes de combustibles fósiles a través de la provincia de Jujuy.
              </p>
              <p>
                Actualmente, la falta de sistemas integrados de medición impide conocer la huella de carbono real en tiempo real. La información se encuentra dispersa entre múltiples organismos, generando una "ceguera de datos" que dificulta la planificación de estrategias de mitigación efectivas y reactivas.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-emerald-100 flex items-start gap-3">
         
                <Mountain className="w-8 h-8 text-green-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-800">Impacto en Ecosistemas</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Amenaza directa a la biodiversidad de la Puna, Valles y Yungas debido a la contaminación atmosférica.
                  </p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-emerald-100 flex items-start gap-3">
                <Truck className="w-8 h-8 text-amber-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-800">Emisiones Móviles</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Aumento exponencial de CO₂ por flotas internacionales sin regulación unificada en el tramo provincial.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <Card className="bg-slate-900 text-white shadow-2xl overflow-hidden relative border border-slate-800">

              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600 rounded-full blur-[100px] opacity-20 -mr-16 -mt-16"></div>
              
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Database className="w-6 h-6 text-emerald-400" />
                  La Solución SID-Bio
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Transformando datos dispersos en inteligencia climática
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 relative z-10">
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                    <span className="text-sm text-slate-300">
                      <strong>Centralización de Datos:</strong> Unificación de registros de consumo energético y tránsito de carga en un único tablero.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                    <span className="text-sm text-slate-300">
                      <strong>Análisis Predictivo:</strong> Proyección de escenarios para evaluar el impacto antes de que ocurra.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                    <span className="text-sm text-slate-300">
                      <strong>Soporte a la Carbono-Neutralidad:</strong> Herramienta clave para cumplir los compromisos del IPEGI.
                    </span>
                  </li>
                </ul>

                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Meta Jujuy 2030</span>
                    <span className="text-xs font-bold text-emerald-400">-60% Emisiones</span>
                  </div>
                  <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[60%] animate-pulse"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-900 to-teal-900 shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=2021&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
          <div className="relative z-10 px-8 py-16 text-center max-w-4xl mx-auto">
            <Globe className="w-12 h-12 text-emerald-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Hacia una Logística Resiliente
            </h2>
            <p className="text-emerald-100 text-lg leading-relaxed">
              "No podemos gestionar lo que no medimos. SID-Bio nace para iluminar el camino hacia un desarrollo que respete nuestros paisajes, nuestra salud y nuestro futuro, convirtiendo a Jujuy en un modelo de logística sostenible."
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl shadow-sm border border-emerald-100/50 p-8 md:p-12">
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Hablemos</h3>
              <p className="text-slate-500">
                ¿Interesado en colaborar con la descarbonización del corredor? ¿Necesitas acceso a datos para investigación?
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <Mail className="w-5 h-5 text-slate-600 group-hover:text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Correo Electrónico</p>
                  <p className="text-sm text-slate-500">contacto@sid-bio.jujuy.gob.ar</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                  <BarChart3 className="w-5 h-5 text-slate-600 group-hover:text-teal-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Soporte Técnico</p>
                  <p className="text-sm text-slate-500">soporte@sid-bio.org</p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Nombre completo</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input placeholder="Juan Pérez" className="pl-9 bg-white focus-visible:ring-emerald-500" required />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Correo institucional</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input type="email" placeholder="nombre@empresa.com" className="pl-9 bg-white focus-visible:ring-emerald-500" required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Mensaje</label>
              <Textarea 
                placeholder="¿Cómo podemos ayudarte?" 
                className="min-h-[120px] bg-white resize-none focus-visible:ring-emerald-500" 
                required 
              />
            </div>

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-6 shadow-lg shadow-emerald-900/10" disabled={loading}>
              {loading ? 'Enviando...' : (
                <span className="flex items-center gap-2">
                  Enviar Mensaje <Send className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Institucional;
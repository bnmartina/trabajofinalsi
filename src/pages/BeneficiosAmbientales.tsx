import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Leaf, 
  Globe, 
  HeartPulse, 
  ArrowRight,
  Wind,
  TrendingUp,
  Footprints
} from "lucide-react";

const environmentalBenefits = [
  {
    id: "huella",
    title: "Reducción de Huella de Carbono",
    short: "De la conciencia a la acción concreta.",
    description: "La huella de carbono no es solo un número; es el rastro que dejamos en el planeta. SID-Bio permite cuantificar las emisiones de GEI de cada viaje logístico, transformando acciones cotidianas en datos para adoptar decisiones de transporte más responsables y menos impactantes.",
    icon: Footprints,
    color: "text-slate-600",
    bg: "bg-slate-100",
    image: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" // Huella / Impacto ambiental
  },
  {
    id: "salud",
    title: "Salud Pública y Aire Limpio",
    short: "Menos emisiones, mejor calidad de vida.",
    description: "Al reducir la quema de combustibles fósiles en el corredor, disminuimos la contaminación del aire que respiran nuestras comunidades. Un aire más limpio se traduce directamente en una reducción de enfermedades respiratorias y un entorno más saludable para las generaciones futuras.",
    icon: Wind,
    color: "text-cyan-600",
    bg: "bg-cyan-100",
    image: "https://images.unsplash.com/photo-1532509854226-a2d9d8e66f8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" // Aire fresco / Cielo limpio
  },
  {
    id: "economia",
    title: "Impulso a la Economía Verde",
    short: "Fomento de empleos y desarrollo sostenible.",
    description: "La transición hacia una logística baja en carbono no solo protege el ambiente, sino que dinamiza la economía. Fomenta la creación de 'empleos verdes' en sectores emergentes como el mantenimiento de flotas eléctricas, la gestión de Hubs de carga solar y el desarrollo de tecnologías limpias en la región.",
    icon: TrendingUp,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" // Crecimiento / Innovación
  },
  {
    id: "jujuy",
    title: "Compromiso Jujuy Verde",
    short: "Meta provincial: Carbono Neutral 2050.",
    description: "Alineado con la iniciativa Jujuy Verde, el sistema es la herramienta clave para monitorear el progreso hacia la meta de reducir un 60% las emisiones para 2030. Es una inversión estratégica en el futuro de la provincia, posicionándola como líder en logística sustentable.",
    icon: Leaf,
    color: "text-teal-600",
    bg: "bg-teal-100",
    image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" // Paisaje natural / Jujuy concepto
  },
  {
    id: "global",
    title: "Impacto Global (ODS 13)",
    short: "Acción por el Clima a escala regional.",
    description: "Cada tonelada de CO₂ mitigada en el Corredor Bioceánico suma al esfuerzo global contra la crisis climática. SID-Bio conecta las operaciones locales con los Objetivos de Desarrollo Sostenible, demostrando que la integración regional puede ser sinónimo de responsabilidad planetaria.",
    icon: Globe,
    color: "text-blue-600",
    bg: "bg-blue-100",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" // Tierra desde el espacio
  }
];

const BeneficiosAmbientales = () => {
  const [activeBenefit, setActiveBenefit] = useState(environmentalBenefits[0]);

  return (
    <div className="container mx-auto px-4 py-24 bg-slate-50/50 min-h-screen">
      
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block py-1 px-3 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold tracking-wider mb-4 uppercase">
            Sostenibilidad Integral
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4">
            Beneficios de una Huella Reducida
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Reducir la huella de carbono en el Corredor Bioceánico es mucho más que una meta técnica; es una oportunidad para transformar nuestra salud, nuestra economía y nuestro futuro.
            <span className="block mt-4 text-sm font-medium text-emerald-600 bg-white border border-emerald-100 py-2 px-4 rounded-full shadow-sm inline-block animate-bounce">
              Explora los 5 pilares del impacto interactuando con las tarjetas
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch h-[650px]">
          
          <div className="lg:col-span-5 flex flex-col gap-3 h-full overflow-y-auto pr-2 custom-scrollbar">
            {environmentalBenefits.map((benefit) => {
              const Icon = benefit.icon;
              const isActive = activeBenefit.id === benefit.id;

              return (
                <div 
                  key={benefit.id}
                  onMouseEnter={() => setActiveBenefit(benefit)}
                  className={`
                    group relative p-5 rounded-xl cursor-pointer transition-all duration-300 border
                    ${isActive 
                      ? 'bg-white border-emerald-500 shadow-xl scale-[1.02] z-10' 
                      : 'bg-white/70 border-slate-200 hover:border-emerald-300 hover:bg-white hover:shadow-md'
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors shrink-0 ${isActive ? benefit.bg : 'bg-slate-100 group-hover:bg-slate-50'}`}>
                      <Icon className={`w-6 h-6 ${isActive ? benefit.color : 'text-slate-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-bold text-lg transition-colors truncate ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
                        {benefit.title}
                      </h3>
                      <p className={`text-sm line-clamp-1 ${isActive ? 'text-slate-600' : 'text-slate-500'}`}>
                        {benefit.short}
                      </p>
                    </div>
                    <ArrowRight className={`w-5 h-5 text-emerald-500 transition-all duration-300 shrink-0 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-7 h-full relative group perspective-1000">
            <Card className="h-full border-none shadow-2xl bg-slate-900 text-white relative overflow-hidden transition-all duration-500 rounded-3xl flex flex-col">
              
              <div className="absolute inset-0 z-0">
                 <img 
                    src={activeBenefit.image} 
                    alt={activeBenefit.title}
                    className="w-full h-full object-cover transition-transform duration-1000 ease-out scale-110 group-hover:scale-100 opacity-50"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-900/30"></div>
              </div>

              <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px] opacity-20 -mr-32 -mt-32 transition-colors duration-700 z-0
                ${activeBenefit.id === 'huella' ? 'bg-slate-500' : 
                  activeBenefit.id === 'salud' ? 'bg-cyan-500' :
                  activeBenefit.id === 'economia' ? 'bg-emerald-500' : 
                  activeBenefit.id === 'jujuy' ? 'bg-teal-500' : 'bg-blue-600'}
              `}></div>

              <CardHeader className="relative z-10 pt-16 pl-12 pr-12 pb-0">
                <div className="flex items-center gap-3 mb-6 animate-fade-in-up">
                  <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg">
                    <activeBenefit.icon className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-sm font-bold uppercase tracking-widest text-emerald-300 drop-shadow-sm">
                    {activeBenefit.short}
                  </span>
                </div>
                <CardTitle className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] animate-fade-in-up delay-100 drop-shadow-lg">
                  {activeBenefit.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="relative z-10 pl-12 pr-16 pb-16 flex-1 flex flex-col justify-end">
                
                <div className="w-24 h-1.5 bg-white/20 rounded-full mb-8 overflow-hidden">
                  <div key={activeBenefit.id} className="h-full bg-emerald-400 rounded-full w-0 animate-[progress_1s_ease-out_forwards]"></div>
                </div>
                
                <p className="text-xl md:text-2xl text-slate-100 leading-relaxed font-light animate-fade-in-up delay-200 drop-shadow-md">
                  {activeBenefit.description}
                </p>

                <div className="mt-12 pt-8 border-t border-white/10 flex items-center gap-4 animate-fade-in-up delay-300">
                  <div className="bg-emerald-500/20 p-3 rounded-full backdrop-blur-sm border border-emerald-500/30">
                    <HeartPulse className="w-6 h-6 text-emerald-300" />
                  </div>
                  <div>
                    <span className="block text-xs text-emerald-200 uppercase tracking-wider font-semibold">
                      Impacto Real
                    </span>
                    <span className="text-base text-white font-medium">
                      Contribuye a un futuro sostenible para Jujuy.
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BeneficiosAmbientales;
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Battery,
  Zap,
  AlertTriangle,
  BarChart3,
  Play,
  Pause,
  Truck // Importamos Truck para el fallback si no hay imagen
} from "lucide-react";

// [IMPORTANTE] Descomenta esta línea en tu proyecto local para usar tu base de datos real
// import { supabase } from "@/integrations/supabase/client";

import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Registro de componentes de gráficos
ChartJS.register(ArcElement, Tooltip, Legend);

// --- MOCK DE SUPABASE PARA VISTA PREVIA ---
// (Elimina o comenta esto cuando uses la importación real de arriba)
const supabase = {
  from: () => ({
    select: () => ({
      in: () => ({
        limit: () => Promise.resolve({ data: [] }) 
      }),
      order: () => Promise.resolve({ data: [] })
    })
  })
};
// -------------------------------------------

interface Camion {
  id: string;
  patente: string;
  kwatt_carga: number;
  tipo: "full" | "hibrido" | "diesel";
  estadoVisual: "cola" | "entrando" | "cargando" | "saliendo";
  x: number;
  y: number;
  opacity: number;
  nivel: number;
}

interface HubData {
  nombre: string;
  capacidad: number;
  energia_disponible: number;
  cola: Camion[];
  cargando: Camion[];
  progreso: number[];
  maxPuestos: number;
  notificaciones: string[];
}

const HubEnergetico = () => {
  // Estado inicial de los Hubs
  const [hubs, setHubs] = useState<Record<string, HubData>>({
    jama: {
      nombre: "Hub Paso de Jama - Cauchari",
      capacidad: 150000,
      energia_disponible: 150000,
      cola: [],
      cargando: [],
      progreso: [],
      maxPuestos: 4,
      notificaciones: [],
    },
    pongo: {
      nombre: "Hub Finca El Pongo",
      capacidad: 80000,
      energia_disponible: 80000,
      cola: [],
      cargando: [],
      progreso: [],
      maxPuestos: 2,
      notificaciones: [],
    },
  });

  const [simulacionActiva, setSimulacionActiva] = useState(false);
  const [mostrarGrafico, setMostrarGrafico] = useState(false);

  // --- LOGICA DE CARGA DE DATOS ---
  const cargarCamiones = async () => {
    let camiones: Camion[] = [];

    // 1. Intentar cargar de Supabase
    try {
      const { data, error } = await supabase
        .from("dataset" as any)
        .select("id, patente, tipo, kwatt_carga" as any)
        .in("tipo" as any, ["full", "hibrido"] as any)
        .limit(200);

      if (!error && data?.length) {
        camiones = data.map((c: any) => ({
          id: c.id,
          patente: c.patente,
          kwatt_carga: Math.round(c.kwatt_carga || 350),
          tipo: c.tipo,
          estadoVisual: "cola",
          x: 0,
          y: 0,
          opacity: 1,
          nivel: 0,
        }));
      }
    } catch (err) {
      console.log("Error conectando a Supabase, intentando offline...");
    }

    // 2. Fallback: LocalStorage (Modo Offline)
    if (camiones.length === 0) {
      const local = localStorage.getItem("simulacion_offline");
      if (local) {
        try {
          const parsed = JSON.parse(local);
          camiones = parsed
            .filter((c: any) => c.tipo === "full" || c.tipo === "hibrido")
            .slice(0, 80)
            .map((c: any, i: number) => ({
              id: c.id || `local-${i}`,
              patente: c.patente,
              kwatt_carga: Math.round(c.kwatt_carga || 350),
              tipo: c.tipo,
              estadoVisual: "cola",
              x: 0,
              y: 0,
              opacity: 1,
              nivel: 0,
            }));
        } catch (e) { console.error(e); }
      }
    }

    // 3. Fallback: Datos Dummy (Para demostración si todo lo demás falla)
    if (camiones.length === 0) {
        camiones = Array.from({ length: 15 }).map((_, i) => ({
            id: `dummy-${i}`,
            patente: `DEMO-${100+i}`,
            kwatt_carga: 350,
            tipo: i % 2 === 0 ? "full" : "hibrido",
            estadoVisual: "cola",
            x: 0, y: 0, opacity: 1, nivel: 0
        }));
    }

    // Distribución aleatoria entre Hubs
    const jamaCola: Camion[] = [];
    const pongoCola: Camion[] = [];

    camiones.forEach(c => {
      Math.random() < 0.65 ? jamaCola.push(c) : pongoCola.push(c);
    });

    setHubs(prev => ({
      ...prev,
      jama: { ...prev.jama, cola: jamaCola },
      pongo: { ...prev.pongo, cola: pongoCola },
    }));
  };

  useEffect(() => {
    cargarCamiones();
  }, []);

  // --- MOTOR DE SIMULACIÓN ---
  useEffect(() => {
    if (!simulacionActiva) return;

    const interval = setInterval(() => {
      setHubs(prev => {
        const newHubs = { ...prev };

        Object.keys(newHubs).forEach(key => {
          const hub = { ...newHubs[key] };

          const porcentaje = (hub.energia_disponible / hub.capacidad) * 100;
          const critico = porcentaje < 30;

          // Generar Alerta Crítica
          if (critico && !hub.notificaciones.some(n => n.includes("crítica"))) {
            hub.notificaciones = [
              `ALERTA: Energía crítica (${porcentaje.toFixed(1)}%)`,
              ...hub.notificaciones.slice(0, 4),
            ];
          }

          // Lógica de Entrada (Cola -> Cargando)
          while (hub.cargando.length < hub.maxPuestos && hub.cola.length > 0) {
            const camion = { ...hub.cola[0] };
            if (hub.energia_disponible < camion.kwatt_carga) break;

            hub.cola = hub.cola.slice(1);

            camion.estadoVisual = "entrando";
            camion.x = 600; // Posición inicial (derecha fuera de pantalla)
            camion.y = 100 + hub.cargando.length * 120; // Espaciado vertical
            camion.nivel = hub.cargando.length;

            hub.cargando = [...hub.cargando, camion];
            hub.progreso = [...hub.progreso, 0];
          }

          // Actualización de estado (Movimiento y Carga)
          hub.cargando = hub.cargando.map((c, i) => {
            const camion = { ...c };

            // Fase 1: Entrando
            if (camion.estadoVisual === "entrando") {
              camion.x -= 20; // Velocidad de entrada
              if (camion.x <= 80) camion.estadoVisual = "cargando";
            }

            // Fase 2: Cargando
            if (camion.estadoVisual === "cargando") {
              const nuevoProgreso = Math.min(hub.progreso[i] + 1.5, 100); // Velocidad de carga
              hub.progreso[i] = nuevoProgreso;

              if (nuevoProgreso >= 100) {
                camion.estadoVisual = "saliendo";
                hub.energia_disponible = Math.max(0, hub.energia_disponible - camion.kwatt_carga);
                hub.notificaciones = [`Carga completa: ${camion.patente}`, ...hub.notificaciones.slice(0, 4)];
              }
            }

            // Fase 3: Saliendo
            if (camion.estadoVisual === "saliendo") {
              camion.x -= 25; // Velocidad de salida
              camion.opacity -= 0.05; // Desvanecimiento
            }

            return camion;
          });

          // Limpieza de camiones que terminaron
          const indicesBorrar = hub.cargando
            .map((c, i) => (c.opacity <= 0 ? i : -1))
            .filter(i => i !== -1)
            .reverse();

          indicesBorrar.forEach(i => {
            hub.cargando.splice(i, 1);
            hub.progreso.splice(i, 1);
          });

          newHubs[key] = hub;
        });

        return newHubs;
      });
    }, 90); // 90ms por frame

    return () => clearInterval(interval);
  }, [simulacionActiva]);

  // --- BOTONES DE CONTROL ---
  const recargarHub25 = () => {
    setHubs(prev => {
      const newState = { ...prev };
      Object.keys(newState).forEach(key => {
        const hub = newState[key];
        hub.energia_disponible = Math.min(hub.capacidad, hub.energia_disponible + hub.capacidad * 0.25);
      });
      return newState;
    });
  };

  const forzar25porciento = () => {
    setHubs(prev => {
      const newState = { ...prev };
      Object.keys(newState).forEach(key => {
        const hub = newState[key];
        hub.energia_disponible = Math.round(hub.capacidad * 0.25);
      });
      return newState;
    });
  };

  // --- DATOS PARA GRÁFICO ---
  const totalCamiones = Object.values(hubs).reduce((a, h) => a + h.cola.length + h.cargando.length, 0);
  const fullCount = Object.values(hubs).reduce((a, h) => a + h.cola.filter(c => c.tipo === "full").length + h.cargando.filter(c => c.tipo === "full").length, 0);

  const dataGrafico = {
    labels: ["100% Eléctricos", "Híbridos"],
    datasets: [{
      data: [fullCount, totalCamiones - fullCount],
      backgroundColor: ["#10b981", "#3b82f6"],
    }],
  };

  return (
    <div className="container mx-auto px-4 pt-32 pb-20 min-h-screen animate-fade-in">
    
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          Hubs Energéticos
        </h1>
        <p className="text-lg text-muted-foreground">
          Monitoreo en tiempo real de infraestructura de carga
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mb-12">
        <Button
          size="lg"
          onClick={() => setSimulacionActiva(!simulacionActiva)}
          className={`gap-2 min-w-[160px] ${simulacionActiva ? 'bg-orange-500 hover:bg-orange-600' : 'bg-primary'}`}
        >
          {simulacionActiva ? <><Pause className="w-5 h-5" /> Pausar</> : <><Play className="w-5 h-5" /> Iniciar</>}
        </Button>

        <Button size="lg" variant="secondary" onClick={recargarHub25} className="gap-2">
          <Zap className="w-5 h-5 text-yellow-500" /> +25% Energía
        </Button>

        <Button size="lg" variant="destructive" onClick={forzar25porciento} className="gap-2">
          <AlertTriangle className="w-5 h-5" /> Forzar Crítico
        </Button>

        <Button size="lg" className="bg-blue-600 hover:bg-blue-700" onClick={() => setMostrarGrafico(!mostrarGrafico)}>
          <BarChart3 className="w-5 h-5 mr-2" />
          {mostrarGrafico ? "Ocultar Flota" : "Ver Flota"}
        </Button>
      </div>

      {mostrarGrafico && (
        <div className="max-w-md mx-auto mb-16 animate-in fade-in zoom-in-95">
          <Card className="shadow-xl">
            <CardHeader className="text-center bg-primary text-primary-foreground py-4">
              <CardTitle className="text-xl">Composición de la Flota</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-64 flex justify-center">
                 <Doughnut data={dataGrafico} options={{ maintainAspectRatio: false }} />
              </div>
              <p className="text-center text-xl font-semibold mt-6">
                Total: {totalCamiones} unidades
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-7xl mx-auto">
        {Object.entries(hubs).map(([key, hub]) => {
          const porcentaje = Math.round((hub.energia_disponible / hub.capacidad) * 100);
          const critico = porcentaje < 30;

          return (
            <Card key={key} className={`overflow-hidden shadow-xl border transition-all duration-300 ${critico ? 'border-red-500 shadow-red-100' : 'border-border'}`}>
              <CardHeader className={`text-white transition-colors duration-500 ${critico ? "bg-red-600" : "bg-gradient-to-r from-primary to-primary/80"}`}>
                <CardTitle className="text-2xl flex justify-between items-center">
                  <span className="flex items-center gap-3">
                    {critico ? <AlertTriangle className="w-8 h-8 animate-pulse" /> : <Battery className="w-8 h-8" />}
                    {hub.nombre}
                  </span>
                  <span className="text-2xl font-bold bg-black/20 px-3 py-1 rounded">{porcentaje}%</span>
                </CardTitle>
                <Progress value={porcentaje} className={`h-4 mt-3 bg-black/20 ${critico ? '[&>div]:bg-red-200' : '[&>div]:bg-white'}`} />
              </CardHeader>

              <CardContent className="pt-6 bg-slate-50">
                <div className="relative h-[500px] bg-slate-200 rounded-xl border-2 border-dashed border-slate-300 overflow-hidden mb-6 shadow-inner">
                  
                  <div className="absolute inset-0 flex flex-col pt-[100px] pl-[80px] opacity-10 pointer-events-none">
                     {Array.from({length: hub.maxPuestos}).map((_, i) => (
                        <div key={i} className="h-[120px] border-b-2 border-slate-400 w-full flex items-center">
                           <span className="text-4xl font-black text-slate-600 ml-4">PUESTO {i+1}</span>
                        </div>
                     ))}
                  </div>

                  {hub.cargando.map((c, i) => (
                    <div
                      key={c.id}
                      className="absolute transition-transform duration-100 ease-linear"
                      style={{
                        transform: `translate(${c.x}px, ${c.y}px)`,
                        opacity: c.opacity,
                        zIndex: 10 + i,
                      }}
                    >
                      <div className="relative group">
                          <img
                            src="/camion.png"
                            alt="Camión"
                            className="w-56 h-auto object-contain drop-shadow-2xl"
                            onError={(e) => {
                                // Si la imagen falla, ocultamos img y mostramos un div con ícono
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          <div className="hidden bg-blue-600 text-white p-4 rounded-lg shadow-lg w-48 h-24 flex-col items-center justify-center gap-2">
                             <Truck className="w-10 h-10" />
                             <span className="text-xs font-bold">{c.patente}</span>
                          </div>

                          <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center -mt-6">
                            <div className="bg-black/80 text-white px-3 py-1 rounded text-xs font-bold tracking-wider shadow-lg border border-white/20">
                              {c.patente}
                            </div>
                            <div className="bg-black/80 text-white px-2 py-0.5 rounded text-[10px] mt-1">
                              {c.kwatt_carga} kW
                            </div>
                          </div>
                      </div>

                      <Progress
                        value={hub.progreso[i] || 0}
                        className="absolute -bottom-2 left-6 right-6 h-3 rounded-full border border-white/50 bg-slate-300"
                      />
                    </div>
                  ))}

                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-6 py-3 rounded-lg shadow-lg border border-slate-200 z-50">
                    <p className="text-lg font-bold text-primary flex items-center gap-2">
                       <span className={`w-3 h-3 rounded-full ${hub.cola.length > 0 ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`}></span>
                       En Cola: {hub.cola.length}
                    </p>
                  </div>
                </div>

                {hub.notificaciones.length > 0 && (
                  <div className="space-y-2 bg-white p-3 rounded-lg border shadow-sm">
                    <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Registro de Actividad</div>
                    {hub.notificaciones.map((n, i) => (
                      <div
                        key={i}
                        className={`text-sm px-3 py-2 rounded border-l-4 flex items-center gap-2 animate-in fade-in slide-in-from-left-2 ${
                          n.includes("ALERTA")
                            ? "bg-red-50 border-red-500 text-red-700"
                            : "bg-blue-50 border-blue-500 text-blue-700"
                        }`}
                      >
                         {n.includes("ALERTA") ? <AlertTriangle className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                        {n}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default HubEnergetico;
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Battery, AlertTriangle, Play, Pause, RotateCcw, BarChart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

// --------- TIPOS ---------
interface Camion {
  id: string;
  modelo: string;
  patente: string;
  empresa: string;
  kwatt_carga: number;
  tipo: string;
  estadoVisual?: "cola" | "entrando" | "cargando" | "saliendo";
  x?: number;
  y?: number;
  opacity?: number;
  nivel?: number; // Nivel donde carga
}

interface Hub {
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
  const [hubs, setHubs] = useState<{ [key: string]: Hub }>({
    jama: {
      nombre: "Hub Paso de Jama",
      capacidad: 150000,
      energia_disponible: 150000,
      cola: [],
      cargando: [],
      progreso: [],
      maxPuestos: 3,
      notificaciones: [],
    },
    pongo: {
      nombre: "Hub Finca el Pongo",
      capacidad: 50000,
      energia_disponible: 50000,
      cola: [],
      cargando: [],
      progreso: [],
      maxPuestos: 1,
      notificaciones: [],
    },
  });

  const [simulacionActiva, setSimulacionActiva] = useState(false);
  const [showGrafico, setShowGrafico] = useState(false);

  // --------- CARGAR CAMIONES DESDE SUPABASE ---------
  const cargarCamiones = async () => {
    try {
      const { data, error } = await supabase
        .from("dataset")
        .select("*")
        .in("tipo", ["full", "hibrido", "diesel"])
        .order("created_at", { ascending: true });

      if (error) throw error;

      const camiones: Camion[] = (data || []).map((item: any) => ({
        id: item.id,
        modelo: item.modelo_camion,
        patente: item.patente,
        empresa: item.empresa,
        kwatt_carga: item.kwatt_carga || 350,
        tipo: item.tipo,
        estadoVisual: "cola",
        x: 0,
        y: 0,
        opacity: 1,
        nivel: undefined,
      }));

      const jamaCola: Camion[] = [];
      const pongoCola: Camion[] = [];

      camiones.forEach((c) =>
        Math.random() < 0.5 ? jamaCola.push(c) : pongoCola.push(c)
      );

      setHubs((prev) => ({
        ...prev,
        jama: { ...prev.jama, cola: jamaCola },
        pongo: { ...prev.pongo, cola: pongoCola },
      }));
    } catch (error) {
      console.error("Error cargando camiones:", error);
    }
  };

  useEffect(() => {
    cargarCamiones();
  }, []);

  // --------- SIMULACIÓN PRINCIPAL ---------
  useEffect(() => {
    if (!simulacionActiva) return;

    const interval = setInterval(() => {
      setHubs((prev) => {
        const newHubs = structuredClone(prev);

        Object.keys(newHubs).forEach((key) => {
          const hub = newHubs[key];

          // --- ASIGNAR CAMIONES A PUESTOS --- 
          while (hub.cargando.length < hub.maxPuestos && hub.cola.length > 0) {
            const siguiente = hub.cola[0];
            if (hub.energia_disponible < siguiente.kwatt_carga) break;

            hub.cola.shift();

            // Buscar primer nivel disponible
            const niveles = Array(hub.maxPuestos).fill(false);
            hub.cargando.forEach((c) => {
              if (c.nivel !== undefined) niveles[c.nivel] = true;
            });
            const nivelLibre = niveles.findIndex((v) => !v);
            siguiente.nivel = nivelLibre;

            siguiente.estadoVisual = "entrando";
            siguiente.x = -120;
            siguiente.y = 40 * nivelLibre;

            hub.cargando.push(siguiente);
            hub.progreso.push(0);
          }

          // --- MOVIMIENTOS DE ENTRADA ---
          hub.cargando.forEach((c) => {
            if (c.estadoVisual === "entrando") {
              c.x += 6;
              if (c.x >= 0) c.estadoVisual = "cargando";
            }
          });

          // --- PROCESO DE CARGA ---
          hub.progreso = hub.progreso.map((p, idx) => {
            const camion = hub.cargando[idx];
            if (!camion || camion.estadoVisual !== "cargando") return p;

            const inc = 4;
            const nuevo = Math.min(p + inc, 100);

            if (nuevo >= 100) {
              camion.estadoVisual = "saliendo";
              hub.energia_disponible -= camion.kwatt_carga;

              hub.notificaciones.unshift(
                `🚚💨 ${camion.patente} salió del hub (consume ${camion.kwatt_carga} kW)`
              );
              if (hub.notificaciones.length > 5) hub.notificaciones.pop();
            }
            return nuevo;
          });

          // --- SALIDA ---
          hub.cargando.forEach((c, idx) => {
            if (c.estadoVisual === "saliendo") {
              c.x += 8;
              c.opacity! -= 0.05;
              if (c.opacity! <= 0) {
                hub.cargando.splice(idx, 1);
                hub.progreso.splice(idx, 1);
              }
            }
          });

          // --- REORDENAR COLA: 3 filas de 3 ---
          hub.cola.forEach((c, i) => {
            const col = i % 3;
            const row = Math.floor(i / 3);
            c.x = col * 60;
            c.y = row * 40;
          });
        });

        return newHubs;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [simulacionActiva]);

  const toggleSimulacion = () => setSimulacionActiva((p) => !p);

  const regenerar = (k: string) =>
    setHubs((prev) => ({
      ...prev,
      [k]: {
        ...prev[k],
        energia_disponible: Math.min(prev[k].capacidad, prev[k].energia_disponible + 5000),
      },
    }));

  // --------- GRAFICO HISTORICO ---------
  const todosCamiones = Object.values(hubs).flatMap((h) => [...h.cola, ...h.cargando]);

  const conteo = {
    full: todosCamiones.filter((c) => c.tipo === "full").length,
    hibrido: todosCamiones.filter((c) => c.tipo === "hibrido").length,
    diesel: todosCamiones.filter((c) => c.tipo === "diesel").length,
  };

  const dataGrafico = {
    labels: ["Full", "Híbrido", "Diesel"],
    datasets: [
      {
        data: [conteo.full, conteo.hibrido, conteo.diesel],
        backgroundColor: ["#009933", "#66cc66", "#cc0000"],
      },
    ],
  };

  const total = conteo.full + conteo.hibrido + conteo.diesel;
  let analisis = "";
  let bg = "";

  if (total === 0) {
    analisis = "No hay datos aún.";
    bg = "bg-gray-200";
  } else {
    const pv = ((conteo.full + conteo.hibrido) / total) * 100;
    if (pv === 100) {
      analisis = "100% vehículos verdes: impacto ambiental muy favorable.";
      bg = "bg-green-200";
    } else if (pv === 0) {
      analisis = "100% diesel: impacto negativo severo.";
      bg = "bg-red-200";
    } else {
      analisis = `Combinación: ${pv.toFixed(0)}% verdes – equilibrio moderado.`;
      bg = "bg-yellow-200";
    }
  }

  return (
    <div className="container mx-auto px-4 pt-32 pb-12 animate-fade-in">
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <Button onClick={toggleSimulacion} className="gap-2">
          {simulacionActiva ? <><Pause /> Pausar</> : <><Play /> Iniciar</>}
        </Button>
        <Button onClick={() => setShowGrafico((p) => !p)} variant="secondary" className="gap-2">
          <BarChart className="w-4 h-4" /> Gráfico Histórico
        </Button>
        {Object.keys(hubs).map((k) => (
          <Button key={k} onClick={() => regenerar(k)} variant="secondary" className="gap-2">
            <RotateCcw className="w-4 h-4" /> Recargar {hubs[k].nombre}
          </Button>
        ))}
      </div>

      {showGrafico && (
        <Card className="mb-6 max-w-md mx-auto">
          <CardContent>
            <Doughnut data={dataGrafico} />
            <div className={`${bg} p-4 mt-4 rounded font-medium text-center`}>{analisis}</div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.keys(hubs).map((key) => {
          const hub = hubs[key];
          const p = (hub.energia_disponible / hub.capacidad) * 100;
          const critico = p < 20;

          return (
            <Card key={key} className="relative overflow-hidden">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{hub.nombre}</span>
                  <span className="flex items-center gap-1">
                    <Battery className="w-5 h-5" />
                    {hub.energia_disponible} / {hub.capacidad} kW
                  </span>
                </CardTitle>
                <CardDescription>
                  {hub.cargando.length} cargando — {hub.cola.length} en cola
                </CardDescription>
                <Progress value={p} className="h-3 mt-1" />
                {critico && (
                  <div className="bg-red-300 p-2 rounded mt-2 flex gap-2 items-center">
                    <AlertTriangle />
                    <span>⚠️ Nivel crítico</span>
                  </div>
                )}
              </CardHeader>

              <CardContent>
                <div className="relative h-40 bg-gray-100 rounded mb-4 overflow-hidden">
                  {hub.cargando.map((c) => (
                    <div
                      key={c.id}
                      className="absolute w-28 h-10 bg-green-500 text-white flex items-center justify-center rounded shadow transition-all text-xs"
                      style={{ transform: `translate(${c.x}px, ${c.y}px)`, opacity: c.opacity ?? 1 }}
                    >
                      {c.patente} ({c.kwatt_carga} kW)
                    </div>
                  ))}
                </div>

                {/* COLA 3x3 */}
                <h3 className="font-semibold mb-2">Cola</h3>
                <div className="relative h-120 overflow-hidden bg-gray-50 rounded border p-2">
                  {hub.cola.slice(0, 9).map((c, i) => {
                    const col = i % 3;
                    const row = Math.floor(i / 3);
                    return (
                      <div
                        key={c.id}
                        className="absolute w-24 h-8 bg-gray-300 text-xs flex items-center justify-center rounded"
                        style={{ transform: `translate(${col * 60}px, ${row * 40}px)` }}
                      >
                        {c.patente}
                      </div>
                    );
                  })}
                  {hub.cola.length > 9 && (
                    <div className="absolute bottom-0 w-full text-center text-sm text-gray-500 bg-white">
                      +{hub.cola.length - 9} más
                    </div>
                  )}
                </div>

                {hub.notificaciones.length > 0 && (
                  <div className="bg-gray-200 p-2 rounded mt-3 text-sm">
                    {hub.notificaciones.map((n, i) => (
                      <p key={i}>{n}</p>
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

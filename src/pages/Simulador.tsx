import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Truck, Zap, TrendingDown, Leaf, Play, BarChart3, Save } from "lucide-react";
import { toast } from "sonner";
import Chart from "chart.js/auto";
import { useNavigate } from "react-router-dom";


import { supabase } from "@/integrations/supabase/client";
import { useMitigacionStore } from "@/stores/mitigacionStore"; 

const supabase = {
  from: () => ({
    insert: () => Promise.resolve({ error: null })
  })
};

const useMitigacionStore = () => {
    const [m, setM] = useState(0);
    return { mitigacion: m, setMitigacion: setM };
};

export type Registro = {
  id?: number;
  modelo_camion: string;
  patente: string;
  empresa: string;
  distancia_recorrida: number;
  tipo: "full" | "hibrido" | "diesel";
  km_a_recorrer: number;
  km_electricos: number;
  kwatt_carga: number;
  fecha_hora: string;
};

// Constantes físicas
const FUEL_L_PER_100KM = 30;
const FUEL_L_PER_KM = FUEL_L_PER_100KM / 100;
const EF_CO2_PER_L = 2.68;
const EMISION_FACTOR_PER_KM = FUEL_L_PER_KM * EF_CO2_PER_L;

const Simulador = () => {
  const { setMitigacion } = useMitigacionStore();
  const navigate = useNavigate();

  const [periodo, setPeriodo] = useState("dia");
  const [porcentajeVerde, setPorcentajeVerde] = useState(40); // Empezamos con 40%
  const [numVehiculos, setNumVehiculos] = useState(150);
  const [generando, setGenerando] = useState(false);
  const [datosGenerados, setDatosGenerados] = useState<any>(null);
  const [registros, setRegistros] = useState<Registro[]>([]);

  const modelos = ["Volvo FH Electric", "Mercedes eActros", "Scania 45P", "Tesla Semi", "BYD T8"];
  const empresas = ["TransAndina", "LogiSur", "CargoExpress", "BioTransporte", "VerdeCarga"];

  const compChartRef = useRef<HTMLCanvasElement | null>(null);
  const multiChartRef = useRef<HTMLCanvasElement | null>(null);
  const compChartInstance = useRef<any>(null);
  const multiChartInstance = useRef<any>(null);

  // --- 1. LÓGICA DE GENERACIÓN (CORREGIDA) ---
  const generarRegistros = async () => {
    setGenerando(true);
    try {
      const registrosNuevos: Registro[] = [];

      for (let i = 0; i < numVehiculos; i++) {
        // Determinar tipo basado en el porcentaje seleccionado
        const isVerde = Math.random() * 100 < porcentajeVerde;
        let tipo: "full" | "hibrido" | "diesel" = "diesel";
        let kwatt = 0;
        let kmElec = 0;

        const distancia = (periodo === "dia" ? 150 : periodo === "mes" ? 4500 : 54000) + Math.random() * 50;

        if (isVerde) {
            // 50% probabilidad de ser Full o Híbrido si es verde
            tipo = Math.random() > 0.5 ? "full" : "hibrido";
            // Asignar carga aleatoria entre 200kW y 500kW para que el Hub funcione
            kwatt = Math.floor(200 + Math.random() * 300);
            kmElec = tipo === "full" ? distancia : (distancia * 0.6); // Híbrido usa 60% eléctrico
        }

        const modelo = modelos[Math.floor(Math.random() * modelos.length)];
        const empresa = empresas[Math.floor(Math.random() * empresas.length)];

        registrosNuevos.push({
          modelo_camion: modelo,
          patente: `AE${Math.floor(100 + Math.random() * 900)}CD`,
          empresa,
          tipo,
          distancia_recorrida: Math.round(distancia),
          km_a_recorrer: Math.round(distancia),
          km_electricos: Math.round(kmElec),
          kwatt_carga: kwatt, // ¡IMPORTANTE! Esto es lo que lee el Hub
          fecha_hora: new Date().toISOString(),
        });
      }

      // 1. Guardar en Supabase
      await supabase.from("dataset").insert(registrosNuevos);
      
      // 2. Guardar en LocalStorage (Para que el Hub funcione offline/demo)
      localStorage.setItem("simulacion_offline", JSON.stringify(registrosNuevos));

      setRegistros(registrosNuevos);
      calcularEmisiones(registrosNuevos);

      toast.success(`${registrosNuevos.length} vehículos generados y enviados al Hub`);
    } catch (err) {
      console.error(err);
      toast.error("Error en la simulación");
    } finally {
      setGenerando(false);
    }
  };

  // --- 2. CÁLCULO DE EMISIONES ---
  const calcularEmisiones = (regs: Registro[]) => {
    if (!regs || regs.length === 0) return;

    const totalKm = regs.reduce((acc, r) => acc + r.distancia_recorrida, 0);
    
    // Escenario Base (Todo Diesel)
    const emisionesDiesel = totalKm * EMISION_FACTOR_PER_KM;

    // Escenario Real (Con los vehículos generados)
    const kmElectricosTotales = regs.reduce((acc, r) => acc + r.km_electricos, 0);
    const emisionesReales = (totalKm - kmElectricosTotales) * EMISION_FACTOR_PER_KM;

    const mitigacionVal = emisionesDiesel - emisionesReales;
    const reduccionPct = (mitigacionVal / emisionesDiesel) * 100;

    // Actualizar Store global si existe
    if(setMitigacion) setMitigacion(mitigacionVal);

    setDatosGenerados({
      registros: regs.length,
      emisionesDiesel,
      emisionesReales,
      mitigacion: mitigacionVal,
      reduccionPct,
      totalKm
    });
  };

  // Recalcular si cambian inputs
  useEffect(() => {
    if (registros.length > 0) calcularEmisiones(registros);
  }, [porcentajeVerde, numVehiculos, periodo]);

  // --- 3. GRÁFICAS (Chart.js) ---
  const renderCharts = () => {
    if (!datosGenerados) return;

    // Destruir instancias previas
    if (compChartInstance.current) compChartInstance.current.destroy();
    if (multiChartInstance.current) multiChartInstance.current.destroy();

    // Gráfico 1: Barras Comparativas
    if (compChartRef.current) {
      const ctx = compChartRef.current.getContext("2d");
      if (ctx) {
        compChartInstance.current = new Chart(ctx, {
          type: "bar",
          data: {
            labels: ["Escenario Diesel", "Escenario Actual"],
            datasets: [{
              label: "Emisiones (kg CO₂)",
              data: [datosGenerados.emisionesDiesel, datosGenerados.emisionesReales],
              backgroundColor: ["#ef4444", "#10b981"],
              borderRadius: 8,
            }],
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } },
        });
      }
    }

    // Gráfico 2: Línea de Proyección
    if (multiChartRef.current) {
        const ctxM = multiChartRef.current.getContext("2d");
        if (ctxM) {
          const escenarios = [0, 20, 40, 60, 80, 100];
          const dataPoints = escenarios.map(pct => {
             const kmElec = datosGenerados.totalKm * (pct/100);
             return (datosGenerados.totalKm - kmElec) * EMISION_FACTOR_PER_KM;
          });
  
          multiChartInstance.current = new Chart(ctxM, {
            type: "line",
            data: {
              labels: escenarios.map(e => `${e}%`),
              datasets: [{
                label: "Tendencia de Emisiones",
                data: dataPoints,
                borderColor: "#3b82f6",
                backgroundColor: "rgba(59, 130, 246, 0.2)",
                fill: true,
                tension: 0.4
              }],
            },
            options: { responsive: true, maintainAspectRatio: false },
          });
        }
      }
  };

  useEffect(() => {
    renderCharts();
  }, [datosGenerados]);

  // --- RENDERIZADO VISUAL ---
  return (
    <div className="container mx-auto px-4 pt-32 pb-24 animate-fade-in">
      
      {/* HEADER */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          Simulador de Tránsito Bioceánico
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Genera escenarios de tráfico y visualiza el impacto ambiental de la electrificación en tiempo real.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        
        {/* COLUMNA IZQUIERDA: CONTROLES */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-xl border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" /> Configuración de Flota
              </CardTitle>
              <CardDescription>Ajusta los parámetros de la simulación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Slider Porcentaje */}
              <div className="space-y-3">
                <div className="flex justify-between">
                    <label className="text-sm font-medium">Electrificación</label>
                    <span className="text-sm font-bold text-green-600">{porcentajeVerde}%</span>
                </div>
                <Slider
                  value={[porcentajeVerde]}
                  onValueChange={(v) => setPorcentajeVerde(v[0])}
                  min={0} max={100} step={5}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Diesel</span>
                    <span>Híbrido/Full</span>
                </div>
              </div>

              {/* Input Cantidad */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Volumen de Vehículos</label>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        value={numVehiculos}
                        onChange={(e) => setNumVehiculos(Number(e.target.value))}
                        min={10} max={1000}
                    />
                    <span className="text-sm text-muted-foreground">und.</span>
                </div>
              </div>

              {/* Select Periodo */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Periodo de Análisis</label>
                <select
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="dia">Diario (24h)</option>
                  <option value="mes">Mensual</option>
                  <option value="anio">Anual</option>
                </select>
              </div>

              <Button 
                onClick={generarRegistros} 
                disabled={generando} 
                className="w-full bg-primary hover:bg-primary/90 text-lg py-6"
              >
                {generando ? "Procesando..." : (
                    <>
                        <Play className="w-5 h-5 mr-2 fill-current" /> Generar Escenario
                    </>
                )}
              </Button>

            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="bg-blue-50 border-blue-200">
             <CardContent className="pt-6 flex gap-4">
                <div className="bg-blue-200 p-2 rounded-full h-fit">
                    <Leaf className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                    <h4 className="font-semibold text-blue-900">¿Sabías qué?</h4>
                    <p className="text-sm text-blue-800 mt-1">
                        Al aumentar la electrificación por encima del 40%, la reducción de huella de carbono se vuelve exponencial.
                    </p>
                </div>
             </CardContent>
          </Card>
        </div>

        {/* COLUMNA DERECHA: RESULTADOS */}
        <div className="lg:col-span-2 space-y-6">
           
           {/* KPIs */}
           {datosGenerados ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4">
                <Card className="bg-gradient-to-br from-red-50 to-white border-l-4 border-l-red-500 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Escenario Diesel (Base)</p>
                                <h3 className="text-2xl font-bold text-slate-800 mt-1">
                                    {(datosGenerados.emisionesDiesel / 1000).toFixed(1)} <span className="text-sm font-normal text-slate-500">ton CO₂</span>
                                </h3>
                            </div>
                            <div className="p-2 bg-red-100 rounded text-red-600"><TrendingDown className="w-5 h-5" /></div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-white border-l-4 border-l-green-500 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Impacto Mitigado</p>
                                <h3 className="text-2xl font-bold text-green-700 mt-1">
                                    {(datosGenerados.mitigacion / 1000).toFixed(1)} <span className="text-sm font-normal text-green-600">ton CO₂</span>
                                </h3>
                                <p className="text-xs text-green-600 mt-1 font-semibold">
                                    -{datosGenerados.reduccionPct.toFixed(1)}% de reducción
                                </p>
                            </div>
                            <div className="p-2 bg-green-100 rounded text-green-600"><Leaf className="w-5 h-5" /></div>
                        </div>
                        
                        {/* ==================================================== */}
                        {/* BOTÓN AGREGADO AQUÍ PARA MANTENER LA FUNCIONALIDAD */}
                        {/* ==================================================== */}
                        <div className="mt-4">
                             <button
                                onClick={() => navigate(`/Mapas?mitigacion=${porcentajeVerde}`)}
                                className="w-full py-2 rounded-lg bg-blue-100 text-blue-700 font-medium 
                                           hover:bg-blue-200 transition-colors duration-200 shadow-sm
                                           flex items-center justify-center gap-2"
                              >
                                Ver impacto en el mapa →
                              </button>
                        </div>
                        {/* ==================================================== */}

                    </CardContent>
                </Card>
             </div>
           ) : (
             <div className="h-32 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-400 bg-slate-50">
                Genera una simulación para ver los resultados
             </div>
           )}

           {/* GRÁFICOS */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-md">
                 <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" /> Comparativa Directa
                    </CardTitle>
                 </CardHeader>
                 <CardContent>
                    <div className="h-48 relative">
                        {datosGenerados ? <canvas ref={compChartRef} /> : <div className="flex items-center justify-center h-full text-xs text-muted-foreground">Esperando datos...</div>}
                    </div>
                 </CardContent>
              </Card>

              <Card className="shadow-md">
                 <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                        <TrendingDown className="w-4 h-4" /> Proyección de Escenarios
                    </CardTitle>
                 </CardHeader>
                 <CardContent>
                    <div className="h-48 relative">
                        {datosGenerados ? <canvas ref={multiChartRef} /> : <div className="flex items-center justify-center h-full text-xs text-muted-foreground">Esperando datos...</div>}
                    </div>
                 </CardContent>
              </Card>
           </div>

           {/* DATASET TABLE PREVIEW */}
           <Card className="shadow-md">
              <CardHeader className="flex flex-row items-center justify-between">
                 <CardTitle className="text-lg">Registro de Datos Generados</CardTitle>
                 <Button variant="outline" size="sm" onClick={() => navigate('/reportes')}>
                    <Save className="w-4 h-4 mr-2" /> Ver Reporte Completo
                 </Button>
              </CardHeader>
              <CardContent>
                 <div className="rounded-md border overflow-hidden">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium text-slate-600">Patente</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-600">Tipo</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-600">Empresa</th>
                                <th className="px-4 py-3 text-right font-medium text-slate-600">Carga (kW)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {registros.length > 0 ? (
                                registros.slice(0, 5).map((r, i) => (
                                    <tr key={i} className="hover:bg-slate-50">
                                        <td className="px-4 py-2 font-mono text-xs">{r.patente}</td>
                                        <td className="px-4 py-2">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                                                r.tipo === 'full' ? 'bg-green-100 text-green-700' :
                                                r.tipo === 'hibrido' ? 'bg-blue-100 text-blue-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                                {r.tipo}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-slate-600">{r.empresa}</td>
                                        <td className="px-4 py-2 text-right font-mono">{r.kwatt_carga}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-8 text-slate-400">
                                        Sin registros. Inicia la simulación.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                 </div>
                 {registros.length > 0 && (
                     <p className="text-xs text-center text-muted-foreground mt-2">
                       Mostrando 5 de {registros.length} registros generados.
                     </p>
                 )}
              </CardContent>
           </Card>

        </div>
      </div>
    </div>
  );
};

export default Simulador;
// Simulador.tsx
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Truck, Zap, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Chart from "chart.js/auto";
import { useMitigacionStore } from "@/stores/mitigacionStore";
import { useNavigate } from "react-router-dom";

const presets = [0, 20, 40, 60, 100];

// --- TIPO DE REGISTRO AJUSTADO ---
export type Registro = {
  id?: number;
  modelo_camion: string;
  patente: string;
  empresa: string;
  distancia_recorrida: number;
  tipo: string;
  km_a_recorrer: number;
  km_electricos: number;
  kwatt_carga: number;
  fecha_hora: string;
};

// Parámetros base
const FUEL_L_PER_100KM = 30;
const FUEL_L_PER_KM = FUEL_L_PER_100KM / 100;
const EF_CO2_PER_L = 2.68;
const EMISION_FACTOR_PER_KM = FUEL_L_PER_KM * EF_CO2_PER_L;

const Simulador = () => {
  const { mitigacion, setMitigacion } = useMitigacionStore();
  const navigate = useNavigate();

  const [periodo, setPeriodo] = useState("dia");
  const [porcentajeVerde, setPorcentajeVerde] = useState(20);
  const [numVehiculos, setNumVehiculos] = useState(150);
  const [generando, setGenerando] = useState(false);
  const [datosGenerados, setDatosGenerados] = useState<any>(null);
  const [registros, setRegistros] = useState<Registro[]>([]);

  const modelos = ["Volvo FH", "Mercedes-Benz Actros", "Scania R450", "MAN TGX", "DAF XF"];
  const empresas = ["TransAndina", "LogiSur", "CargoExpress", "BioTransporte", "VerdeCarga"];
  const tipos = ["full", "hibrido", "diesel"];

  const compChartRef = useRef<HTMLCanvasElement | null>(null);
  const multiChartRef = useRef<HTMLCanvasElement | null>(null);
  const compChartInstance = useRef<any>(null);
  const multiChartInstance = useRef<any>(null);

  // --------------------------------------------------
  // FUNCIÓN PARA GENERAR REGISTROS Y CALCULAR EMISIONES
  // --------------------------------------------------
  const generarRegistros = async () => {
    setGenerando(true);
    try {
      const registrosNuevos: Registro[] = [];

      for (let i = 0; i < numVehiculos; i++) {
        const modelo = modelos[Math.floor(Math.random() * modelos.length)];
        const empresa = empresas[Math.floor(Math.random() * empresas.length)];
        const tipo = "diesel"; // todos diesel inicialmente
        const kmBase =
          periodo === "dia"
            ? 150
            : periodo === "mes"
            ? 150 * 30
            : 150 * 365;
        const distancia = kmBase + Math.random() * 30;

        registrosNuevos.push({
          modelo_camion: modelo,
          patente: `AA${Math.floor(100 + Math.random() * 900)}BB`,
          empresa,
          tipo,
          distancia_recorrida: distancia,
          km_a_recorrer: distancia,
          km_electricos: 0,
          kwatt_carga: 0,
          fecha_hora: new Date().toISOString(),
        });
      }

      // Guardar en Supabase
      const { error } = await supabase.from("dataset").insert(registrosNuevos);
      if (error) console.error("Error insertando:", error);

      setRegistros(registrosNuevos);
      calcularEmisiones(registrosNuevos);

      toast.success("Datos generados correctamente");
    } catch (err) {
      console.error(err);
      toast.error("Hubo un error al generar los registros");
    } finally {
      setGenerando(false);
    }
  };

  // --------------------------------------------------
  // CÁLCULO DE EMISIONES
  // --------------------------------------------------
  const calcularEmisiones = (regs: Registro[]) => {
    if (!regs || regs.length === 0) return;

    const totalKm = regs.reduce((acc, r) => acc + r.distancia_recorrida, 0);
    const emisionesDiesel = totalKm * EMISION_FACTOR_PER_KM;

    const electricos = Math.round((porcentajeVerde / 100) * numVehiculos);
    const kmPromedio = totalKm / numVehiculos;
    const kmElectricosTotales = kmPromedio * electricos;

    const emisionesConElectrificacion =
      (totalKm - kmElectricosTotales) * EMISION_FACTOR_PER_KM;

    const mitigacion = Math.abs(emisionesDiesel - emisionesConElectrificacion);

    const reduccionPct = Math.abs((mitigacion / emisionesDiesel) * 100);

    setDatosGenerados({
      registros: regs.length,
      emisionesDiesel,
      emisionesConElectrificacion,
      mitigacion,
      reduccionPct,
      electricos,
      kmElectricosTotales,
      totalKm,
      kmPromedio,
    });
  };

  // --------------------------------------------------
  // RE-CALCULAR SI CAMBIA PORCENTAJE, NUM VEHÍCULOS O PERIODO
  // --------------------------------------------------
  useEffect(() => {
    if (registros.length > 0) {
      calcularEmisiones(registros);
    }
  }, [porcentajeVerde, numVehiculos, periodo]);

  // --------------------------------------------------
  // GRÁFICAS: Comparativa y Multi-escenario
  // --------------------------------------------------
  const renderCharts = () => {
    if (!datosGenerados) return;

    // Comparativa
    if (compChartInstance.current) compChartInstance.current.destroy();
    if (compChartRef.current) {
      const ctx = compChartRef.current.getContext("2d");
      if (ctx) {
        compChartInstance.current = new Chart(ctx, {
          type: "bar",
          data: {
            labels: ["Diesel", "Proyectado"],
            datasets: [
              {
                label: "Emisiones (kg CO₂)",
                data: [datosGenerados.emisionesDiesel, datosGenerados.emisionesConElectrificacion],
                backgroundColor: ["#ef4444", "#10b981"],
              },
            ],
          },
          options: { responsive: true, maintainAspectRatio: false },
        });
      }
    }

    // Multi-escenario
    const escenarios = [20, 40, 60, 100];
    const emisionesEscenarios = escenarios.map((pct) => {
      const elec = Math.round((pct / 100) * numVehiculos);
      return (datosGenerados.totalKm - (datosGenerados.totalKm / numVehiculos) * elec) * EMISION_FACTOR_PER_KM;
    });

    if (multiChartInstance.current) multiChartInstance.current.destroy();
    if (multiChartRef.current) {
      const ctxM = multiChartRef.current.getContext("2d");
      if (ctxM) {
        multiChartInstance.current = new Chart(ctxM, {
          type: "line",
          data: {
            labels: escenarios.map((e) => `${e}%`),
            datasets: [
              { label: "Emisiones según electrificación", data: emisionesEscenarios, borderColor: "#10b981", backgroundColor: "#a7f3d0" },
            ],
          },
          options: { responsive: true, maintainAspectRatio: false },
        });
      }
    }
  };

  useEffect(() => {
    renderCharts();
  }, [datosGenerados, porcentajeVerde]);

  // --------------------------------------------------
  // RENDER VISUAL (del segundo código)
  // --------------------------------------------------
  return (
    <div className="container mx-auto px-4 py-24 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Simulador de Tránsito y Emisiones
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Genera datos de tráfico bioceánico y calcula el impacto ambiental en tiempo real
          </p>
        </div>

        <Card className="mb-8 shadow-lg p-6">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Truck className="w-6 h-6 text-primary" />
              Generador de Vehículos
            </CardTitle>
            <CardDescription>
              Selecciona la cantidad de vehículos a simular y ajusta el escenario
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* FILA: PERIODO + PORCENTAJE DE FLOTA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div className="space-y-2">
                <label className="text-sm font-medium">Periodo</label>
                <select
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                  className="w-full p-2 border rounded-md bg-background"
                >
                  <option value="dia">Día</option>
                  <option value="mes">Mes</option>
                  <option value="anio">Año</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  Calcula las emisiones según el período seleccionado.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Porcentaje de flota electrificada</label>
                
                <Slider
                  value={[porcentajeVerde]}
                  onValueChange={(v) => setPorcentajeVerde(v[0])}
                  min={0}
                  max={100}
                />

                <p className="text-sm font-bold text-primary mt-1">
                  {porcentajeVerde}%
                </p>
                <p className="text-xs text-muted-foreground">
                  Puedes mover libremente entre 0% y 100%
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Cantidad de vehículos:</span>
                {/*<span className="text-xl font-bold text-primary">{numVehiculos}</span>*/}
                <input
                  type="number"
                  className="w-full p-2 border rounded-md bg-background"
                  value={numVehiculos}
                  onChange={(e) => setNumVehiculos(Number(e.target.value))}
                  min={0}
                />
              </div>
            </div>

            <Button
              onClick={generarRegistros}
              disabled={generando}
              className="w-full"
              size="lg"
            >
              {generando ? "Generando..." : "Generar Simulación"}
            </Button>
          </CardContent>
        </Card>

        {/* KPIs y gráficas */}
        {datosGenerados && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up">
              {/* Total camiones */}
              <Card className="shadow-md hover:shadow-glow transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Truck className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total camiones</p>
                      <p className="text-2xl font-bold text-foreground">
                        {datosGenerados.registros}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Emisiones Diesel */}
              <Card className="shadow-md hover:shadow-glow transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-destructive/10 rounded-lg">
                      <TrendingDown className="w-6 h-6 text-destructive" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Emisiones Diesel (kg)</p>
                      <p className="text-lg font-bold text-foreground">
                        {datosGenerados.emisionesDiesel.toFixed(2)} kg CO₂
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Emisiones proyectadas */}
              <Card className="shadow-md hover:shadow-glow transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-success/10 rounded-lg">
                      <Zap className="w-6 h-6 text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Emisiones proyectadas</p>
                      <p className="text-lg font-bold text-foreground">
                        {datosGenerados.emisionesConElectrificacion.toFixed(2)} kg CO₂
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CO₂ mitigado + botón */}
              <div className="col-span-full md:col-span-2 lg:col-span-1">
                <Card className="shadow-md hover:shadow-glow transition-shadow duration-300 bg-gradient-accent">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-white/30 rounded-lg">
                        <TrendingDown className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-primary-foreground">CO₂ Mitigado total (kg)</p>
                        <p className="text-2xl font-bold text-primary-foreground">
                          {datosGenerados.mitigacion.toFixed(2)} kg
                        </p>
                      </div>
                    </div>

                    {/* Botón*/}
                    {porcentajeVerde !== null && (
                      <button
                        onClick={() => {
                          window.location.href = `/Mapas?mitigacion=${porcentajeVerde}`;
                        }}
                        className="w-full py-2 rounded-lg bg-blue-100 text-blue-700 font-medium 
                                  hover:bg-blue-100 transition-colors duration-200 shadow-sm"
                      >
                        Ver impacto en el mapa →
                      </button>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Gráficas comparativa y multi-escenario */}
            <section className="mt-8 bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Comparativa: Actual vs {porcentajeVerde}% eléctricos</h2>
              <div style={{ height: 220 }} className="relative">
                <canvas ref={compChartRef} id="compChart" />
              </div>
            </section>

            <section className="mt-8 bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Escenarios 20% / 40% / 60% / 100%</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {[20, 40, 60, 100].map((p) => {
                  const proj = (datosGenerados.totalKm - (datosGenerados.totalKm / numVehiculos) * Math.round((p / 100) * numVehiculos)) * EMISION_FACTOR_PER_KM;
                  return (
                    <div key={p} className="p-4 rounded-lg border">
                      <div className="text-sm text-gray-500">{p}% eléctricos</div>
                      <div className="mt-2 text-xl font-bold">{proj.toFixed(2)} kg</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ height: 260 }} className="relative">
                <canvas ref={multiChartRef} id="multiChart" />
              </div>
            </section>
          </>
        )}

        {/* Tabla de registros */}
        {registros.length > 0 && (
          <section className="mt-8 bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Registros (muestra parcial)</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Fecha</th>
                    <th className="px-3 py-2 text-left">Camión</th>
                    <th className="px-3 py-2 text-left">Empresa</th>
                    <th className="px-3 py-2 text-left">Tipo</th>
                    <th className="px-3 py-2 text-right">Distancia (km)</th>
                    <th className="px-3 py-2 text-right">CO₂ mitigado (kg)</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {registros.slice(0, 20).map((c, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2">{c.fecha_hora}</td>
                      <td className="px-3 py-2">{c.modelo_camion}</td>
                      <td className="px-3 py-2">{c.empresa}</td>
                      <td className="px-3 py-2">{c.tipo}</td>
                      <td className="px-3 py-2 text-right">{c.distancia_recorrida}</td>
                      <td className="px-3 py-2 text-right">{((c.distancia_recorrida - c.km_electricos) * EMISION_FACTOR_PER_KM).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Simulador;

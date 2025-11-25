import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, Clock, TrendingUp, BarChart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart as RechartsBar,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const Beneficios = () => {
  const [beneficiosData, setBeneficiosData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarBeneficios();
  }, []);

  const cargarBeneficios = async () => {
    try {
      const { data, error } = await supabase
        .from("dataset")
        .select("*");

      if (error) throw error;

      // Calcular beneficios económicos
      const salarioPorHora = 2500; // Pesos argentinos aproximados
      let beneficioTotal = 0;
      let beneficioHibridos = 0;
      let beneficioFull = 0;

      const tiposCamiones = {
        diesel: 0,
        hibrido: 0,
        full: 0,
      };

      data.forEach((registro: any) => {
        if (registro.tipo !== "diesel") {
          const horasAhorradas = Math.random() * 2 + 1; // 1-3 horas
          const ahorro = horasAhorradas * salarioPorHora;
          beneficioTotal += ahorro;

          if (registro.tipo === "hibrido") {
            beneficioHibridos += ahorro;
            tiposCamiones.hibrido++;
          } else {
            beneficioFull += ahorro;
            tiposCamiones.full++;
          }
        } else {
          tiposCamiones.diesel++;
        }
      });

      const chartData = [
        {
          tipo: "Diesel",
          cantidad: tiposCamiones.diesel,
          ahorro: 0,
        },
        {
          tipo: "Híbridos",
          cantidad: tiposCamiones.hibrido,
          ahorro: beneficioHibridos,
        },
        {
          tipo: "Full Eléctricos",
          cantidad: tiposCamiones.full,
          ahorro: beneficioFull,
        },
      ];

      const proyeccionData = [
        { periodo: "Día", monto: beneficioTotal },
        { periodo: "Semana", monto: beneficioTotal * 7 },
        { periodo: "Mes", monto: beneficioTotal * 30 },
        { periodo: "Año", monto: beneficioTotal * 365 },
      ];

      setBeneficiosData({
        beneficioTotal,
        beneficioHibridos,
        beneficioFull,
        chartData,
        proyeccionData,
        totalCamiones: data.length,
      });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 flex items-center justify-center">
        <div className="animate-pulse text-lg text-muted-foreground">Cargando datos...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Cuantificación de Beneficios Económicos
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Análisis del ahorro operativo y reducción de tiempos en el corredor bioceánico
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-lg hover:shadow-glow transition-shadow duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ahorro Diario Total</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${beneficiosData?.beneficioTotal.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-glow transition-shadow duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <Clock className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ahorro Híbridos</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${beneficiosData?.beneficioHibridos.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-glow transition-shadow duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-success/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ahorro Full Eléctricos</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${beneficiosData?.beneficioFull.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="w-6 h-6 text-primary" />
                Distribución por Tipo de Vehículo
              </CardTitle>
              <CardDescription>Cantidad y ahorro por categoría</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBar data={beneficiosData?.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tipo" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="cantidad" fill="hsl(var(--primary))" name="Cantidad" />
                  <Bar dataKey="ahorro" fill="hsl(var(--accent))" name="Ahorro ($)" />
                </RechartsBar>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-success" />
                Proyección de Ahorros
              </CardTitle>
              <CardDescription>Estimación a corto y largo plazo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={beneficiosData?.proyeccionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="periodo" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="monto" 
                    stroke="hsl(var(--success))" 
                    strokeWidth={3}
                    name="Ahorro ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Beneficios;

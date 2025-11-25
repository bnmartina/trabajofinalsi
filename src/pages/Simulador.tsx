import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Truck, Zap, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Simulador = () => {
  const [numVehiculos, setNumVehiculos] = useState([100]);
  const [generando, setGenerando] = useState(false);
  const [datosGenerados, setDatosGenerados] = useState<any>(null);

  const modelos = ["Volvo FH", "Mercedes-Benz Actros", "Scania R450", "MAN TGX", "DAF XF"];
  const empresas = ["TransAndina", "LogiSur", "CargoExpress", "BioTransporte", "VerdeCarga"];
  const tipos = ["full", "hibrido", "diesel"];

  const generarRegistros = async () => {
    setGenerando(true);
    try {
      const registros = [];
      const cantidad = numVehiculos[0];

      for (let i = 0; i < cantidad; i++) {
        const tipo = tipos[Math.floor(Math.random() * tipos.length)];
        const distancia = Math.floor(Math.random() * 800) + 200;
        const kmElectricos = tipo === "diesel" ? 0 : tipo === "full" ? distancia : Math.floor(distancia * 0.6);
        
        const registro = {
          modelo_camion: modelos[Math.floor(Math.random() * modelos.length)],
          patente: `ABC${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          empresa: empresas[Math.floor(Math.random() * empresas.length)],
          distancia_recorrida: distancia,
          tipo,
          km_a_recorrer: distancia,
          km_electricos: kmElectricos,
          kwatt_carga: kmElectricos > 0 ? kmElectricos * 1.2 : 0,
        };
        
        registros.push(registro);
      }

      // Insertar en la base de datos
      const { error } = await supabase.from("dataset").insert(registros);

      if (error) throw error;

      // Calcular emisiones
      const emisionesEstandar = registros.reduce((acc, r) => {
        return acc + (r.distancia_recorrida * 0.35 * 2.61);
      }, 0);

      const mitigacionTotal = registros.reduce((acc, r) => {
        const kmDiesel = r.distancia_recorrida - r.km_electricos;
        return acc + (kmDiesel * 0.35 * 2.61);
      }, 0);

      const ahorro = emisionesEstandar - mitigacionTotal;
      const porcentajeAhorro = ((ahorro / emisionesEstandar) * 100).toFixed(2);

      setDatosGenerados({
        registros: cantidad,
        emisionesEstandar: emisionesEstandar.toFixed(2),
        mitigacionTotal: mitigacionTotal.toFixed(2),
        ahorro: ahorro.toFixed(2),
        porcentajeAhorro,
      });

      toast.success(`¡${cantidad} registros generados exitosamente!`);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al generar registros");
    } finally {
      setGenerando(false);
    }
  };

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

        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-6 h-6 text-primary" />
              Generador de Vehículos
            </CardTitle>
            <CardDescription>
              Selecciona la cantidad de vehículos a simular (1-1000)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Cantidad de vehículos:</span>
                <span className="text-2xl font-bold text-primary">{numVehiculos[0]}</span>
              </div>
              <Slider
                value={numVehiculos}
                onValueChange={setNumVehiculos}
                min={1}
                max={1000}
                step={1}
                className="w-full"
              />
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

        {datosGenerados && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up">
            <Card className="shadow-md hover:shadow-glow transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Truck className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Vehículos</p>
                    <p className="text-2xl font-bold text-foreground">{datosGenerados.registros}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-glow transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-destructive/10 rounded-lg">
                    <TrendingDown className="w-6 h-6 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Emisiones Estándar</p>
                    <p className="text-lg font-bold text-foreground">{datosGenerados.emisionesEstandar} kg CO₂</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-glow transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-success/10 rounded-lg">
                    <Zap className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Con Mitigación</p>
                    <p className="text-lg font-bold text-foreground">{datosGenerados.mitigacionTotal} kg CO₂</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-glow transition-shadow duration-300 bg-gradient-accent">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-card rounded-lg">
                    <TrendingDown className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-primary-foreground">Reducción</p>
                    <p className="text-2xl font-bold text-primary-foreground">{datosGenerados.porcentajeAhorro}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Simulador;

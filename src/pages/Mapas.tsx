import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, ZoomControl, Pane, useMap } from "react-leaflet";
//import { MapContainer, TileLayer, ZoomControl, Polygon, Pane, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";
import { useSearchParams } from "react-router-dom";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type TileInfo = {
  template: string;
  min?: number;
  max?: number;
  legendHtml?: string;
  stats?: any;
  bounds?: any;
};

const ARG_BOUNDS: [number, number, number, number] = [-73.6, -55.1, -53.6, -21.8];
const JUJUY_CENTER: [number, number] = [-23.5, -65.0];
const JUJUY_ZOOM = 8;
const ARG_BOUNDS_LEAFLET: [[number, number], [number, number]] = [
  [ARG_BOUNDS[1], ARG_BOUNDS[0]],
  [ARG_BOUNDS[3], ARG_BOUNDS[2]]
];

function TemperatureTooltip() {
  const map = useMap();
  const [temperature, setTemperature] = useState<string | null>(null);
  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: any) => {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      const simulatedTemp = (Math.sin(lat * 0.5) * Math.cos(lng * 0.3) * 3.5 + 2.0).toFixed(1);
      setTemperature(`${simulatedTemp}°C`);
    };

    map.on('mousemove', handleMouseMove);
    map.on('mouseout', () => {
      setTemperature(null);
      setPosition(null);
    });

    return () => {
      map.off('mousemove', handleMouseMove);
      map.off('mouseout');
    };
  }, [map]);

  if (!temperature || !position) return null;

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded-lg shadow-lg px-3 py-2 z-[1000]">
      <div className="text-sm font-semibold text-gray-800">
        📍 Anomalía: <span className="text-blue-600">{temperature}</span>
      </div>
      <div className="text-xs text-gray-500">
        Lat: {position[0].toFixed(3)}, Lng: {position[1].toFixed(3)}
      </div>
    </div>
  );
}

export default function Mapas() {
  const [params] = useSearchParams();
  const mitigacionURL = Number(params.get("mitigacion"));
  const mitigacion = !isNaN(mitigacionURL) ? mitigacionURL : 0;
  const [baseTile, setBaseTile] = useState<TileInfo | null>(null);
  const [mitigatedTile, setMitigatedTile] = useState<TileInfo | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchTile(scenario: "base" | "mitigated", percent?: number) {
    const qs = new URLSearchParams();
    qs.set("scenario", scenario);
    qs.set("year", "2050");
    if (percent !== undefined) qs.set("mitigation", String(percent));
    const API_BASE = 'http://localhost:8000';
    const url = `${API_BASE}/api/gee/map?${qs.toString()}`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Error fetching tile info");
      const data = await res.json();
      return data as TileInfo;
    } catch (error) {
      console.error("Error en fetchTile:", error);
      throw error;
    }
  }

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([fetchTile("base"), fetchTile("mitigated", mitigacion)])
      .then(([base, mitigated]) => {
        if (!mounted) return;
        setBaseTile(base);
        setMitigatedTile(mitigated);
      })
      .catch((err) => {
        console.error("Error en useEffect:", err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [mitigacion]);

  // ---------- Estadísticas robustas: preferir stats.mean si existe ----------
  const computeStats = () => {
    // preferir mean devuelto por backend
    const baseMeanFromStats = baseTile?.stats?.mean;
    const mitMeanFromStats = mitigatedTile?.stats?.mean;

    if (baseMeanFromStats != null || mitMeanFromStats != null) {
      // si backend devolvió mean(s), úsalos (y si falta uno, se estima con mitigacion)
      const baseMean = baseMeanFromStats != null ? Number(baseMeanFromStats) : 2.5;
      let mitMean = mitMeanFromStats != null ? Number(mitMeanFromStats) : baseMean * (1 - mitigacion / 100);
      return {
        baseMean: Number(baseMean.toFixed(2)),
        mitMean: Number(mitMean.toFixed(2))
      };
    }

    // Si no hay mean, usar min/max si existen
    const baseMinValid = baseTile?.min != null;
    const baseMaxValid = baseTile?.max != null;
    const mitMinValid = mitigatedTile?.min != null;
    const mitMaxValid = mitigatedTile?.max != null;

    const baseMean = baseMinValid && baseMaxValid
      ? (baseTile!.min! + baseTile!.max!) / 2
      : 2.5;

    const mitMean = mitMinValid && mitMaxValid
      ? (mitigatedTile!.min! + mitigatedTile!.max!) / 2
      : baseMean * (1 - mitigacion / 100);

    return {
      baseMean: Number((baseMean ?? 2.5).toFixed(2)),
      mitMean: Number((mitMean ?? (baseMean * (1 - mitigacion / 100))).toFixed(2)),
    };
  };

  const stats = computeStats();
  const reductionPercent = stats.baseMean !== 0
    ? Number(((stats.baseMean - stats.mitMean) / stats.baseMean * 100).toFixed(1))
    : 0.0;

  const barData = {
    labels: ["Sin mitigación (RCP8.5)", `Mitigado (${mitigacion}%)`],
    datasets: [
      {
        label: "Anomalía proyectada (°C) promedio - 2050",
        data: [stats.baseMean, stats.mitMean],
        backgroundColor: ['rgba(255,107,107,0.7)', 'rgba(78,205,196,0.7)'],
        borderColor: ['rgba(255,82,82,0.9)', 'rgba(38,166,154,0.9)'],
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `Anomalía: ${context.parsed.y}°C`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Anomalía (°C)' }
      }
    }
  };

  return (
    //<div id="mapas-root" className="p-4 max-w-[1200px] mx-auto" style={{ paddingTop: 80, position: "relative" }}>
    <div id="mapas-root" className="max-w-[1200px] mx-auto"
     style={{ paddingTop: "110px", paddingLeft: "1rem", paddingRight: "1rem" }}>

      <div className="text-center mb-12">
          <h2 className="text-4xl md:text-3xl font-bold text-foreground mb-4">
            Comparación de escenarios de anomalías térmicas — Provincia de Jujuy (2050)
          </h2>
          <p className="text-lg text-muted-foreground max-w-1xl mx-auto">
            Izquierda: escenario BAU (sin mitigación). Derecha: escenario mitigado según el % seleccionado.
          </p>
        </div>

      {loading && <div className="mb-4 text-sm text-gray-500">Actualizando mapas…</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 grid grid-cols-2 gap-2">
          {/* Mapa Base */}
          <div className="border rounded overflow-hidden relative">
            <div className="p-2 bg-white/80 border-b">
              <strong>Sin mitigación — RCP8.5 (2050)</strong>
            </div>
            <div className="h-[450px]">
              <MapContainer className="w-full h-full" center={JUJUY_CENTER} zoom={JUJUY_ZOOM} style={{ height: "100%", width: "100%" }} zoomControl={false} bounds={ARG_BOUNDS_LEAFLET}>
                <ZoomControl position="topright" />
                <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Pane name="anomalyPane" style={{ zIndex: 400 }}>
                  {baseTile && (
                    <TileLayer url={baseTile.template} opacity={0.5} bounds={ARG_BOUNDS_LEAFLET} keepBuffer={2} noWrap={false} />
                  )}
                </Pane>
                <TemperatureTooltip />
              </MapContainer>
            </div>
          </div>

          {/* Mapa Mitigado */}
          <div className="border rounded overflow-hidden relative">
            <div className="p-2 bg-white/80 border-b">
              <strong>Escenario mitigado — {mitigacion}% reducción (2050)</strong>
            </div>
            <div className="h-[450px]">
              <MapContainer className="w-full h-full" center={JUJUY_CENTER} zoom={JUJUY_ZOOM} style={{ height: "100%", width: "100%" }} zoomControl={false} bounds={ARG_BOUNDS_LEAFLET}>
                <ZoomControl position="topright" />
                <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Pane name="anomalyPaneMit" style={{ zIndex: 400 }}>
                  {mitigatedTile && (
                    <TileLayer url={mitigatedTile.template} opacity={0.5} bounds={ARG_BOUNDS_LEAFLET} keepBuffer={2} noWrap={false} />
                  )}
                </Pane>
                <TemperatureTooltip />
              </MapContainer>
            </div>
          </div>
        </div>

        {/* Columna derecha: gráfico y leyenda */}
        <div className="border rounded p-3 bg-white h-[500px] flex flex-col">
          <h3 className="text-sm font-medium mb-2">Resumen de Anomalías Térmicas</h3>

          <div className="mb-4 flex-1 min-h-[180px]">
            <Bar data={barData} options={barOptions} />
          </div>

          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <strong className="text-sm block mb-2">Valores estimados</strong>
            <div className="text-sm text-gray-700 space-y-1">
              <div className="flex justify-between">
                <span>Sin mitigación:</span>
                <strong className="text-red-600">{stats.baseMean} °C</strong>
              </div>
              <div className="flex justify-between">
                <span>Mitigado ({mitigacion}%):</span>
                <strong className="text-green-600">{stats.mitMean} °C</strong>
              </div>
              <div className="flex justify-between border-t pt-1 mt-1">
                <span>Reducción:</span>
                <strong className="text-blue-600">{reductionPercent}%</strong>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <strong className="text-sm block mb-2">Leyenda (anomalía °C)</strong>
            <div className="text-xs text-gray-600 mb-2">Colores: azul (menos aumento) → rojo (más aumento)</div>
            {baseTile?.legendHtml || mitigatedTile?.legendHtml ? (
              <div className="mt-2 text-xs" dangerouslySetInnerHTML={{ __html: baseTile?.legendHtml || mitigatedTile?.legendHtml || "" }} />
            ) : (
              <div className="mt-2 text-sm text-gray-500 p-2 bg-gray-100 rounded">Leyenda no disponible</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

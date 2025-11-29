import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Trees, Zap, DollarSign, Cloud, CloudOff, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { saveAs } from "file-saver";

// Asegúrate de haber instalado: npm install jspdf jspdf-autotable xlsx
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

type Camion = {
  id?: string;
  modelo_camion: string;
  patente: string;
  empresa: string;
  tipo: "diesel" | "full" | "hibrido";
  distancia_recorrida: number;
  km_electricos: number;
  kwatt_carga: number;
  fecha_hora: string;
};

// Mock de Supabase para evitar errores si no está configurado aún o falla la conexión
const supabaseMock = {
  from: (_table: string) => ({
    select: (_cols: string) => ({
      order: (_col: string, _opts: any) => Promise.resolve({ data: null, error: "Mock Mode" })
    })
  })
};

const Reportes = () => {
  const [camiones, setCamiones] = useState<Camion[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [empresaFiltro, setEmpresaFiltro] = useState("todas");

  // Datos de ejemplo
  const datosEjemplo: Camion[] = [
    { modelo_camion: "Volvo FH", patente: "AA123BB", empresa: "Logística Norte", tipo: "full", distancia_recorrida: 150, km_electricos: 150, kwatt_carga: 120, fecha_hora: "2025-01-15T10:00:00" },
    { modelo_camion: "Scania R", patente: "CC456DD", empresa: "TransAndino", tipo: "hibrido", distancia_recorrida: 200, km_electricos: 100, kwatt_carga: 80, fecha_hora: "2025-02-10T14:30:00" },
    { modelo_camion: "Mercedes Actros", patente: "EE789FF", empresa: "Logística Norte", tipo: "diesel", distancia_recorrida: 300, km_electricos: 0, kwatt_carga: 0, fecha_hora: "2025-03-05T09:15:00" },
    { modelo_camion: "Tesla Semi", patente: "GG111HH", empresa: "EcoTrans", tipo: "full", distancia_recorrida: 250, km_electricos: 250, kwatt_carga: 200, fecha_hora: "2025-04-20T16:45:00" },
    { modelo_camion: "Volvo FH", patente: "II222JJ", empresa: "TransAndino", tipo: "hibrido", distancia_recorrida: 180, km_electricos: 90, kwatt_carga: 70, fecha_hora: "2025-05-12T11:20:00" },
  ];

  const cargarDatos = async () => {
    setLoading(true);
    let data = null;
    let error = null;

    try {
      // Intenta usar Supabase real. Si falla, usa el mock.
      // Si tienes supabase configurado correctamente, esta línea funcionará.
      const { data: sbData, error: sbError } = await supabase.from("dataset").select("*").order("fecha_hora", { ascending: true });
      data = sbData;
      error = sbError;

      if (!error && data && data.length > 0) {
        setCamiones(data);
        setIsOnline(true);
        toast.success(`${data.length} registros cargados`);
      }
    } catch {
       // Si falla supabase real, intentamos mock (o simplemente pasamos al fallback)
    }

    if (!data || data.length === 0) {
      const local = localStorage.getItem("simulacion_offline");
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (parsed.length > 0) {
            setCamiones(parsed);
            setIsOnline(false);
            toast.info(`Modo offline: ${parsed.length} registros locales`);
          } else {
            setCamiones(datosEjemplo);
             setIsOnline(false);
          }
        } catch {
          setCamiones(datosEjemplo);
          setIsOnline(false);
        }
      } else {
        setCamiones(datosEjemplo);
        setIsOnline(false);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const empresas = [...new Set(camiones.map(c => c.empresa))];
  const filtrados = empresaFiltro === "todas" ? camiones : camiones.filter(c => c.empresa === empresaFiltro);

  const fechas = camiones.map(c => parseISO(c.fecha_hora.split("T")[0]));
  const fechaInicio = fechas.length > 0 ? format(new Date(Math.min(...fechas.map(d => d.getTime()))), 'dd/MM/yyyy') : "—";
  const fechaFin = fechas.length > 0 ? format(new Date(Math.max(...fechas.map(d => d.getTime()))), 'dd/MM/yyyy') : "—";
  const rangoFechas = fechaInicio === fechaFin ? fechaInicio : `${fechaInicio} al ${fechaFin}`;

  const totalKMElectricos = filtrados.reduce((a, c) => a + c.km_electricos, 0);
  const totalEnergia = filtrados.reduce((a, c) => a + c.kwatt_carga, 0);
  const co2Ahorrado = Math.round(totalKMElectricos * 0.45);
  const ahorroPesos = Math.round(totalKMElectricos * 480);

  const dataMensual = Array.from({ length: 12 }, (_, i) => {
    const mes = String(i + 1).padStart(2, '0');
    const delMes = filtrados.filter(c => c.fecha_hora.includes(`-${mes}-`));
    const co2Mes = delMes.reduce((acc, c) => acc + c.km_electricos * 0.45, 0);
    return {
      mes: new Date(2025, i, 1).toLocaleString('es', { month: 'short' }),
      co2: Math.round(co2Mes),
      kwh: delMes.reduce((acc, c) => acc + c.kwatt_carga, 0)
    };
  }).filter(d => d.co2 > 0 || d.kwh > 0);

  const porTipo = filtrados.reduce((acc, c) => {
    acc[c.tipo] = (acc[c.tipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dataTipo = Object.entries(porTipo).map(([k, v]) => ({
    name: k === "full" ? "100% Eléctrico" : k === "hibrido" ? "Híbrido" : "Diésel",
    value: v,
    color: k === "full" ? "#10b981" : k === "hibrido" ? "#3b82f6" : "#ef4444"
  }));

  const dataEmpresas = empresas.map(e => ({
    empresa: e,
    kwh: filtrados.filter(c => c.empresa === e).reduce((a, c) => a + c.kwatt_carga, 0)
  }));

  const exportarPDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const width = doc.internal.pageSize.getWidth();
    
    // Encabezado
    doc.setFontSize(22);
    doc.setTextColor(34, 139, 34);
    doc.text("Reporte Oficial SID-Bio", width / 2, 25, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Corredor Bioceánico - Electrificación de Carga`, width / 2, 35, { align: 'center' });
    doc.text(`Período: ${rangoFechas}`, width / 2, 43, { align: 'center' });
    doc.text(`Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, width / 2, 50, { align: 'center' });

    // KPIs
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(`CO₂ Ahorrado: ${co2Ahorrado.toLocaleString()} kg`, 20, 70);
    doc.text(`Energía Consumida: ${totalEnergia.toLocaleString()} kWh`, 20, 80);
    doc.text(`Ahorro Económico: $${ahorroPesos.toLocaleString()}`, 20, 90);

    // Tabla de datos
    const tabla = filtrados.slice(0, 50).map(c => [
        format(parseISO(c.fecha_hora.split("T")[0]), 'dd/MM/yyyy'),
        c.patente,
        c.empresa,
        c.tipo.toUpperCase(),
        c.km_electricos.toString(),
        c.kwatt_carga.toString()
    ]);

    (doc as any).autoTable({
        head: [['Fecha', 'Patente', 'Empresa', 'Tipo', 'Km Elec', 'kWh']],
        body: tabla,
        startY: 100,
        theme: 'grid',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [34, 139, 34] }
    });

    doc.save(`Reporte_SIDBio.pdf`);
    toast.success("PDF generado exitosamente");
  };

  const exportarExcel = () => {
    // AQUÍ ESTABA EL ERROR: He reemplazado los (...) por el mapeo real de datos
    const datos = filtrados.map(c => ({
      Fecha: format(parseISO(c.fecha_hora.split("T")[0]), 'dd/MM/yyyy'),
      Patente: c.patente,
      Empresa: c.empresa,
      Tipo: c.tipo,
      "Modelo Camión": c.modelo_camion,
      "Km Recorridos": c.distancia_recorrida,
      "Km Eléctricos": c.km_electricos,
      "kWh Cargados": c.kwatt_carga,
      "CO2 Ahorrado (kg)": Math.round(c.km_electricos * 0.45)
    }));

    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte Completo");
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buffer]), `Reporte_SIDBio_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);
    toast.success("Excel generado exitosamente");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-20"><RefreshCw className="w-16 h-16 animate-spin text-primary" /></div>;

  return (
    <div className="container mx-auto px-4 pt-32 pb-12 max-w-7xl animate-fade-in">
      
      {/* Header + Rango */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-5xl font-bold mb-3">Reportes SID-Bio</h1>
          <p className="text-xl flex items-center gap-3">
            {isOnline ? <Cloud className="text-green-500" /> : <CloudOff className="text-orange-500" />}
            <span>{camiones.length} registros • {rangoFechas}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={cargarDatos}><RefreshCw className="mr-2" /> Recargar Datos</Button>
        </div>
      </div>

      {/* Filtros + Export */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <p className="text-lg font-semibold mb-3">Filtrar por empresa:</p>
          <div className="flex flex-wrap gap-3">
            <Button variant={empresaFiltro === "todas" ? "default" : "outline"} onClick={() => setEmpresaFiltro("todas")}>Todas</Button>
            {empresas.map(e => (
              <Button key={e} variant={empresaFiltro === e ? "default" : "outline"} onClick={() => setEmpresaFiltro(e)}>{e}</Button>
            ))}
          </div>
        </div>
        <div className="flex gap-4">
          <Button onClick={exportarPDF} size="lg" className="font-bold"><Download className="mr-2" /> PDF</Button>
          <Button onClick={exportarExcel} variant="outline" size="lg" className="font-bold"><Download className="mr-2" /> Excel</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-300">
          <CardHeader><CardTitle className="flex items-center gap-3 text-green-800"><Trees className="w-10 h-10" /> CO₂ Ahorrado</CardTitle><p className="text-sm opacity-80">{rangoFechas}</p></CardHeader>
          <CardContent><p className="text-5xl font-bold text-green-700">{co2Ahorrado.toLocaleString()} kg</p></CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300">
          <CardHeader><CardTitle className="flex items-center gap-3 text-blue-800"><Zap className="w-10 h-10" /> Energía Consumida</CardTitle><p className="text-sm opacity-80">{rangoFechas}</p></CardHeader>
          <CardContent><p className="text-5xl font-bold text-blue-700">{totalEnergia.toLocaleString()} kWh</p></CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-300">
          <CardHeader><CardTitle className="flex items-center gap-3 text-emerald-800"><DollarSign className="w-10 h-10" /> Ahorro Económico</CardTitle><p className="text-sm opacity-80">{rangoFechas}</p></CardHeader>
          <CardContent><p className="text-5xl font-bold text-emerald-700">${ahorroPesos.toLocaleString()}</p></CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <Card>
          <CardHeader><CardTitle>Distribución de Flota</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie data={dataTipo} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
                  {dataTipo.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Energía por Empresa</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={dataEmpresas}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="empresa" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(v: any) => `${v.toLocaleString()} kWh`} />
                <Bar dataKey="kwh" fill="#06b6d4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* GRÁFICO MENSUAL */}
      {dataMensual.length > 0 && (
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Evolución Mensual de CO₂ Ahorrado</CardTitle>
            <p className="text-sm text-muted-foreground">Impacto ambiental acumulado por mes</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={dataMensual}>
                <CartesianGrid strokeDasharray="5 5" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(v: any) => `${v.toLocaleString()} kg CO₂`} />
                <Line type="monotone" dataKey="co2" stroke="#10b981" strokeWidth={5} dot={{ fill: '#10b981', r: 8 }} activeDot={{ r: 10 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Reportes;
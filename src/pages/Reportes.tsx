import React from 'react';
import { FileText, Download, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/components_ui';

const Reportes = () => {
  const generarPDF = () => toast.info("Función de exportación a PDF en desarrollo");
  const generarExcel = () => toast.info("Función de exportación a Excel en desarrollo");

  return (
    <div className="container mx-auto px-4 py-24 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-start mb-12">
            <div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                    Reportes y Análisis
                </h1>
                <p className="text-lg text-gray-500 max-w-2xl">
                    Panel exclusivo para miembros registrados. Generación de informes y análisis del sistema de descarbonización.
                </p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Reporte Emisiones */}
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                Reporte de Emisiones
              </CardTitle>
              <CardDescription>Análisis completo de CO₂ mitigado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500">Incluye comparativas entre escenarios y métricas ambientales.</p>
              <div className="flex gap-2">
                <Button onClick={generarPDF} className="flex-1 bg-blue-600"><Download className="w-4 h-4 mr-2" /> PDF</Button>
                <Button onClick={generarExcel} variant="outline" className="flex-1"><Download className="w-4 h-4 mr-2" /> Excel</Button>
              </div>
            </CardContent>
          </Card>

          {/* Card Reporte Energético */}
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-orange-500" />
                Reporte Energético
              </CardTitle>
              <CardDescription>Consumo del hub y corredor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500">Detalla flujo energético y proyecciones de abastecimiento.</p>
              <div className="flex gap-2">
                <Button onClick={generarPDF} className="flex-1 bg-blue-600"><Download className="w-4 h-4 mr-2" /> PDF</Button>
                <Button onClick={generarExcel} variant="outline" className="flex-1"><Download className="w-4 h-4 mr-2" /> Excel</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 shadow-lg bg-slate-50 border-dashed border-2">
          <CardHeader>
            <CardTitle>Mapa Interactivo del Corredor Bioceánico</CardTitle>
            <CardDescription>Visualización geográfica exclusiva para usuarios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg p-12 text-center">
              <p className="text-gray-500">(Integración de mapa disponible próximamente)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reportes;